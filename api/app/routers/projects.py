from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.db import get_db
from app.models import Project, ProjectMember, User
from app.schemas import MemberAdd, MemberOut, ProjectCreate, ProjectOut
from app.services.access import get_project_for, visible_project_ids
from app.services.notify import notify

router = APIRouter(tags=["projects"])


@router.get("/projects", response_model=list[ProjectOut])
def list_projects(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    ids = visible_project_ids(db, user)
    if not ids:
        return []
    return db.scalars(select(Project).where(Project.id.in_(ids)).order_by(Project.created_at)).all()


@router.post("/projects", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(data: ProjectCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    project = Project(name=data.name.strip(), owner_id=user.id)
    db.add(project)
    db.commit()
    return project


@router.get("/projects/{project_id}/members", response_model=list[MemberOut])
def list_members(project_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    project = get_project_for(db, project_id, user)
    owner = db.get(User, project.owner_id)
    members = [MemberOut(user_id=owner.id, name=owner.name, email=owner.email, role="owner")]
    for m in project.members:
        members.append(MemberOut(user_id=m.user.id, name=m.user.name, email=m.user.email, role=m.role))
    return members


@router.post("/projects/{project_id}/members", response_model=MemberOut, status_code=status.HTTP_201_CREATED)
def add_member(
    project_id: int, data: MemberAdd, db: Session = Depends(get_db), user: User = Depends(get_current_user)
):
    project = get_project_for(db, project_id, user)
    if project.owner_id != user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Only the owner can add members")
    invitee = db.scalar(select(User).where(User.email == data.email.strip().lower()))
    if invitee is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No user with that email")
    if invitee.id == project.owner_id or any(m.user_id == invitee.id for m in project.members):
        raise HTTPException(status.HTTP_409_CONFLICT, "Already a member")
    db.add(ProjectMember(project_id=project.id, user_id=invitee.id, role=data.role))
    notify(invitee.id, f"{user.name} added you to {project.name}", db)
    db.commit()
    return MemberOut(user_id=invitee.id, name=invitee.name, email=invitee.email, role=data.role)
