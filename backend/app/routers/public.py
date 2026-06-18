from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Staff, StaffClass, User, UserStatus
from app.schemas import PublicStaffOut

router = APIRouter(prefix="/public", tags=["public"])

LEADERSHIP_POSITIONS = {
    "Principal",
    "Vice Principal",
    "Headmaster",
    "Deputy Headmaster",
    "Administrator",
}


def _public_staff_out(staff: Staff) -> PublicStaffOut:
    return PublicStaffOut(
        id=staff.id,
        first_name=staff.first_name,
        last_name=staff.last_name,
        department=staff.department,
        position=staff.position,
        class_names=[link.class_.name for link in staff.staff_classes],
    )


def _active_staff_query(db: Session):
    return (
        db.query(Staff)
        .join(User)
        .options(joinedload(Staff.staff_classes).joinedload(StaffClass.class_))
        .filter(User.status == UserStatus.ACTIVE)
        .order_by(Staff.last_name, Staff.first_name)
    )


@router.get("/staff/teachers", response_model=list[PublicStaffOut])
def list_public_teachers(db: Annotated[Session, Depends(get_db)]):
    staff_list = _active_staff_query(db).all()
    teachers = [
        staff
        for staff in staff_list
        if staff.department != "Administration"
        and (staff.position or "") not in LEADERSHIP_POSITIONS
    ]
    return [_public_staff_out(s) for s in teachers]
