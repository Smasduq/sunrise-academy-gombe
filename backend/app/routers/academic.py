from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.deps import CurrentUser, require_role
from app.database import get_db
from app.models import AcademicSession, Role, Subject, Term
from app.schemas import SubjectOut

router = APIRouter(prefix="/academic", tags=["academic"])


@router.get("/current")
def get_current_academic(
    _: Annotated[CurrentUser, Depends(require_role(Role.STAFF, Role.STUDENT))],
    db: Annotated[Session, Depends(get_db)],
):
    session = db.query(AcademicSession).filter(AcademicSession.is_current.is_(True)).first()
    term = db.query(Term).filter(Term.is_current.is_(True)).first()
    return {
        "session": (
            {"id": session.id, "name": session.name}
            if session
            else None
        ),
        "term": (
            {"id": term.id, "name": term.name}
            if term
            else None
        ),
    }


@router.get("/subjects", response_model=list[SubjectOut])
def list_subjects(
    _: Annotated[CurrentUser, Depends(require_role(Role.STAFF))],
    db: Annotated[Session, Depends(get_db)],
):
    subjects = db.query(Subject).order_by(Subject.name).all()
    return [SubjectOut(id=s.id, name=s.name, code=s.code) for s in subjects]
