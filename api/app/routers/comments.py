from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.db import get_db
from app.models import Comment, User
from app.schemas import CommentCreate, CommentOut
from app.services.access import get_task_for
from app.services.notify import notify

router = APIRouter(tags=["comments"])


@router.get("/tasks/{task_id}/comments", response_model=list[CommentOut])
def list_comments(task_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    get_task_for(db, task_id, user)
    return db.scalars(select(Comment).where(Comment.task_id == task_id).order_by(Comment.created_at)).all()


@router.post("/tasks/{task_id}/comments", response_model=CommentOut, status_code=status.HTTP_201_CREATED)
def add_comment(
    task_id: int, data: CommentCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)
):
    task = get_task_for(db, task_id, user)
    comment = Comment(task_id=task.id, author_id=user.id, body=data.body.strip())
    db.add(comment)
    for recipient in {task.assignee_id, task.created_by} - {None, user.id}:
        notify(user_id=recipient, message=f"{user.name} commented on {task.title}", db=db)
    db.commit()
    return comment
