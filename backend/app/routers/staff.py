from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.auth.deps import CurrentUser, require_role
from app.database import get_db
from app.models import (
    Announcement,
    Assignment,
    Attendance,
    AttendanceStatus,
    Result,
    ResultScore,
    ResultStatus,
    Role,
    Staff,
    StaffClass,
    Student,
)
from app.schemas import (
    AnnouncementOut,
    ClassOut,
    CreateAssignmentRequest,
    MarkAttendanceRequest,
    PostAnnouncementRequest,
    SaveResultRequest,
    StaffAssignmentOut,
    StaffResultOut,
    StudentSummaryOut,
)

router = APIRouter(prefix="/staff", tags=["staff"])


@router.get("/classes", response_model=list[ClassOut])
def list_classes(
    current_user: Annotated[CurrentUser, Depends(require_role(Role.STAFF))],
    db: Annotated[Session, Depends(get_db)],
):
    staff_classes = (
        db.query(StaffClass)
        .options(joinedload(StaffClass.class_))
        .filter(StaffClass.staff_id == current_user.profile_id)
        .all()
    )

    output: list[ClassOut] = []
    for link in staff_classes:
        student_count = db.query(Student).filter(Student.class_id == link.class_id).count()
        output.append(
            ClassOut(
                id=link.class_.id,
                name=link.class_.name,
                level=link.class_.level,
                section=link.class_.section,
                student_count=student_count,
            )
        )
    return output


@router.get("/students", response_model=list[StudentSummaryOut])
def list_students(
    current_user: Annotated[CurrentUser, Depends(require_role(Role.STAFF))],
    db: Annotated[Session, Depends(get_db)],
    class_id: str | None = None,
):
    query = db.query(Student).options(joinedload(Student.class_))

    if class_id:
        assigned = (
            db.query(StaffClass)
            .filter(StaffClass.staff_id == current_user.profile_id, StaffClass.class_id == class_id)
            .first()
        )
        if not assigned:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Class not assigned")
        query = query.filter(Student.class_id == class_id)
    else:
        class_ids = [
            link.class_id
            for link in db.query(StaffClass).filter(StaffClass.staff_id == current_user.profile_id).all()
        ]
        query = query.filter(Student.class_id.in_(class_ids))

    students = query.order_by(Student.last_name).all()
    return [
        StudentSummaryOut(
            id=student.id,
            admission_number=student.admission_number,
            first_name=student.first_name,
            last_name=student.last_name,
            class_id=student.class_id,
            class_name=student.class_.name if student.class_ else None,
            guardian_name=student.guardian_name,
        )
        for student in students
    ]


@router.post("/attendance")
def mark_attendance(
    payload: MarkAttendanceRequest,
    current_user: Annotated[CurrentUser, Depends(require_role(Role.STAFF))],
    db: Annotated[Session, Depends(get_db)],
):
    assigned = (
        db.query(StaffClass)
        .filter(
            StaffClass.staff_id == current_user.profile_id,
            StaffClass.class_id == payload.class_id,
        )
        .first()
    )
    if not assigned:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Class not assigned")

    attendance_date = payload.date.date()
    for record in payload.records:
        student_id = record.get("student_id")
        status_value = record.get("status")
        if not student_id or not status_value:
            continue

        existing = (
            db.query(Attendance)
            .filter(Attendance.student_id == student_id, Attendance.date == attendance_date)
            .first()
        )
        if existing:
            existing.status = AttendanceStatus(status_value)
            existing.staff_id = current_user.profile_id
        else:
            db.add(
                Attendance(
                    student_id=student_id,
                    class_id=payload.class_id,
                    session_id=payload.session_id,
                    term_id=payload.term_id,
                    staff_id=current_user.profile_id,
                    date=attendance_date,
                    status=AttendanceStatus(status_value),
                )
            )

    db.commit()
    return {"message": "Attendance saved."}


@router.post("/assignments")
def create_assignment(
    payload: CreateAssignmentRequest,
    current_user: Annotated[CurrentUser, Depends(require_role(Role.STAFF))],
    db: Annotated[Session, Depends(get_db)],
):
    assigned = (
        db.query(StaffClass)
        .filter(
            StaffClass.staff_id == current_user.profile_id,
            StaffClass.class_id == payload.class_id,
        )
        .first()
    )
    if not assigned:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Class not assigned")

    assignment = Assignment(
        title=payload.title,
        description=payload.description,
        class_id=payload.class_id,
        subject_id=payload.subject_id,
        session_id=payload.session_id,
        term_id=payload.term_id,
        staff_id=current_user.profile_id,
        due_date=payload.due_date,
        file_url=payload.file_url,
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return {"id": assignment.id, "message": "Assignment created."}


@router.post("/results")
def save_result(
    payload: SaveResultRequest,
    current_user: Annotated[CurrentUser, Depends(require_role(Role.STAFF))],
    db: Annotated[Session, Depends(get_db)],
):
    if not payload.class_id:
        student = db.query(Student).filter(Student.id == payload.student_id).first()
        payload_class_id = student.class_id if student else None
    else:
        payload_class_id = payload.class_id

    if not payload_class_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Student has no class assigned")

    result = (
        db.query(Result)
        .filter(Result.student_id == payload.student_id, Result.term_id == payload.term_id)
        .first()
    )

    total = sum(float(item.get("score", 0)) for item in payload.scores)
    average = round(total / len(payload.scores), 2) if payload.scores else 0
    grade = "A" if average >= 70 else "B" if average >= 60 else "C"

    if not result:
        result = Result(
            student_id=payload.student_id,
            class_id=payload_class_id,
            session_id=payload.session_id,
            term_id=payload.term_id,
            staff_id=current_user.profile_id,
        )
        db.add(result)
        db.flush()
    else:
        result.staff_id = current_user.profile_id

    result.total_score = total
    result.average = average
    result.grade = grade
    result.remark = payload.remark
    result.status = ResultStatus.PUBLISHED if payload.publish else ResultStatus.DRAFT
    result.published_at = datetime.now(timezone.utc) if payload.publish else None

    db.query(ResultScore).filter(ResultScore.result_id == result.id).delete()
    for item in payload.scores:
        subject_id = item.get("subject_id")
        score = item.get("score")
        if not subject_id or score is None:
            continue
        db.add(
            ResultScore(
                result_id=result.id,
                subject_id=subject_id,
                score=float(score),
                grade="A" if float(score) >= 70 else "B",
            )
        )

    db.commit()
    return {"id": result.id, "message": "Result saved."}


@router.post("/announcements")
def post_announcement(
    payload: PostAnnouncementRequest,
    current_user: Annotated[CurrentUser, Depends(require_role(Role.STAFF))],
    db: Annotated[Session, Depends(get_db)],
):
    announcement = Announcement(
        title=payload.title,
        content=payload.content,
        audience=payload.audience,
        staff_id=current_user.profile_id,
    )
    db.add(announcement)
    db.commit()
    return {"id": announcement.id, "message": "Announcement posted."}


@router.get("/assignments", response_model=list[StaffAssignmentOut])
def list_assignments(
    current_user: Annotated[CurrentUser, Depends(require_role(Role.STAFF))],
    db: Annotated[Session, Depends(get_db)],
):
    assignments = (
        db.query(Assignment)
        .options(joinedload(Assignment.subject), joinedload(Assignment.class_))
        .filter(Assignment.staff_id == current_user.profile_id)
        .order_by(Assignment.due_date.desc())
        .all()
    )
    return [
        StaffAssignmentOut(
            id=a.id,
            title=a.title,
            class_name=a.class_.name,
            subject_name=a.subject.name,
            due_date=a.due_date,
        )
        for a in assignments
    ]


@router.get("/results", response_model=list[StaffResultOut])
def list_results(
    current_user: Annotated[CurrentUser, Depends(require_role(Role.STAFF))],
    db: Annotated[Session, Depends(get_db)],
):
    results = (
        db.query(Result)
        .options(joinedload(Result.student), joinedload(Result.term))
        .filter(Result.staff_id == current_user.profile_id)
        .order_by(Result.updated_at.desc())
        .limit(20)
        .all()
    )
    return [
        StaffResultOut(
            id=r.id,
            student_name=f"{r.student.first_name} {r.student.last_name}",
            term_name=r.term.name,
            average=r.average,
            grade=r.grade,
            status=r.status,
        )
        for r in results
    ]


@router.get("/announcements", response_model=list[AnnouncementOut])
def list_announcements(
    current_user: Annotated[CurrentUser, Depends(require_role(Role.STAFF))],
    db: Annotated[Session, Depends(get_db)],
):
    announcements = (
        db.query(Announcement)
        .options(joinedload(Announcement.staff))
        .order_by(Announcement.created_at.desc())
        .limit(20)
        .all()
    )
    return [
        AnnouncementOut(
            id=a.id,
            title=a.title,
            content=a.content,
            audience=a.audience,
            posted_by=f"{a.staff.first_name} {a.staff.last_name}" if a.staff else "School",
            created_at=a.created_at,
        )
        for a in announcements
    ]


@router.get("/me")
def get_profile(
    current_user: Annotated[CurrentUser, Depends(require_role(Role.STAFF))],
    db: Annotated[Session, Depends(get_db)],
):
    staff = (
        db.query(Staff)
        .options(joinedload(Staff.staff_classes).joinedload(StaffClass.class_))
        .filter(Staff.id == current_user.profile_id)
        .first()
    )
    if not staff:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Staff not found")

    class_ids = [link.class_id for link in staff.staff_classes]
    student_count = db.query(Student).filter(Student.class_id.in_(class_ids)).count() if class_ids else 0
    assignment_count = db.query(Assignment).filter(Assignment.staff_id == staff.id).count()
    announcement_count = db.query(Announcement).filter(Announcement.staff_id == staff.id).count()

    return {
        "id": staff.id,
        "staff_id": staff.staff_id,
        "first_name": staff.first_name,
        "last_name": staff.last_name,
        "department": staff.department,
        "position": staff.position,
        "phone": staff.phone,
        "classes": [
            {
                "id": link.class_.id,
                "name": link.class_.name,
                "level": link.class_.level,
                "section": link.class_.section,
            }
            for link in staff.staff_classes
        ],
        "stats": {
            "class_count": len(staff.staff_classes),
            "student_count": student_count,
            "assignment_count": assignment_count,
            "announcement_count": announcement_count,
        },
    }
