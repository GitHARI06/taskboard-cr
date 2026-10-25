from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.db import get_db
from app.models import Task, User
from app.schemas import TaskCreate, TaskOut, TaskUpdate
from app.services.access import get_project_for, get_task_for, visible_project_ids
from app.services.notify import notify

router = APIRouter(tags=["tasks"])


@router.get("/tasks", response_model=list[TaskOut])
def list_tasks(
    project_id: Optional[int] = None,
    q: Optional[str] = Query(default=None, max_length=100),
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if project_id is not None:
        get_project_for(db, project_id, user)
        project_ids = [project_id]
    else:
        project_ids = visible_project_ids(db, user)
    if not project_ids:
        return []
    query = select(Task).where(Task.project_id.in_(project_ids))
    if q:
        query = query.where(Task.title.ilike(f"%{q}%"))
    return db.scalars(query.order_by(Task.created_at.desc()).limit(limit)).all()


@router.post("/tasks", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(data: TaskCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    project = get_project_for(db, data.project_id, user)
    task = Task(
        project_id=project.id,
        title=data.title.strip(),
        description=data.description,
        assignee_id=data.assignee_id,
        created_by=user.id,
    )
    db.add(task)
    if data.assignee_id and data.assignee_id != user.id:
        notify(data.assignee_id, f"{user.name} assigned you: {task.title}", db)
    db.commit()
    return task


@router.get("/task/{task_id}", response_model=TaskOut)
def get_task(task_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return get_task_for(db, task_id, user)


@router.patch("/tasks/{task_id}", response_model=TaskOut)
def update_task(
    task_id: int, data: TaskUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)
):
    task = get_task_for(db, task_id, user)
    changes = data.model_dump(exclude_unset=True)
    if "title" in changes and changes["title"] is None:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Title can't be empty")
    new_assignee = changes.get("assignee_id")
    for field, value in changes.items():
        setattr(task, field, value)
    if new_assignee and new_assignee != user.id:
        notify(new_assignee, f"{user.name} assigned you: {task.title}", db)
    db.commit()
    return task


@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    task = get_task_for(db, task_id, user)
    db.delete(task)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
