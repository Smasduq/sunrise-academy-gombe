import enum
import uuid
from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def new_id() -> str:
    return str(uuid.uuid4())


class Role(str, enum.Enum):
    STUDENT = "STUDENT"
    STAFF = "STAFF"


class UserStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"


class AttendanceStatus(str, enum.Enum):
    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    LATE = "LATE"
    EXCUSED = "EXCUSED"


class ResultStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"


class AssignmentStatus(str, enum.Enum):
    PENDING = "PENDING"
    SUBMITTED = "SUBMITTED"
    GRADED = "GRADED"


class FeeStatus(str, enum.Enum):
    PAID = "PAID"
    PARTIAL = "PARTIAL"
    OUTSTANDING = "OUTSTANDING"


class AnnouncementAudience(str, enum.Enum):
    ALL = "ALL"
    STUDENTS = "STUDENTS"
    STAFF = "STAFF"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    email: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[Role] = mapped_column(Enum(Role), nullable=False, index=True)
    status: Mapped[UserStatus] = mapped_column(
        Enum(UserStatus), default=UserStatus.ACTIVE, index=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    student: Mapped["Student | None"] = relationship(back_populates="user", uselist=False)
    staff: Mapped["Staff | None"] = relationship(back_populates="user", uselist=False)


class Student(Base):
    __tablename__ = "students"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    admission_number: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    date_of_birth: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    gender: Mapped[str | None] = mapped_column(String(20), nullable=True)
    guardian_name: Mapped[str | None] = mapped_column(String(150), nullable=True)
    guardian_phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    address: Mapped[str | None] = mapped_column(String(255), nullable=True)
    class_id: Mapped[str | None] = mapped_column(ForeignKey("classes.id"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    user: Mapped[User] = relationship(back_populates="student")
    class_: Mapped["Class | None"] = relationship(back_populates="students")
    results: Mapped[list["Result"]] = relationship(back_populates="student")
    attendance: Mapped[list["Attendance"]] = relationship(back_populates="student")
    submissions: Mapped[list["AssignmentSubmission"]] = relationship(back_populates="student")
    fee_payments: Mapped[list["FeePayment"]] = relationship(back_populates="student")


class Staff(Base):
    __tablename__ = "staff"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    staff_id: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    department: Mapped[str | None] = mapped_column(String(100), nullable=True)
    position: Mapped[str | None] = mapped_column(String(100), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    user: Mapped[User] = relationship(back_populates="staff")
    staff_classes: Mapped[list["StaffClass"]] = relationship(back_populates="staff")
    results: Mapped[list["Result"]] = relationship(back_populates="staff")
    attendance: Mapped[list["Attendance"]] = relationship(back_populates="staff")
    assignments: Mapped[list["Assignment"]] = relationship(back_populates="staff")
    announcements: Mapped[list["Announcement"]] = relationship(back_populates="staff")


class Class(Base):
    __tablename__ = "classes"
    __table_args__ = (UniqueConstraint("name", "level", "section"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    name: Mapped[str] = mapped_column(String(100))
    level: Mapped[str] = mapped_column(String(50), index=True)
    section: Mapped[str | None] = mapped_column(String(10), nullable=True)
    capacity: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    students: Mapped[list[Student]] = relationship(back_populates="class_")
    staff_classes: Mapped[list["StaffClass"]] = relationship(back_populates="class_")
    class_subjects: Mapped[list["ClassSubject"]] = relationship(back_populates="class_")
    results: Mapped[list["Result"]] = relationship(back_populates="class_")
    attendance: Mapped[list["Attendance"]] = relationship(back_populates="class_")
    assignments: Mapped[list["Assignment"]] = relationship(back_populates="class_")


class Subject(Base):
    __tablename__ = "subjects"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    name: Mapped[str] = mapped_column(String(100))
    code: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    class_subjects: Mapped[list["ClassSubject"]] = relationship(back_populates="subject")
    result_scores: Mapped[list["ResultScore"]] = relationship(back_populates="subject")
    assignments: Mapped[list["Assignment"]] = relationship(back_populates="subject")


class ClassSubject(Base):
    __tablename__ = "class_subjects"
    __table_args__ = (UniqueConstraint("class_id", "subject_id"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    class_id: Mapped[str] = mapped_column(ForeignKey("classes.id", ondelete="CASCADE"), index=True)
    subject_id: Mapped[str] = mapped_column(
        ForeignKey("subjects.id", ondelete="CASCADE"), index=True
    )

    class_: Mapped[Class] = relationship(back_populates="class_subjects")
    subject: Mapped[Subject] = relationship(back_populates="class_subjects")


class StaffClass(Base):
    __tablename__ = "staff_classes"
    __table_args__ = (UniqueConstraint("staff_id", "class_id"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    staff_id: Mapped[str] = mapped_column(ForeignKey("staff.id", ondelete="CASCADE"), index=True)
    class_id: Mapped[str] = mapped_column(ForeignKey("classes.id", ondelete="CASCADE"), index=True)

    staff: Mapped[Staff] = relationship(back_populates="staff_classes")
    class_: Mapped[Class] = relationship(back_populates="staff_classes")


class AcademicSession(Base):
    __tablename__ = "academic_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    name: Mapped[str] = mapped_column(String(50), unique=True)
    start_date: Mapped[datetime] = mapped_column(DateTime)
    end_date: Mapped[datetime] = mapped_column(DateTime)
    is_current: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    terms: Mapped[list["Term"]] = relationship(back_populates="session")
    results: Mapped[list["Result"]] = relationship(back_populates="session")
    attendance: Mapped[list["Attendance"]] = relationship(back_populates="session")
    assignments: Mapped[list["Assignment"]] = relationship(back_populates="session")
    fee_payments: Mapped[list["FeePayment"]] = relationship(back_populates="session")


class Term(Base):
    __tablename__ = "terms"
    __table_args__ = (UniqueConstraint("session_id", "name"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    name: Mapped[str] = mapped_column(String(50))
    session_id: Mapped[str] = mapped_column(
        ForeignKey("academic_sessions.id", ondelete="CASCADE"), index=True
    )
    start_date: Mapped[datetime] = mapped_column(DateTime)
    end_date: Mapped[datetime] = mapped_column(DateTime)
    is_current: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    session: Mapped[AcademicSession] = relationship(back_populates="terms")
    results: Mapped[list["Result"]] = relationship(back_populates="term")
    attendance: Mapped[list["Attendance"]] = relationship(back_populates="term")
    assignments: Mapped[list["Assignment"]] = relationship(back_populates="term")
    fee_payments: Mapped[list["FeePayment"]] = relationship(back_populates="term")


class Result(Base):
    __tablename__ = "results"
    __table_args__ = (UniqueConstraint("student_id", "term_id"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    student_id: Mapped[str] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), index=True)
    class_id: Mapped[str] = mapped_column(ForeignKey("classes.id"), index=True)
    session_id: Mapped[str] = mapped_column(ForeignKey("academic_sessions.id"))
    term_id: Mapped[str] = mapped_column(ForeignKey("terms.id"), index=True)
    staff_id: Mapped[str | None] = mapped_column(ForeignKey("staff.id"), nullable=True)
    total_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    average: Mapped[float | None] = mapped_column(Float, nullable=True)
    grade: Mapped[str | None] = mapped_column(String(5), nullable=True)
    position: Mapped[int | None] = mapped_column(Integer, nullable=True)
    remark: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[ResultStatus] = mapped_column(
        Enum(ResultStatus), default=ResultStatus.DRAFT, index=True
    )
    published_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    student: Mapped[Student] = relationship(back_populates="results")
    class_: Mapped[Class] = relationship(back_populates="results")
    session: Mapped[AcademicSession] = relationship(back_populates="results")
    term: Mapped[Term] = relationship(back_populates="results")
    staff: Mapped[Staff | None] = relationship(back_populates="results")
    scores: Mapped[list["ResultScore"]] = relationship(back_populates="result")


class ResultScore(Base):
    __tablename__ = "result_scores"
    __table_args__ = (UniqueConstraint("result_id", "subject_id"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    result_id: Mapped[str] = mapped_column(ForeignKey("results.id", ondelete="CASCADE"), index=True)
    subject_id: Mapped[str] = mapped_column(ForeignKey("subjects.id"))
    score: Mapped[float] = mapped_column(Float)
    grade: Mapped[str | None] = mapped_column(String(5), nullable=True)
    remark: Mapped[str | None] = mapped_column(String(255), nullable=True)

    result: Mapped[Result] = relationship(back_populates="scores")
    subject: Mapped[Subject] = relationship(back_populates="result_scores")


class Attendance(Base):
    __tablename__ = "attendance"
    __table_args__ = (UniqueConstraint("student_id", "date"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    student_id: Mapped[str] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), index=True)
    class_id: Mapped[str] = mapped_column(ForeignKey("classes.id"), index=True)
    session_id: Mapped[str] = mapped_column(ForeignKey("academic_sessions.id"))
    term_id: Mapped[str] = mapped_column(ForeignKey("terms.id"))
    staff_id: Mapped[str | None] = mapped_column(ForeignKey("staff.id"), nullable=True)
    date: Mapped[date] = mapped_column(Date, index=True)
    status: Mapped[AttendanceStatus] = mapped_column(Enum(AttendanceStatus))
    remark: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    student: Mapped[Student] = relationship(back_populates="attendance")
    class_: Mapped[Class] = relationship(back_populates="attendance")
    session: Mapped[AcademicSession] = relationship(back_populates="attendance")
    term: Mapped[Term] = relationship(back_populates="attendance")
    staff: Mapped[Staff | None] = relationship(back_populates="attendance")


class Assignment(Base):
    __tablename__ = "assignments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    class_id: Mapped[str] = mapped_column(ForeignKey("classes.id"), index=True)
    subject_id: Mapped[str] = mapped_column(ForeignKey("subjects.id"))
    session_id: Mapped[str] = mapped_column(ForeignKey("academic_sessions.id"))
    term_id: Mapped[str] = mapped_column(ForeignKey("terms.id"))
    staff_id: Mapped[str] = mapped_column(ForeignKey("staff.id"), index=True)
    file_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    due_date: Mapped[datetime] = mapped_column(DateTime, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    class_: Mapped[Class] = relationship(back_populates="assignments")
    subject: Mapped[Subject] = relationship(back_populates="assignments")
    session: Mapped[AcademicSession] = relationship(back_populates="assignments")
    term: Mapped[Term] = relationship(back_populates="assignments")
    staff: Mapped[Staff] = relationship(back_populates="assignments")
    submissions: Mapped[list["AssignmentSubmission"]] = relationship(back_populates="assignment")


class AssignmentSubmission(Base):
    __tablename__ = "assignment_submissions"
    __table_args__ = (UniqueConstraint("assignment_id", "student_id"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    assignment_id: Mapped[str] = mapped_column(
        ForeignKey("assignments.id", ondelete="CASCADE"), index=True
    )
    student_id: Mapped[str] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), index=True)
    file_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[AssignmentStatus] = mapped_column(
        Enum(AssignmentStatus), default=AssignmentStatus.PENDING
    )
    score: Mapped[float | None] = mapped_column(Float, nullable=True)
    feedback: Mapped[str | None] = mapped_column(Text, nullable=True)
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    assignment: Mapped[Assignment] = relationship(back_populates="submissions")
    student: Mapped[Student] = relationship(back_populates="submissions")


class Announcement(Base):
    __tablename__ = "announcements"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    title: Mapped[str] = mapped_column(String(200))
    content: Mapped[str] = mapped_column(Text)
    audience: Mapped[AnnouncementAudience] = mapped_column(
        Enum(AnnouncementAudience), default=AnnouncementAudience.ALL, index=True
    )
    staff_id: Mapped[str | None] = mapped_column(ForeignKey("staff.id"), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), index=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    staff: Mapped[Staff | None] = relationship(back_populates="announcements")


class FeePayment(Base):
    __tablename__ = "fee_payments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    student_id: Mapped[str] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), index=True)
    session_id: Mapped[str] = mapped_column(ForeignKey("academic_sessions.id"), index=True)
    term_id: Mapped[str] = mapped_column(ForeignKey("terms.id"))
    amount_due: Mapped[float] = mapped_column(Float)
    amount_paid: Mapped[float] = mapped_column(Float, default=0)
    status: Mapped[FeeStatus] = mapped_column(Enum(FeeStatus), default=FeeStatus.OUTSTANDING, index=True)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    payment_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    payment_method: Mapped[str | None] = mapped_column(String(50), nullable=True)
    reference: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    student: Mapped[Student] = relationship(back_populates="fee_payments")
    session: Mapped[AcademicSession] = relationship(back_populates="fee_payments")
    term: Mapped[Term] = relationship(back_populates="fee_payments")


class Admission(Base):
    __tablename__ = "admissions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    application_no: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    date_of_birth: Mapped[datetime] = mapped_column(DateTime)
    gender: Mapped[str] = mapped_column(String(20))
    guardian_name: Mapped[str] = mapped_column(String(150))
    guardian_phone: Mapped[str] = mapped_column(String(30))
    guardian_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    address: Mapped[str | None] = mapped_column(String(255), nullable=True)
    previous_school: Mapped[str | None] = mapped_column(String(200), nullable=True)
    class_applied: Mapped[str] = mapped_column(String(50))
    status: Mapped[str] = mapped_column(String(30), default="PENDING", index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )
