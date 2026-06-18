"""Extended admin student endpoints."""

from datetime import datetime, timedelta, timezone

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.admin_helpers import get_or_create_settings, log_admin_activity
from app.auth.deps import CurrentUser, require_role
from app.database import get_db
from app.models import (
    AdminActivityLog,
    Attendance,
    AttendanceStatus,
    Class,
    FeePayment,
    Result,
    ResultScore,
    Role,
    Student,
    StudentPromotionHistory,
    UserStatus,
)
from app.routers.admin import _student_out, _validate_class_id
from app.schemas_admin import (
    PromotePreviewItem,
    PromoteResultOut,
    PromoteStudentsRequest,
    PromotionHistoryOut,
    StudentActivityItemOut,
    StudentAttendanceOut,
    StudentAttendanceRecordOut,
    StudentDeleteCheckOut,
    StudentOut,
    StudentProfileOut,
    StudentResultRecordOut,
    StudentResultScoreOut,
    StudentResultSummary,
    StudentResultsOut,
    StudentStatsOut,
)
from app.student_promotion import next_class_name

router = APIRouter(prefix="/admin/students", tags=["admin-students"])


def _get_student_or_404(db: Session, student_id: str) -> Student:
    student = (
        db.query(Student)
        .options(joinedload(Student.user), joinedload(Student.class_))
        .filter(Student.id == student_id, Student.is_deleted.is_(False))
        .first()
    )
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@router.get("/stats", response_model=StudentStatsOut)
def student_stats(
    _: Annotated[CurrentUser, Depends(require_role(Role.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    students = (
        db.query(Student)
        .options(joinedload(Student.user))
        .filter(Student.is_deleted.is_(False))
        .all()
    )
    term_start = datetime.now(timezone.utc) - timedelta(days=120)
    male = sum(1 for s in students if (s.gender or "").lower() == "male")
    female = sum(1 for s in students if (s.gender or "").lower() == "female")
    active = sum(
        1 for s in students if s.user.status == UserStatus.ACTIVE and not s.is_archived
    )
    inactive = sum(
        1 for s in students if s.user.status == UserStatus.SUSPENDED and not s.is_archived
    )
    archived = sum(1 for s in students if s.is_archived)
    new_this_term = sum(
        1
        for s in students
        if s.created_at
        and (s.created_at.replace(tzinfo=timezone.utc) if s.created_at.tzinfo is None else s.created_at)
        >= term_start
    )
    return StudentStatsOut(
        total=len(students),
        male=male,
        female=female,
        active=active,
        inactive=inactive,
        archived=archived,
        new_this_term=new_this_term,
    )


@router.get("/archived", response_model=list[StudentOut])
def list_archived_students(
    _: Annotated[CurrentUser, Depends(require_role(Role.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    students = (
        db.query(Student)
        .options(joinedload(Student.user), joinedload(Student.class_))
        .filter(Student.is_archived.is_(True), Student.is_deleted.is_(False))
        .order_by(Student.updated_at.desc())
        .all()
    )
    return [_student_out(s) for s in students]


@router.get("/{student_id}/profile", response_model=StudentProfileOut)
def student_profile(
    student_id: str,
    admin_user: Annotated[CurrentUser, Depends(require_role(Role.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    student = _get_student_or_404(db, student_id)

    attendance_rows = db.query(Attendance).filter(Attendance.student_id == student_id).all()
    present = sum(1 for r in attendance_rows if r.status == AttendanceStatus.PRESENT)
    absent = sum(1 for r in attendance_rows if r.status == AttendanceStatus.ABSENT)
    late = sum(1 for r in attendance_rows if r.status == AttendanceStatus.LATE)
    total_days = len(attendance_rows)
    attendance_percent = round((present / total_days) * 100, 1) if total_days else 0.0

    latest_result = (
        db.query(Result)
        .options(joinedload(Result.scores).joinedload(ResultScore.subject), joinedload(Result.term))
        .filter(Result.student_id == student_id)
        .order_by(Result.created_at.desc())
        .first()
    )

    latest_results: list[StudentResultSummary] = []
    average_score = None
    class_position = None
    if latest_result:
        average_score = latest_result.average
        class_position = latest_result.position
        for score in latest_result.scores:
            latest_results.append(
                StudentResultSummary(
                    subject_name=score.subject.name if score.subject else "Subject",
                    score=score.score,
                    grade=score.grade,
                    remark=score.remark,
                    term_name=latest_result.term.name if latest_result.term else None,
                )
            )

    recent_attendance_rows = (
        db.query(Attendance)
        .options(joinedload(Attendance.term), joinedload(Attendance.session))
        .filter(Attendance.student_id == student_id)
        .order_by(Attendance.date.desc())
        .limit(10)
        .all()
    )
    recent_attendance = [
        StudentAttendanceRecordOut(
            id=r.id,
            date=r.date.isoformat(),
            status=r.status.value,
            remark=r.remark,
            term_name=r.term.name if r.term else None,
            session_name=r.session.name if r.session else None,
        )
        for r in recent_attendance_rows
    ]

    activity_rows = (
        db.query(AdminActivityLog)
        .filter(
            AdminActivityLog.entity_type == "student",
            AdminActivityLog.entity_id == student_id,
        )
        .order_by(AdminActivityLog.created_at.desc())
        .limit(10)
        .all()
    )
    recent_activities = [
        StudentActivityItemOut(
            id=a.id,
            action=a.action,
            admin_name=a.admin_name,
            details=a.details,
            created_at=a.created_at,
        )
        for a in activity_rows
    ]

    settings = get_or_create_settings(db)
    return StudentProfileOut(
        student=_student_out(student),
        academic_session=settings.academic_session,
        attendance_present=present,
        attendance_absent=absent,
        attendance_late=late,
        attendance_percent=attendance_percent,
        average_score=average_score,
        class_position=class_position,
        latest_results=latest_results,
        recent_activities=recent_activities,
        recent_attendance=recent_attendance,
    )


@router.post("/{student_id}/view-log")
def log_student_view(
    student_id: str,
    admin_user: Annotated[CurrentUser, Depends(require_role(Role.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    student = _get_student_or_404(db, student_id)
    log_admin_activity(
        db,
        admin_user,
        action="VIEW",
        entity_type="student",
        entity_id=student.id,
        details=f"{student.first_name} {student.last_name}",
    )
    db.commit()
    return {"message": "Logged"}


@router.get("/{student_id}/attendance", response_model=StudentAttendanceOut)
def student_attendance(
    student_id: str,
    _: Annotated[CurrentUser, Depends(require_role(Role.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
    month: str | None = Query(None, description="YYYY-MM"),
    session_name: str | None = None,
    term_name: str | None = None,
):
    _get_student_or_404(db, student_id)

    query = (
        db.query(Attendance)
        .options(joinedload(Attendance.term), joinedload(Attendance.session))
        .filter(Attendance.student_id == student_id)
    )

    all_rows = query.order_by(Attendance.date.desc()).all()

    sessions = sorted({r.session.name for r in all_rows if r.session})
    terms = sorted({r.term.name for r in all_rows if r.term})

    filtered = all_rows
    if session_name:
        filtered = [r for r in filtered if r.session and r.session.name == session_name]
    if term_name:
        filtered = [r for r in filtered if r.term and r.term.name == term_name]
    if month:
        filtered = [r for r in filtered if r.date.strftime("%Y-%m") == month]

    present = sum(1 for r in filtered if r.status == AttendanceStatus.PRESENT)
    absent = sum(1 for r in filtered if r.status == AttendanceStatus.ABSENT)
    late = sum(1 for r in filtered if r.status == AttendanceStatus.LATE)
    excused = sum(1 for r in filtered if r.status == AttendanceStatus.EXCUSED)
    total = len(filtered)
    percent = round((present / total) * 100, 1) if total else 0.0

    records = [
        StudentAttendanceRecordOut(
            id=r.id,
            date=r.date.isoformat(),
            status=r.status.value,
            remark=r.remark,
            term_name=r.term.name if r.term else None,
            session_name=r.session.name if r.session else None,
        )
        for r in filtered
    ]

    return StudentAttendanceOut(
        present=present,
        absent=absent,
        late=late,
        excused=excused,
        total=total,
        percent=percent,
        records=records,
        sessions=sessions,
        terms=terms,
    )


@router.get("/{student_id}/results", response_model=StudentResultsOut)
def student_results(
    student_id: str,
    _: Annotated[CurrentUser, Depends(require_role(Role.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
    session_name: str | None = None,
    term_name: str | None = None,
    search: str | None = None,
):
    _get_student_or_404(db, student_id)

    results = (
        db.query(Result)
        .options(
            joinedload(Result.scores).joinedload(ResultScore.subject),
            joinedload(Result.term),
            joinedload(Result.session),
            joinedload(Result.class_),
        )
        .filter(Result.student_id == student_id)
        .order_by(Result.created_at.desc())
        .all()
    )

    sessions = sorted({r.session.name for r in results if r.session})
    terms = sorted({r.term.name for r in results if r.term})

    filtered = results
    if session_name:
        filtered = [r for r in filtered if r.session and r.session.name == session_name]
    if term_name:
        filtered = [r for r in filtered if r.term and r.term.name == term_name]
    if search:
        q = search.lower()
        filtered = [
            r
            for r in filtered
            if q in (r.term.name if r.term else "").lower()
            or q in (r.session.name if r.session else "").lower()
            or any(q in (s.subject.name if s.subject else "").lower() for s in r.scores)
        ]

    out = []
    for result in filtered:
        out.append(
            StudentResultRecordOut(
                id=result.id,
                term_name=result.term.name if result.term else "",
                session_name=result.session.name if result.session else "",
                class_name=result.class_.name if result.class_ else "",
                average=result.average,
                grade=result.grade,
                position=result.position,
                remark=result.remark,
                status=result.status.value,
                published_at=result.published_at,
                scores=[
                    StudentResultScoreOut(
                        subject_name=s.subject.name if s.subject else "Subject",
                        subject_code=s.subject.code if s.subject else "",
                        score=s.score,
                        grade=s.grade,
                        remark=s.remark,
                    )
                    for s in result.scores
                ],
            )
        )

    return StudentResultsOut(results=out, sessions=sessions, terms=terms)


@router.get("/{student_id}/delete-check", response_model=StudentDeleteCheckOut)
def student_delete_check(
    student_id: str,
    _: Annotated[CurrentUser, Depends(require_role(Role.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    _get_student_or_404(db, student_id)
    results_count = db.query(Result).filter(Result.student_id == student_id).count()
    attendance_count = db.query(Attendance).filter(Attendance.student_id == student_id).count()
    fee_count = db.query(FeePayment).filter(FeePayment.student_id == student_id).count()
    has_records = results_count > 0 or attendance_count > 0 or fee_count > 0
    return StudentDeleteCheckOut(
        results_count=results_count,
        attendance_count=attendance_count,
        fee_count=fee_count,
        has_records=has_records,
    )


@router.get("/{student_id}/promotion-history", response_model=list[PromotionHistoryOut])
def promotion_history(
    student_id: str,
    _: Annotated[CurrentUser, Depends(require_role(Role.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    _get_student_or_404(db, student_id)
    rows = (
        db.query(StudentPromotionHistory)
        .filter(StudentPromotionHistory.student_id == student_id)
        .order_by(StudentPromotionHistory.created_at.desc())
        .all()
    )
    return [
        PromotionHistoryOut(
            id=r.id,
            from_class_name=r.from_class_name,
            to_class_name=r.to_class_name,
            promoted_by_name=r.promoted_by_name,
            created_at=r.created_at,
        )
        for r in rows
    ]


@router.get("/{student_id}/activities", response_model=list[StudentActivityItemOut])
def student_activities(
    student_id: str,
    _: Annotated[CurrentUser, Depends(require_role(Role.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    _get_student_or_404(db, student_id)
    rows = (
        db.query(AdminActivityLog)
        .filter(
            AdminActivityLog.entity_type == "student",
            AdminActivityLog.entity_id == student_id,
        )
        .order_by(AdminActivityLog.created_at.desc())
        .limit(50)
        .all()
    )
    return [
        StudentActivityItemOut(
            id=a.id,
            action=a.action,
            admin_name=a.admin_name,
            details=a.details,
            created_at=a.created_at,
        )
        for a in rows
    ]


def _promote_preview(db: Session, student: Student) -> PromotePreviewItem:
    from_class = student.class_.name if student.class_ else None
    to_class = next_class_name(from_class)
    name = f"{student.first_name} {student.last_name}"
    if not from_class:
        return PromotePreviewItem(
            student_id=student.id,
            student_name=name,
            from_class=None,
            to_class=to_class,
            can_promote=False,
            reason="No class assigned",
        )
    if not to_class:
        return PromotePreviewItem(
            student_id=student.id,
            student_name=name,
            from_class=from_class,
            to_class=None,
            can_promote=False,
            reason="Already in final class (Primary 3)",
        )
    return PromotePreviewItem(
        student_id=student.id,
        student_name=name,
        from_class=from_class,
        to_class=to_class,
        can_promote=True,
    )


@router.post("/promote/preview", response_model=list[PromotePreviewItem])
def promote_preview(
    payload: PromoteStudentsRequest,
    _: Annotated[CurrentUser, Depends(require_role(Role.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    students = _students_for_promotion(db, payload)
    return [_promote_preview(db, s) for s in students]


@router.post("/promote", response_model=PromoteResultOut)
def promote_students(
    payload: PromoteStudentsRequest,
    admin_user: Annotated[CurrentUser, Depends(require_role(Role.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    students = _students_for_promotion(db, payload)
    items: list[PromotePreviewItem] = []
    promoted = 0
    skipped = 0

    for student in students:
        preview = _promote_preview(db, student)
        items.append(preview)
        if not preview.can_promote or not preview.to_class:
            skipped += 1
            continue

        target = db.query(Class).filter(Class.name == preview.to_class).first()
        if not target:
            preview.can_promote = False
            preview.reason = f"Target class {preview.to_class} not found"
            skipped += 1
            continue

        old_class = preview.from_class
        student.class_id = target.id
        promoted += 1

        db.add(
            StudentPromotionHistory(
                student_id=student.id,
                from_class_name=old_class,
                to_class_name=preview.to_class,
                promoted_by_user_id=admin_user.user_id,
                promoted_by_name=admin_user.display_name,
            )
        )

        log_admin_activity(
            db,
            admin_user,
            action="PROMOTE",
            entity_type="student",
            entity_id=student.id,
            details=f"{student.first_name} {student.last_name}: {old_class} → {preview.to_class}",
        )

    db.commit()
    return PromoteResultOut(promoted=promoted, skipped=skipped, items=items)


def _students_for_promotion(db: Session, payload: PromoteStudentsRequest) -> list[Student]:
    query = (
        db.query(Student)
        .options(joinedload(Student.class_))
        .filter(Student.is_deleted.is_(False), Student.is_archived.is_(False))
    )
    if payload.student_ids:
        return query.filter(Student.id.in_(payload.student_ids)).all()
    if payload.class_name:
        class_row = db.query(Class).filter(Class.name == payload.class_name).first()
        if not class_row:
            return []
        return query.filter(Student.class_id == class_row.id).all()
    return []


@router.post("/{student_id}/archive")
def archive_student(
    student_id: str,
    admin_user: Annotated[CurrentUser, Depends(require_role(Role.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    student = _get_student_or_404(db, student_id)
    if student.is_archived:
        return {"message": "Student already archived"}
    student.is_archived = True
    student.user.status = UserStatus.SUSPENDED
    log_admin_activity(
        db,
        admin_user,
        action="ARCHIVE",
        entity_type="student",
        entity_id=student.id,
        details=f"{student.first_name} {student.last_name}",
    )
    db.commit()
    return {"message": "Student archived"}


@router.post("/{student_id}/restore")
def restore_student(
    student_id: str,
    admin_user: Annotated[CurrentUser, Depends(require_role(Role.ADMIN))],
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
    if not student.is_archived:
        return {"message": "Student is not archived"}
    student.is_archived = False
    student.user.status = UserStatus.ACTIVE
    log_admin_activity(
        db,
        admin_user,
        action="RESTORE",
        entity_type="student",
        entity_id=student.id,
        details=f"{student.first_name} {student.last_name}",
    )
    db.commit()
    return {"message": "Student restored", "student": _student_out(student)}
