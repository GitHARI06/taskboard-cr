from sqlalchemy.orm import Session

from app.models import Notification


def notify(user_id: int, message: str, db: Session) -> None:
    """Queue an in-app notification for a user. The caller commits."""
    db.add(Notification(user_id=user_id, message=message[:500]))
