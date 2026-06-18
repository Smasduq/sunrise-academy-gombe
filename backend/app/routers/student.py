from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.auth.deps import CurrentUser, require_role
from app.database import get_db
from app.models import (
    Announcement,
    AnnouncementAudience,
    Assignment,
    AssignmentStatus,
    AssignmentSubmission,
    Attendance,
    FeePayment,
    Result,
    ResultScore,
    ResultStatus,
    Role,
    Student,
)
from app.schemas import (
    AnnouncementOut,
    AssignmentOut,
    AttendanceOut,
    FeePaymentOut,
    ResultOut,
    SubjectScoreOut,
    SubmitAssignmentRequest,
)

router = APIRouter(prefix="/student", tags=["student"])


@router.get("/results", response_model=list[ResultOut])
def list_results(
    current_user: Annotated[CurrentUser, Depends(require_role(Role.STUDENT))],
    db: Annotated[Session, Depends(get_db)],
):
    results = (
        db.query(Result)
        .options(
            joinedload(Result.scores).joinedload(ResultScore.subject),
            joinedload(Result.term),
            joinedload(Result.session),
            joinedload(Result.class_),
        )
        .filter(
            Result.student_id == current_user.profile_id,
            Result.status == ResultStatus.PUBLISHED,
        )
        .order_by(Result.created_at.desc())
        .all()
    )

    return [
        ResultOut(
            id=result.id,
            term_name=result.term.name,
            session_name=result.session.name,
            class_name=result.class_.name,
            average=result.average,
            grade=result.grade,
            position=result.position,
            remark=result.remark,
            status=result.status,
            published_at=result.published_at,
            scores=[
                SubjectScoreOut(
                    subject_name=score.subject.name,
                    subject_code=score.subject.code,
                    score=score.score,
                    grade=score.grade,
                )
                for score in result.scores
            ],
        )
        for result in results
    ]


@router.get("/results/{result_id}", response_model=ResultOut)
def get_result(
    result_id: str,
    current_user: Annotated[CurrentUser, Depends(require_role(Role.STUDENT))],
    db: Annotated[Session, Depends(get_db)],
):
    result = (
        db.query(Result)
        .options(
            joinedload(Result.scores).joinedload(ResultScore.subject),
            joinedload(Result.term),
            joinedload(Result.session),
            joinedload(Result.class_),
        )
        .filter(
            Result.id == result_id,
            Result.student_id == current_user.profile_id,
            Result.status == ResultStatus.PUBLISHED,
        )
        .first()
    )
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Result not found")

    return ResultOut(
        id=result.id,
        term_name=result.term.name,
        session_name=result.session.name,
        class_name=result.class_.name,
        average=result.average,
        grade=result.grade,
        position=result.position,
        remark=result.remark,
        status=result.status,
        published_at=result.published_at,
        scores=[
            SubjectScoreOut(
                subject_name=score.subject.name,
                subject_code=score.subject.code,
                score=score.score,
                grade=score.grade,
            )
            for score in result.scores
        ],
    )


@router.get("/attendance", response_model=list[AttendanceOut])
def list_attendance(
    current_user: Annotated[CurrentUser, Depends(require_role(Role.STUDENT))],
    db: Annotated[Session, Depends(get_db)],
):
    records = (
        db.query(Attendance)
        .filter(Attendance.student_id == current_user.profile_id)
        .order_by(Attendance.date.desc())
        .all()
    )
    return [
        AttendanceOut(id=record.id, date=record.date, status=record.status, remark=record.remark)
        for record in records
    ]


@router.get("/assignments", response_model=list[AssignmentOut])
def list_assignments(
    current_user: Annotated[CurrentUser, Depends(require_role(Role.STUDENT))],
    db: Annotated[Session, Depends(get_db)],
):
    student = db.query(Student).filter(Student.id == current_user.profile_id).first()
    if not student or not student.class_id:
        return []

    assignments = (
        db.query(Assignment)
        .options(joinedload(Assignment.subject), joinedload(Assignment.staff))
        .filter(Assignment.class_id == student.class_id)
        .order_by(Assignment.due_date.desc())
        .all()
    )

    submissions = {
        sub.assignment_id: sub
        for sub in db.query(AssignmentSubmission)
        .filter(AssignmentSubmission.student_id == current_user.profile_id)
        .all()
    }

    return [
        AssignmentOut(
            id=assignment.id,
            title=assignment.title,
            description=assignment.description,
            subject_name=assignment.subject.name,
            staff_name=f"{assignment.staff.first_name} {assignment.staff.last_name}",
            due_date=assignment.due_date,
            file_url=assignment.file_url,
            submission_status=submissions[assignment.id].status if assignment.id in submissions else None,
            submission_feedback=submissions[assignment.id].feedback if assignment.id in submissions else None,
            submission_score=submissions[assignment.id].score if assignment.id in submissions else None,
        )
        for assignment in assignments
    ]


@router.post("/assignments/{assignment_id}/submit")
def submit_assignment(
    assignment_id: str,
    payload: SubmitAssignmentRequest,
    current_user: Annotated[CurrentUser, Depends(require_role(Role.STUDENT))],
    db: Annotated[Session, Depends(get_db)],
):
    from datetime import datetime, timezone

    submission = (
        db.query(AssignmentSubmission)
        .filter(
            AssignmentSubmission.assignment_id == assignment_id,
            AssignmentSubmission.student_id == current_user.profile_id,
        )
        .first()
    )

    if submission:
        submission.content = payload.content
        submission.status = AssignmentStatus.SUBMITTED
        submission.submitted_at = datetime.now(timezone.utc)
    else:
        submission = AssignmentSubmission(
            assignment_id=assignment_id,
            student_id=current_user.profile_id,
            content=payload.content,
            status=AssignmentStatus.SUBMITTED,
            submitted_at=datetime.now(timezone.utc),
        )
        db.add(submission)

    db.commit()
    return {"message": "Assignment submitted successfully."}


@router.get("/announcements", response_model=list[AnnouncementOut])
def list_announcements(
    current_user: Annotated[CurrentUser, Depends(require_role(Role.STUDENT))],
    db: Annotated[Session, Depends(get_db)],
):
    announcements = (
        db.query(Announcement)
        .options(joinedload(Announcement.staff))
        .filter(
            Announcement.is_active.is_(True),
            Announcement.audience.in_([AnnouncementAudience.ALL, AnnouncementAudience.STUDENTS]),
        )
        .order_by(Announcement.created_at.desc())
        .all()
    )
    return [
        AnnouncementOut(
            id=item.id,
            title=item.title,
            content=item.content,
            audience=item.audience,
            posted_by=(
                f"{item.staff.first_name} {item.staff.last_name}" if item.staff else "School"
            ),
            created_at=item.created_at,
        )
        for item in announcements
    ]


@router.get("/fees", response_model=list[FeePaymentOut])
def list_fees(
    current_user: Annotated[CurrentUser, Depends(require_role(Role.STUDENT))],
    db: Annotated[Session, Depends(get_db)],
):
    payments = (
        db.query(FeePayment)
        .options(joinedload(FeePayment.term), joinedload(FeePayment.session))
        .filter(FeePayment.student_id == current_user.profile_id)
        .order_by(FeePayment.created_at.desc())
        .all()
    )
    return [
        FeePaymentOut(
            id=payment.id,
            description=payment.description,
            amount_due=payment.amount_due,
            amount_paid=payment.amount_paid,
            status=payment.status,
            term_name=payment.term.name,
            session_name=payment.session.name,
            payment_date=payment.payment_date,
        )
        for payment in payments
    ]


@router.get("/me")
def get_profile(
    current_user: Annotated[CurrentUser, Depends(require_role(Role.STUDENT))],
    db: Annotated[Session, Depends(get_db)],
):
    student = (
        db.query(Student)
        .options(joinedload(Student.class_))
        .filter(Student.id == current_user.profile_id)
        .first()
    )
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    return {
        "id": student.id,
        "admission_number": student.admission_number,
        "first_name": student.first_name,
        "last_name": student.last_name,
        "class_name": student.class_.name if student.class_ else None,
        "class_level": student.class_.level if student.class_ else None,
        "guardian_name": student.guardian_name,
        "guardian_phone": student.guardian_phone,
    }


@router.get("/dashboard")
def get_dashboard(
    current_user: Annotated[CurrentUser, Depends(require_role(Role.STUDENT))],
    db: Annotated[Session, Depends(get_db)],
):
    student = (
        db.query(Student)
        .options(joinedload(Student.class_))
        .filter(Student.id == current_user.profile_id)
        .first()
    )
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    results_count = (
        db.query(Result)
        .filter(Result.student_id == student.id, Result.status == ResultStatus.PUBLISHED)
        .count()
    )
    assignments_count = (
        db.query(Assignment).filter(Assignment.class_id == student.class_id).count()
        if student.class_id
        else 0
    )
    announcements_count = (
        db.query(Announcement)
        .filter(
            Announcement.is_active.is_(True),
            Announcement.audience.in_([AnnouncementAudience.ALL, AnnouncementAudience.STUDENTS]),
        )
        .count()
    )
    fee_records = db.query(FeePayment).filter(FeePayment.student_id == student.id).all()
    total_due = sum(f.amount_due for f in fee_records)
    total_paid = sum(f.amount_paid for f in fee_records)

    return {
        "profile": {
            "id": student.id,
            "admission_number": student.admission_number,
            "first_name": student.first_name,
            "last_name": student.last_name,
            "class_name": student.class_.name if student.class_ else None,
            "class_level": student.class_.level if student.class_ else None,
            "guardian_name": student.guardian_name,
            "guardian_phone": student.guardian_phone,
        },
        "stats": {
            "results_count": results_count,
            "assignments_count": assignments_count,
            "announcements_count": announcements_count,
            "total_due": total_due,
            "total_paid": total_paid,
            "outstanding": total_due - total_paid,
        },
    }
