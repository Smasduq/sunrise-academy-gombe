from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.admin_helpers import get_or_create_settings, log_admin_activity
from app.auth.deps import CurrentUser, require_role
from app.database import get_db
from app.models import (
    AdminActivityLog,
    Admission,
    Announcement,
    AnnouncementAudience,
    Attendance,
    AttendanceStatus,
    Class,
    Role,
    Staff,
    Student,
)
from app.school_classes import sort_school_classes
from app.storage import StorageError, check_connection, upload_image
from app.schemas_admin import (
    ActivityLogOut,
    AdmissionOut,
    AdmissionUpdateRequest,
    AnnouncementAdminOut,
    AnnouncementCreateRequest,
    AnnouncementUpdateRequest,
    DashboardOverviewOut,
    SchoolSettingsOut,
    SchoolSettingsUpdateRequest,
    StorageStatusOut,
    UploadImageOut,
)

router = APIRouter(prefix="/admin", tags=["admin"])


def _admission_out(a: Admission) -> AdmissionOut:
    return AdmissionOut(
        id=a.id,
        application_no=a.application_no,
        first_name=a.first_name,
        last_name=a.last_name,
        date_of_birth=a.date_of_birth,
        gender=a.gender,
        guardian_name=a.guardian_name,
        guardian_phone=a.guardian_phone,
        guardian_email=a.guardian_email,
        address=a.address,
        previous_school=a.previous_school,
        class_applied=a.class_applied,
        status=a.status,
        created_at=a.created_at,
    )


def _announcement_out(a: Announcement) -> AnnouncementAdminOut:
    return AnnouncementAdminOut(
        id=a.id,
        title=a.title,
        content=a.content,
        audience=a.audience.value,
        is_active=a.is_active,
        created_at=a.created_at,
    )


def _activity_out(log: AdminActivityLog) -> ActivityLogOut:
    return ActivityLogOut(
        id=log.id,
        admin_name=log.admin_name,
        action=log.action,
        entity_type=log.entity_type,
        entity_id=log.entity_id,
        details=log.details,
        created_at=log.created_at,
    )


@router.get("/dashboard", response_model=DashboardOverviewOut)
def dashboard_overview(
    _: Annotated[CurrentUser, Depends(require_role(Role.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    today = date.today()
    settings = get_or_create_settings(db)
    attendance_rows = db.query(Attendance).filter(Attendance.date == today).all()

    return DashboardOverviewOut(
        students=db.query(Student).count(),
        staff=db.query(Staff).count(),
        classes=len(sort_school_classes(db.query(Class).all())),
        admissions_pending=db.query(Admission).filter(Admission.status == "PENDING").count(),
        admissions_approved=db.query(Admission).filter(Admission.status == "APPROVED").count(),
        admissions_rejected=db.query(Admission).filter(Admission.status == "REJECTED").count(),
        admissions_total=db.query(Admission).count(),
        attendance_present_today=sum(1 for r in attendance_rows if r.status == AttendanceStatus.PRESENT),
        attendance_absent_today=sum(1 for r in attendance_rows if r.status == AttendanceStatus.ABSENT),
        attendance_late_today=sum(1 for r in attendance_rows if r.status == AttendanceStatus.LATE),
        academic_session=settings.academic_session,
        current_term=settings.current_term,
        recent_activities=[
            _activity_out(log)
            for log in db.query(AdminActivityLog).order_by(AdminActivityLog.created_at.desc()).limit(8).all()
        ],
        announcements=[
            _announcement_out(a)
            for a in (
                db.query(Announcement)
                .filter(Announcement.is_active.is_(True))
                .order_by(Announcement.created_at.desc())
                .limit(5)
                .all()
            )
        ],
    )


@router.get("/admissions", response_model=list[AdmissionOut])
def list_admissions(
    _: Annotated[CurrentUser, Depends(require_role(Role.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
    status_filter: str | None = None,
):
    query = db.query(Admission).order_by(Admission.created_at.desc())
    if status_filter:
        query = query.filter(Admission.status == status_filter.upper())
    return [_admission_out(a) for a in query.all()]


@router.put("/admissions/{admission_id}", response_model=AdmissionOut)
def update_admission(
    admission_id: str,
    payload: AdmissionUpdateRequest,
    user: Annotated[CurrentUser, Depends(require_role(Role.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    admission = db.query(Admission).filter(Admission.id == admission_id).first()
    if not admission:
        raise HTTPException(status_code=404, detail="Application not found")
    admission.status = payload.status
    log_admin_activity(
        db,
        user,
        action="UPDATE",
        entity_type="admission",
        entity_id=admission.id,
        details=f"Status set to {payload.status}",
    )
    db.commit()
    db.refresh(admission)
    return _admission_out(admission)


@router.get("/announcements", response_model=list[AnnouncementAdminOut])
def list_announcements(
    _: Annotated[CurrentUser, Depends(require_role(Role.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    rows = db.query(Announcement).order_by(Announcement.created_at.desc()).all()
    return [_announcement_out(a) for a in rows]


@router.post("/announcements", response_model=AnnouncementAdminOut, status_code=status.HTTP_201_CREATED)
def create_announcement(
    payload: AnnouncementCreateRequest,
    user: Annotated[CurrentUser, Depends(require_role(Role.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    try:
        audience = AnnouncementAudience(payload.audience.upper())
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid audience") from exc

    row = Announcement(
        title=payload.title.strip(),
        content=payload.content.strip(),
        audience=audience,
        is_active=payload.is_active,
    )
    db.add(row)
    log_admin_activity(
        db,
        user,
        action="CREATE",
        entity_type="announcement",
        details=payload.title,
    )
    db.commit()
    db.refresh(row)
    return _announcement_out(row)


@router.put("/announcements/{announcement_id}", response_model=AnnouncementAdminOut)
def update_announcement(
    announcement_id: str,
    payload: AnnouncementUpdateRequest,
    user: Annotated[CurrentUser, Depends(require_role(Role.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    row = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Announcement not found")
    if payload.title is not None:
        row.title = payload.title.strip()
    if payload.content is not None:
        row.content = payload.content.strip()
    if payload.audience is not None:
        try:
            row.audience = AnnouncementAudience(payload.audience.upper())
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="Invalid audience") from exc
    if payload.is_active is not None:
        row.is_active = payload.is_active
    log_admin_activity(db, user, action="UPDATE", entity_type="announcement", entity_id=row.id)
    db.commit()
    db.refresh(row)
    return _announcement_out(row)


@router.delete("/announcements/{announcement_id}")
def delete_announcement(
    announcement_id: str,
    user: Annotated[CurrentUser, Depends(require_role(Role.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    row = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Announcement not found")
    log_admin_activity(db, user, action="DELETE", entity_type="announcement", entity_id=row.id)
    db.delete(row)
    db.commit()
    return {"message": "Announcement deleted"}


@router.get("/activity-logs", response_model=list[ActivityLogOut])
def list_activity_logs(
    _: Annotated[CurrentUser, Depends(require_role(Role.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    logs = db.query(AdminActivityLog).order_by(AdminActivityLog.created_at.desc()).limit(100).all()
    return [_activity_out(log) for log in logs]


@router.get("/settings", response_model=SchoolSettingsOut)
def get_settings(
    _: Annotated[CurrentUser, Depends(require_role(Role.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    s = get_or_create_settings(db)
    return SchoolSettingsOut(
        school_name=s.school_name,
        address=s.address,
        phone=s.phone,
        email=s.email,
        logo_url=s.logo_url,
        academic_session=s.academic_session,
        current_term=s.current_term,
    )


@router.put("/settings", response_model=SchoolSettingsOut)
def update_settings(
    payload: SchoolSettingsUpdateRequest,
    user: Annotated[CurrentUser, Depends(require_role(Role.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    s = get_or_create_settings(db)
    for field in (
        "school_name",
        "address",
        "phone",
        "email",
        "logo_url",
        "academic_session",
        "current_term",
    ):
        value = getattr(payload, field)
        if value is not None:
            setattr(s, field, value.strip() if isinstance(value, str) else value)
    log_admin_activity(db, user, action="UPDATE", entity_type="settings")
    db.commit()
    db.refresh(s)
    return SchoolSettingsOut(
        school_name=s.school_name,
        address=s.address,
        phone=s.phone,
        email=s.email,
        logo_url=s.logo_url,
        academic_session=s.academic_session,
        current_term=s.current_term,
    )


@router.get("/storage/status", response_model=StorageStatusOut)
def storage_status(
    _: Annotated[CurrentUser, Depends(require_role(Role.ADMIN))],
):
    result = check_connection()
    return StorageStatusOut(**result)


@router.post("/uploads/image", response_model=UploadImageOut, status_code=status.HTTP_201_CREATED)
async def upload_image_file(
    user: Annotated[CurrentUser, Depends(require_role(Role.ADMIN))],
    db: Annotated[Session, Depends(get_db)],
    file: UploadFile = File(...),
    folder: str = Form("images"),
):
    if not file.content_type:
        raise HTTPException(status_code=400, detail="Could not detect file type")

    data = await file.read()
    try:
        url = upload_image(data, content_type=file.content_type, folder=folder, filename=file.filename)
    except StorageError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    log_admin_activity(
        db,
        user,
        action="UPLOAD",
        entity_type="image",
        details=f"{folder}/{file.filename}",
    )
    db.commit()
    return UploadImageOut(url=url, folder=folder)
