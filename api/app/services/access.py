from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Project, ProjectMember, Task, User


def get_project_for(db: Session, project_id: int, user: User) -> Project:
    """The project, if the user owns it or is a member; 404 otherwise."""
    project = db.get(Project, project_id)
    if project is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Project not found")
    if project.owner_id == user.id:
        return project
    member = db.scalar(
        select(ProjectMember).where(ProjectMember.project_id == project_id, ProjectMember.user_id == user.id)
    )
    if member is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Project not found")
    return project


def get_task_for(db: Session, task_id: int, user: User) -> Task:
    task = db.get(Task, task_id)
    if task is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Task not found")
    get_project_for(db, task.project_id, user)
    return task


def visible_project_ids(db: Session, user: User) -> list[int]:
    owned = db.scalars(select(Project.id).where(Project.owner_id == user.id))
    joined = db.scalars(select(ProjectMember.project_id).where(ProjectMember.user_id == user.id))
    return sorted(set(owned) | set(joined))
