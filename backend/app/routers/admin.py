from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import Annotated

from app.admin_helpers import log_admin_activity
from app.auth.deps import CurrentUser, require_role
from app.auth.security import hash_password
from app.database import get_db
from app.models import Class, Role, Staff, StaffClass, Student, User, UserStatus
from app.school_classes import SCHOOL_CLASS_NAMES, sort_school_classes
from app.schemas_admin import (
    AdminStatsOut,
    ClassOption,
    StaffCreateRequest,
    StaffOut,
    StaffUpdateRequest,
    StudentCreateRequest,
    StudentOut,
    StudentUpdateRequest,
)

router = APIRouter(prefix="/admin", tags=["admin"])


def _student_out(student: Student) -> StudentOut:
    return StudentOut(
        id=student.id,
        user_id=student.user_id,
        admission_number=student.admission_number,
        first_name=student.first_name,
        last_name=student.last_name,
        middle_name=student.middle_name,
        class_id=student.class_id,
        class_name=student.class_.name if student.class_ else None,
        guardian_name=student.guardian_name,
        mother_name=student.mother_name,
        guardian_phone=student.guardian_phone,
        guardian_email=student.guardian_email,
        guardian_relationship=student.guardian_relationship,
        emergency_contact=student.emergency_contact,
        gender=student.gender,
        address=student.address,
        photo_url=student.photo_url,
        date_of_birth=student.date_of_birth,
        admission_date=student.admission_date,
        is_archived=bool(student.is_archived),
        status=student.user.status,
        created_at=student.created_at,
        updated_at=student.updated_at,
    )


def _staff_out(staff: Staff) -> StaffOut:
    return StaffOut(
        id=staff.id,
        user_id=staff.user_id,
        staff_id=staff.staff_id,
        first_name=staff.first_name,
        last_name=staff.last_name,
        department=staff.department,
        position=staff.position,
        phone=staff.phone,
        status=staff.user.status,
        class_ids=[link.class_id for link in staff.staff_classes],
        class_names=[link.class_.name for link in staff.staff_classes],
        created_at=staff.created_at,
    )


def _sync_staff_classes(db: Session, staff: Staff, class_ids: list[str]) -> None:
    db.query(StaffClass).filter(StaffClass.staff_id == staff.id).delete()
    for class_id in class_ids:
        cls = db.query(Class).filter(Class.id == class_id).first()
        if cls and cls.name in SCHOOL_CLASS_NAMES:
            db.add(StaffClass(staff_id=staff.id, class_id=class_id))


def _validate_class_id(db: Session, class_id: str | None) -> None:
    if not class_id:
        return
    cls = db.query(Class).filter(Class.id == class_id).first()
    if not cls or cls.name not in SCHOOL_CLASS_NAMES:
        raise HTTPException(
            status_code=400,
            detail="Invalid class. Choose Nursery 1, Nursery 2, Primary 1, Primary 2, or Primary 3.",
        )


@router.get("/stats", response_model=AdminStatsOut)
def get_stats(
    _: Annotated[CurrentUser, Depends(require_role(Role.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    return AdminStatsOut(
        students=db.query(Student).filter(Student.is_deleted.is_(False)).count(),
        staff=db.query(Staff).count(),
        classes=len(sort_school_classes(db.query(Class).all())),
    )


@router.get("/classes", response_model=list[ClassOption])
def list_classes(
    _: Annotated[CurrentUser, Depends(require_role(Role.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    classes = sort_school_classes(db.query(Class).all())
    return [
        ClassOption(id=c.id, name=c.name, level=c.level, section=c.section) for c in classes
    ]


@router.get("/students", response_model=list[StudentOut])
def list_students(
    _: Annotated[CurrentUser, Depends(require_role(Role.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    students = (
        db.query(Student)
        .options(joinedload(Student.user), joinedload(Student.class_))
        .filter(Student.is_deleted.is_(False))
        .order_by(Student.last_name)
        .all()
    )
    return [_student_out(s) for s in students]


@router.post("/students", response_model=StudentOut, status_code=status.HTTP_201_CREATED)
def create_student(
    payload: StudentCreateRequest,
    admin_user: Annotated[CurrentUser, Depends(require_role(Role.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    if db.query(Student).filter(Student.admission_number == payload.admission_number.upper()).first():
        raise HTTPException(status_code=400, detail="Admission number already exists")

    _validate_class_id(db, payload.class_id)

    student_user = User(
        password_hash=hash_password(payload.password),
        role=Role.STUDENT,
        status=payload.status,
    )
    db.add(student_user)
    db.flush()

    student = Student(
        user_id=student_user.id,
        admission_number=payload.admission_number.upper(),
        first_name=payload.first_name,
        last_name=payload.last_name,
        middle_name=payload.middle_name,
        class_id=payload.class_id,
        guardian_name=payload.guardian_name,
        mother_name=payload.mother_name,
        guardian_phone=payload.guardian_phone,
        guardian_email=payload.guardian_email,
        guardian_relationship=payload.guardian_relationship,
        emergency_contact=payload.emergency_contact,
        gender=payload.gender,
        address=payload.address,
        photo_url=payload.photo_url,
        date_of_birth=payload.date_of_birth,
        admission_date=payload.admission_date,
    )
    db.add(student)
    log_admin_activity(
        db,
        admin_user,
        action="CREATE",
        entity_type="student",
        entity_id=student.id,
        details=f"{student.first_name} {student.last_name}",
    )
    db.commit()
    db.refresh(student)
    student = (
        db.query(Student)
        .options(joinedload(Student.user), joinedload(Student.class_))
        .filter(Student.id == student.id)
        .first()
    )
    return _student_out(student)


@router.get("/students/{student_id}", response_model=StudentOut)
def get_student(
    student_id: str,
    _: Annotated[CurrentUser, Depends(require_role(Role.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    student = (
        db.query(Student)
        .options(joinedload(Student.user), joinedload(Student.class_))
        .filter(Student.id == student_id, Student.is_deleted.is_(False))
        .first()
    )
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return _student_out(student)


@router.put("/students/{student_id}", response_model=StudentOut)
def update_student(
    student_id: str,
    payload: StudentUpdateRequest,
    user: Annotated[CurrentUser, Depends(require_role(Role.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    student = (
        db.query(Student)
        .options(joinedload(Student.user), joinedload(Student.class_))
        .filter(Student.id == student_id, Student.is_deleted.is_(False))
        .first()
    )
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    if payload.admission_number:
        dup = (
            db.query(Student)
            .filter(
                Student.admission_number == payload.admission_number.upper(),
                Student.id != student_id,
            )
            .first()
        )
        if dup:
            raise HTTPException(status_code=400, detail="Admission number already exists")
        student.admission_number = payload.admission_number.upper()
    if payload.first_name:
        student.first_name = payload.first_name
    if payload.last_name:
        student.last_name = payload.last_name
    if payload.middle_name is not None:
        student.middle_name = payload.middle_name
    if payload.class_id is not None:
        _validate_class_id(db, payload.class_id or None)
        student.class_id = payload.class_id or None
    if payload.guardian_name is not None:
        student.guardian_name = payload.guardian_name
    if payload.guardian_phone is not None:
        student.guardian_phone = payload.guardian_phone
    if payload.mother_name is not None:
        student.mother_name = payload.mother_name
    if payload.guardian_email is not None:
        student.guardian_email = payload.guardian_email
    if payload.guardian_relationship is not None:
        student.guardian_relationship = payload.guardian_relationship
    if payload.emergency_contact is not None:
        student.emergency_contact = payload.emergency_contact
    if payload.gender is not None:
        student.gender = payload.gender
    if payload.address is not None:
        student.address = payload.address
    if payload.photo_url is not None:
        student.photo_url = payload.photo_url
    if payload.date_of_birth is not None:
        student.date_of_birth = payload.date_of_birth
    if payload.admission_date is not None:
        student.admission_date = payload.admission_date
    if payload.is_archived is not None:
        student.is_archived = payload.is_archived
    if payload.status:
        student.user.status = payload.status
    if payload.password:
        student.user.password_hash = hash_password(payload.password)

    log_admin_activity(
        db,
        user,
        action="UPDATE",
        entity_type="student",
        entity_id=student.id,
        details=f"{student.first_name} {student.last_name}",
    )
    db.commit()
    db.refresh(student)
    return _student_out(student)


@router.delete("/students/{student_id}")
def delete_student(
    student_id: str,
    user: Annotated[CurrentUser, Depends(require_role(Role.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    student = (
        db.query(Student)
        .options(joinedload(Student.user))
        .filter(Student.id == student_id, Student.is_deleted.is_(False))
        .first()
    )
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    student.is_deleted = True
    student.deleted_at = datetime.now(timezone.utc)
    student.is_archived = True
    student.user.status = UserStatus.SUSPENDED

    log_admin_activity(
        db,
        user,
        action="DELETE",
        entity_type="student",
        entity_id=student.id,
        details=f"{student.first_name} {student.last_name} (soft delete)",
    )
    db.commit()
    return {"message": "Student deleted"}


@router.get("/staff", response_model=list[StaffOut])
def list_staff(
    _: Annotated[CurrentUser, Depends(require_role(Role.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    staff_list = (
        db.query(Staff)
        .options(
            joinedload(Staff.user),
            joinedload(Staff.staff_classes).joinedload(StaffClass.class_),
        )
        .order_by(Staff.last_name)
        .all()
    )
    return [_staff_out(s) for s in staff_list]


@router.post("/staff", response_model=StaffOut, status_code=status.HTTP_201_CREATED)
def create_staff(
    payload: StaffCreateRequest,
    user: Annotated[CurrentUser, Depends(require_role(Role.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    if db.query(Staff).filter(Staff.staff_id == payload.staff_id.upper()).first():
        raise HTTPException(status_code=400, detail="Staff ID already exists")

    staff_user = User(
        password_hash=hash_password(payload.password),
        role=Role.STAFF,
        status=payload.status,
    )
    db.add(staff_user)
    db.flush()

    staff = Staff(
        user_id=staff_user.id,
        staff_id=payload.staff_id.upper(),
        first_name=payload.first_name,
        last_name=payload.last_name,
        department=payload.department,
        position=payload.position,
        phone=payload.phone,
    )
    db.add(staff)
    db.flush()
    _sync_staff_classes(db, staff, payload.class_ids)
    log_admin_activity(
        db,
        user,
        action="CREATE",
        entity_type="staff",
        entity_id=staff.id,
        details=f"{staff.first_name} {staff.last_name}",
    )
    db.commit()

    staff = (
        db.query(Staff)
        .options(
            joinedload(Staff.user),
            joinedload(Staff.staff_classes).joinedload(StaffClass.class_),
        )
        .filter(Staff.id == staff.id)
        .first()
    )
    return _staff_out(staff)


@router.get("/staff/{staff_id}", response_model=StaffOut)
def get_staff_member(
    staff_id: str,
    _: Annotated[CurrentUser, Depends(require_role(Role.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    staff = (
        db.query(Staff)
        .options(
            joinedload(Staff.user),
            joinedload(Staff.staff_classes).joinedload(StaffClass.class_),
        )
        .filter(Staff.id == staff_id)
        .first()
    )
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    return _staff_out(staff)


@router.put("/staff/{staff_id}", response_model=StaffOut)
def update_staff(
    staff_id: str,
    payload: StaffUpdateRequest,
    user: Annotated[CurrentUser, Depends(require_role(Role.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    staff = (
        db.query(Staff)
        .options(
            joinedload(Staff.user),
            joinedload(Staff.staff_classes).joinedload(StaffClass.class_),
        )
        .filter(Staff.id == staff_id)
        .first()
    )
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")

    if payload.staff_id:
        dup = (
            db.query(Staff)
            .filter(Staff.staff_id == payload.staff_id.upper(), Staff.id != staff_id)
            .first()
        )
        if dup:
            raise HTTPException(status_code=400, detail="Staff ID already exists")
        staff.staff_id = payload.staff_id.upper()
    if payload.first_name:
        staff.first_name = payload.first_name
    if payload.last_name:
        staff.last_name = payload.last_name
    if payload.department is not None:
        staff.department = payload.department
    if payload.position is not None:
        staff.position = payload.position
    if payload.phone is not None:
        staff.phone = payload.phone
    if payload.status:
        staff.user.status = payload.status
    if payload.password:
        staff.user.password_hash = hash_password(payload.password)
    if payload.class_ids is not None:
        _sync_staff_classes(db, staff, payload.class_ids)

    log_admin_activity(
        db,
        user,
        action="UPDATE",
        entity_type="staff",
        entity_id=staff.id,
        details=f"{staff.first_name} {staff.last_name}",
    )
    db.commit()
    db.refresh(staff)
    staff = (
        db.query(Staff)
        .options(
            joinedload(Staff.user),
            joinedload(Staff.staff_classes).joinedload(StaffClass.class_),
        )
        .filter(Staff.id == staff.id)
        .first()
    )
    return _staff_out(staff)


@router.delete("/staff/{staff_id}")
def delete_staff(
    staff_id: str,
    user: Annotated[CurrentUser, Depends(require_role(Role.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    log_admin_activity(
        db,
        user,
        action="DELETE",
        entity_type="staff",
        entity_id=staff.id,
        details=f"{staff.first_name} {staff.last_name}",
    )
    db.delete(staff.user)
    db.commit()
    return {"message": "Staff deleted"}
