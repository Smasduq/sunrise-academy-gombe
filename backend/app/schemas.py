from datetime import date, datetime

from pydantic import BaseModel, Field

from app.models import (
    AnnouncementAudience,
    AssignmentStatus,
    AttendanceStatus,
    FeeStatus,
    ResultStatus,
    Role,
)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    role: Role
    display_name: str
    identifier: str
    profile_id: str


class StudentLoginRequest(BaseModel):
    admission_number: str = Field(min_length=3)
    password: str = Field(min_length=8)


class StaffLoginRequest(BaseModel):
    staff_id: str = Field(min_length=3)
    password: str = Field(min_length=8)


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)


class MessageResponse(BaseModel):
    message: str


class SubjectScoreOut(BaseModel):
    subject_name: str
    subject_code: str
    score: float
    grade: str | None


class ResultOut(BaseModel):
    id: str
    term_name: str
    session_name: str
    class_name: str
    average: float | None
    grade: str | None
    position: int | None
    remark: str | None
    status: ResultStatus
    published_at: datetime | None = None
    scores: list[SubjectScoreOut]


class AttendanceOut(BaseModel):
    id: str
    date: date
    status: AttendanceStatus
    remark: str | None


class AssignmentOut(BaseModel):
    id: str
    title: str
    description: str | None
    subject_name: str
    staff_name: str | None = None
    due_date: datetime
    file_url: str | None
    submission_status: AssignmentStatus | None
    submission_feedback: str | None = None
    submission_score: float | None = None


class AnnouncementOut(BaseModel):
    id: str
    title: str
    content: str
    audience: AnnouncementAudience
    posted_by: str | None = None
    created_at: datetime


class FeePaymentOut(BaseModel):
    id: str
    description: str | None
    amount_due: float
    amount_paid: float
    status: FeeStatus
    term_name: str
    session_name: str
    payment_date: datetime | None


class SubmitAssignmentRequest(BaseModel):
    content: str | None = None


class ClassOut(BaseModel):
    id: str
    name: str
    level: str
    section: str | None
    student_count: int


class StudentSummaryOut(BaseModel):
    id: str
    admission_number: str
    first_name: str
    last_name: str
    class_id: str | None = None
    class_name: str | None
    guardian_name: str | None = None


class SubjectOut(BaseModel):
    id: str
    name: str
    code: str


class StaffAssignmentOut(BaseModel):
    id: str
    title: str
    class_name: str
    subject_name: str
    due_date: datetime


class StaffResultOut(BaseModel):
    id: str
    student_name: str
    term_name: str
    average: float | None
    grade: str | None
    status: ResultStatus


class MarkAttendanceRequest(BaseModel):
    class_id: str
    session_id: str
    term_id: str
    date: datetime
    records: list[dict]


class CreateAssignmentRequest(BaseModel):
    title: str
    description: str | None = None
    class_id: str
    subject_id: str
    session_id: str
    term_id: str
    due_date: datetime
    file_url: str | None = None


class SaveResultRequest(BaseModel):
    student_id: str
    class_id: str
    session_id: str
    term_id: str
    scores: list[dict]
    remark: str | None = None
    publish: bool = False


class PostAnnouncementRequest(BaseModel):
    title: str
    content: str
    audience: AnnouncementAudience = AnnouncementAudience.ALL


class PublicStaffOut(BaseModel):
    id: str
    first_name: str
    last_name: str
    department: str | None
    position: str | None
    class_names: list[str]
