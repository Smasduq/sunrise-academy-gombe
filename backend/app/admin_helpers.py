from sqlalchemy.orm import Session

from app.auth.deps import CurrentUser
from app.models import AcademicSession, AdminActivityLog, SchoolSettings, Term


def log_admin_activity(
    db: Session,
    user: CurrentUser,
    *,
    action: str,
    entity_type: str,
    entity_id: str | None = None,
    details: str | None = None,
) -> None:
    db.add(
        AdminActivityLog(
            admin_user_id=user.user_id,
            admin_name=user.display_name,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            details=details,
        )
    )


def get_or_create_settings(db: Session) -> SchoolSettings:
    settings = db.query(SchoolSettings).filter(SchoolSettings.id == "default").first()
    if settings:
        return settings

    session = db.query(AcademicSession).filter(AcademicSession.is_current.is_(True)).first()
    term = db.query(Term).filter(Term.is_current.is_(True)).first()
    settings = SchoolSettings(
        id="default",
        school_name="Sunrise Academy Gombe",
        academic_session=session.name if session else None,
        current_term=term.name if term else None,
    )
    db.add(settings)
    db.commit()
    db.refresh(settings)
    return settings
