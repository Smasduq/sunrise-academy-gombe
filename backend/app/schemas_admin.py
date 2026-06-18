from datetime import datetime

from pydantic import BaseModel, Field

from app.models import UserStatus


class AdminLoginRequest(BaseModel):
    email: str = Field(min_length=5)
    password: str = Field(min_length=8)


class ClassOption(BaseModel):
    id: str
    name: str
    level: str
    section: str | None


class StudentOut(BaseModel):
    id: str
    user_id: str
    admission_number: str
    first_name: str
    last_name: str
    middle_name: str | None = None
    class_id: str | None
    class_name: str | None
    guardian_name: str | None
    mother_name: str | None = None
    guardian_phone: str | None
    guardian_email: str | None = None
    guardian_relationship: str | None = None
    emergency_contact: str | None = None
    gender: str | None
    address: str | None
    photo_url: str | None = None
    date_of_birth: datetime | None = None
    admission_date: datetime | None = None
    is_archived: bool = False
    status: UserStatus
    created_at: datetime
    updated_at: datetime | None = None


class StudentStatsOut(BaseModel):
    total: int
    male: int
    female: int
    active: int
    inactive: int
    archived: int
    new_this_term: int


class StudentResultSummary(BaseModel):
    subject_name: str
    score: float
    grade: str | None
    remark: str | None
    term_name: str | None


class StudentProfileOut(BaseModel):
    student: StudentOut
    academic_session: str | None
    attendance_present: int
    attendance_absent: int
    attendance_late: int
    attendance_percent: float
    average_score: float | None
    class_position: int | None
    latest_results: list[StudentResultSummary]
    recent_activities: list[StudentActivityItemOut] = []
    recent_attendance: list[StudentAttendanceRecordOut] = []


class PromoteStudentsRequest(BaseModel):
    student_ids: list[str] = []
    class_name: str | None = None


class PromotePreviewItem(BaseModel):
    student_id: str
    student_name: str
    from_class: str | None
    to_class: str | None
    can_promote: bool
    reason: str | None = None


class PromoteResultOut(BaseModel):
    promoted: int
    skipped: int
    items: list[PromotePreviewItem]


class StudentAttendanceRecordOut(BaseModel):
    id: str
    date: str
    status: str
    remark: str | None
    term_name: str | None
    session_name: str | None


class StudentAttendanceOut(BaseModel):
    present: int
    absent: int
    late: int
    excused: int
    total: int
    percent: float
    records: list[StudentAttendanceRecordOut]
    sessions: list[str]
    terms: list[str]


class StudentResultScoreOut(BaseModel):
    subject_name: str
    subject_code: str
    score: float
    grade: str | None
    remark: str | None


class StudentResultRecordOut(BaseModel):
    id: str
    term_name: str
    session_name: str
    class_name: str
    average: float | None
    grade: str | None
    position: int | None
    remark: str | None
    status: str
    published_at: datetime | None
    scores: list[StudentResultScoreOut]


class StudentResultsOut(BaseModel):
    results: list[StudentResultRecordOut]
    sessions: list[str]
    terms: list[str]


class StudentDeleteCheckOut(BaseModel):
    results_count: int
    attendance_count: int
    fee_count: int
    has_records: bool


class PromotionHistoryOut(BaseModel):
    id: str
    from_class_name: str | None
    to_class_name: str
    promoted_by_name: str
    created_at: datetime


class StudentActivityItemOut(BaseModel):
    id: str
    action: str
    admin_name: str
    details: str | None
    created_at: datetime


class StudentCreateRequest(BaseModel):
    admission_number: str = Field(min_length=3)
    first_name: str = Field(min_length=2)
    last_name: str = Field(min_length=2)
    middle_name: str | None = None
    password: str = Field(min_length=8)
    class_id: str | None = None
    guardian_name: str | None = None
    mother_name: str | None = None
    guardian_phone: str | None = None
    guardian_email: str | None = None
    guardian_relationship: str | None = None
    emergency_contact: str | None = None
    gender: str | None = None
    address: str | None = None
    photo_url: str | None = None
    date_of_birth: datetime | None = None
    admission_date: datetime | None = None
    status: UserStatus = UserStatus.ACTIVE


class StudentUpdateRequest(BaseModel):
    admission_number: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    middle_name: str | None = None
    password: str | None = Field(default=None, min_length=8)
    class_id: str | None = None
    guardian_name: str | None = None
    mother_name: str | None = None
    guardian_phone: str | None = None
    guardian_email: str | None = None
    guardian_relationship: str | None = None
    emergency_contact: str | None = None
    gender: str | None = None
    address: str | None = None
    photo_url: str | None = None
    date_of_birth: datetime | None = None
    admission_date: datetime | None = None
    is_archived: bool | None = None
    status: UserStatus | None = None


class StaffOut(BaseModel):
    id: str
    user_id: str
    staff_id: str
    first_name: str
    last_name: str
    department: str | None
    position: str | None
    phone: str | None
    status: UserStatus
    class_ids: list[str]
    class_names: list[str]
    created_at: datetime


class StaffCreateRequest(BaseModel):
    staff_id: str = Field(min_length=3)
    first_name: str = Field(min_length=2)
    last_name: str = Field(min_length=2)
    password: str = Field(min_length=8)
    department: str | None = None
    position: str | None = None
    phone: str | None = None
    status: UserStatus = UserStatus.ACTIVE
    class_ids: list[str] = []


class StaffUpdateRequest(BaseModel):
    staff_id: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    password: str | None = Field(default=None, min_length=8)
    department: str | None = None
    position: str | None = None
    phone: str | None = None
    status: UserStatus | None = None
    class_ids: list[str] | None = None


class AdminStatsOut(BaseModel):
    students: int
    staff: int
    classes: int


class ActivityLogOut(BaseModel):
    id: str
    admin_name: str
    action: str
    entity_type: str
    entity_id: str | None
    details: str | None
    created_at: datetime


class AnnouncementAdminOut(BaseModel):
    id: str
    title: str
    content: str
    audience: str
    is_active: bool
    created_at: datetime


class AnnouncementCreateRequest(BaseModel):
    title: str = Field(min_length=3)
    content: str = Field(min_length=3)
    audience: str = "ALL"
    is_active: bool = True


class AnnouncementUpdateRequest(BaseModel):
    title: str | None = None
    content: str | None = None
    audience: str | None = None
    is_active: bool | None = None


class AdmissionOut(BaseModel):
    id: str
    application_no: str
    first_name: str
    last_name: str
    date_of_birth: datetime
    gender: str
    guardian_name: str
    guardian_phone: str
    guardian_email: str | None
    address: str | None
    previous_school: str | None
    class_applied: str
    status: str
    created_at: datetime


class AdmissionUpdateRequest(BaseModel):
    status: str = Field(pattern="^(PENDING|APPROVED|REJECTED)$")


class SchoolSettingsOut(BaseModel):
    school_name: str
    address: str | None
    phone: str | None
    email: str | None
    logo_url: str | None
    academic_session: str | None
    current_term: str | None


class SchoolSettingsUpdateRequest(BaseModel):
    school_name: str | None = None
    address: str | None = None
    phone: str | None = None
    email: str | None = None
    logo_url: str | None = None
    academic_session: str | None = None
    current_term: str | None = None


class StorageStatusOut(BaseModel):
    configured: bool
    connected: bool
    bucket_id: str | None = None
    private: bool | None = None
    total_files: int | None = None
    size_bytes: int | None = None
    message: str


class UploadImageOut(BaseModel):
    url: str
    folder: str


class DashboardOverviewOut(BaseModel):
    students: int
    staff: int
    classes: int
    admissions_pending: int
    admissions_approved: int
    admissions_rejected: int
    admissions_total: int
    attendance_present_today: int
    attendance_absent_today: int
    attendance_late_today: int
    academic_session: str | None
    current_term: str | None
    recent_activities: list[ActivityLogOut]
    announcements: list[AnnouncementAdminOut]
