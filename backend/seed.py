"""Seed the SQLite database with demo school data."""

from datetime import date, datetime, timezone

from app.auth.security import hash_password
from app.database import SessionLocal, init_db
from app.models import (
    AcademicSession,
    Admin,
    Admission,
    Announcement,
    AnnouncementAudience,
    Assignment,
    Attendance,
    AttendanceStatus,
    Class,
    ClassSubject,
    FeePayment,
    FeeStatus,
    Result,
    ResultScore,
    ResultStatus,
    Role,
    Staff,
    StaffClass,
    Student,
    Subject,
    Term,
    User,
    UserStatus,
)


def clear_tables(db) -> None:
    for model in [
        Admission,
        Announcement,
        Assignment,
        Attendance,
        FeePayment,
        ResultScore,
        Result,
        StaffClass,
        ClassSubject,
        Student,
        Staff,
        Admin,
        User,
        Term,
        AcademicSession,
        Subject,
        Class,
    ]:
        db.query(model).delete()
    db.commit()


def seed() -> None:
    init_db()
    db = SessionLocal()

    try:
        clear_tables(db)

        session = AcademicSession(
            name="2025/2026",
            start_date=datetime(2025, 9, 1, tzinfo=timezone.utc),
            end_date=datetime(2026, 7, 31, tzinfo=timezone.utc),
            is_current=True,
        )
        db.add(session)
        db.flush()

        first_term = Term(
            name="First Term",
            session_id=session.id,
            start_date=datetime(2025, 9, 1, tzinfo=timezone.utc),
            end_date=datetime(2025, 12, 15, tzinfo=timezone.utc),
            is_current=True,
        )
        second_term = Term(
            name="Second Term",
            session_id=session.id,
            start_date=datetime(2026, 1, 6, tzinfo=timezone.utc),
            end_date=datetime(2026, 4, 15, tzinfo=timezone.utc),
            is_current=False,
        )
        db.add_all([first_term, second_term])
        db.flush()

        primary3 = Class(name="Primary 3", level="Primary", section="A", capacity=30)
        primary5 = Class(name="Primary 5", level="Primary", section="B", capacity=30)
        db.add_all([primary3, primary5])
        db.flush()

        subjects = [
            Subject(name="Mathematics", code="MATH"),
            Subject(name="English Language", code="ENG"),
            Subject(name="Basic Science", code="SCI"),
            Subject(name="Social Studies", code="SST"),
            Subject(name="Civic Education", code="CIV"),
        ]
        db.add_all(subjects)
        db.flush()

        for cls in [primary3, primary5]:
            for subject in subjects:
                db.add(ClassSubject(class_id=cls.id, subject_id=subject.id))

        admin_user = User(
            email="admin@sunriseacademy.edu",
            password_hash=hash_password("Admin123!"),
            role=Role.ADMIN,
            status=UserStatus.ACTIVE,
        )
        db.add(admin_user)
        db.flush()
        db.add(
            Admin(
                user_id=admin_user.id,
                email="admin@sunriseacademy.edu",
                first_name="School",
                last_name="Administrator",
            )
        )

        staff_user = User(
            password_hash=hash_password("Staff123!"),
            role=Role.STAFF,
            status=UserStatus.ACTIVE,
        )
        db.add(staff_user)
        db.flush()

        staff = Staff(
            user_id=staff_user.id,
            staff_id="STAFF001",
            first_name="Fatima",
            last_name="Abubakar",
            department="Primary",
            position="Class Teacher",
            phone="+234 803 000 0001",
        )
        db.add(staff)
        db.flush()
        db.add(StaffClass(staff_id=staff.id, class_id=primary3.id))

        student_user = User(
            password_hash=hash_password("Student123!"),
            role=Role.STUDENT,
            status=UserStatus.ACTIVE,
        )
        db.add(student_user)
        db.flush()

        student = Student(
            user_id=student_user.id,
            admission_number="SUN2026001",
            first_name="Aisha",
            last_name="Mohammed",
            date_of_birth=datetime(2015, 3, 12, tzinfo=timezone.utc),
            gender="Female",
            guardian_name="Mohammed Ibrahim",
            guardian_phone="+234 806 000 0002",
            address="Akko LGA, Gombe State",
            class_id=primary3.id,
        )
        db.add(student)
        db.flush()

        student2_user = User(
            password_hash=hash_password("Student123!"),
            role=Role.STUDENT,
            status=UserStatus.ACTIVE,
        )
        db.add(student2_user)
        db.flush()
        db.add(
            Student(
                user_id=student2_user.id,
                admission_number="SUN2026002",
                first_name="Yusuf",
                last_name="Bello",
                class_id=primary3.id,
                guardian_name="Bello Yusuf",
                guardian_phone="+234 803 000 0003",
            )
        )

        result = Result(
            student_id=student.id,
            class_id=primary3.id,
            session_id=session.id,
            term_id=first_term.id,
            staff_id=staff.id,
            total_score=385,
            average=77,
            grade="A",
            position=2,
            remark="Excellent performance",
            status=ResultStatus.PUBLISHED,
            published_at=datetime.now(timezone.utc),
        )
        db.add(result)
        db.flush()

        scores = [88, 82, 75, 70, 70]
        for subject, score in zip(subjects, scores, strict=True):
            db.add(
                ResultScore(
                    result_id=result.id,
                    subject_id=subject.id,
                    score=score,
                    grade="A" if score >= 70 else "B",
                )
            )

        attendance_dates = [
            date(2025, 10, 1),
            date(2025, 10, 2),
            date(2025, 10, 3),
            date(2025, 10, 6),
            date(2025, 10, 7),
        ]
        statuses = [
            AttendanceStatus.PRESENT,
            AttendanceStatus.PRESENT,
            AttendanceStatus.LATE,
            AttendanceStatus.ABSENT,
            AttendanceStatus.PRESENT,
        ]
        for attendance_date, status in zip(attendance_dates, statuses, strict=True):
            db.add(
                Attendance(
                    student_id=student.id,
                    class_id=primary3.id,
                    session_id=session.id,
                    term_id=first_term.id,
                    staff_id=staff.id,
                    date=attendance_date,
                    status=status,
                )
            )

        db.add(
            Assignment(
                title="Mathematics Exercise — Fractions",
                description="Complete exercises 1–10 on page 45 of your textbook.",
                class_id=primary3.id,
                subject_id=subjects[0].id,
                session_id=session.id,
                term_id=first_term.id,
                staff_id=staff.id,
                due_date=datetime(2025, 11, 30, tzinfo=timezone.utc),
                file_url="/files/math-fractions.pdf",
            )
        )

        db.add(
            FeePayment(
                student_id=student.id,
                session_id=session.id,
                term_id=first_term.id,
                amount_due=75000,
                amount_paid=50000,
                status=FeeStatus.PARTIAL,
                description="First Term Tuition",
                payment_date=datetime(2025, 9, 15, tzinfo=timezone.utc),
                payment_method="Bank Transfer",
                reference="PAY-2025-001",
            )
        )
        db.add(
            FeePayment(
                student_id=student.id,
                session_id=session.id,
                term_id=second_term.id,
                amount_due=75000,
                amount_paid=0,
                status=FeeStatus.OUTSTANDING,
                description="Second Term Tuition",
            )
        )

        db.add(
            Announcement(
                title="First Term Examination Timetable",
                content="The first term examinations will commence on December 2nd, 2025.",
                audience=AnnouncementAudience.STUDENTS,
                staff_id=staff.id,
            )
        )
        db.add(
            Announcement(
                title="Staff Meeting — November",
                content="All teaching staff are required to attend the staff meeting on Friday at 2:00 PM.",
                audience=AnnouncementAudience.STAFF,
                staff_id=staff.id,
            )
        )

        db.add(
            Admission(
                application_no="ADM-2026-001",
                first_name="Halima",
                last_name="Sani",
                date_of_birth=datetime(2018, 6, 20, tzinfo=timezone.utc),
                gender="Female",
                guardian_name="Sani Halima",
                guardian_phone="+234 807 000 0004",
                guardian_email="sani@example.com",
                address="Gombe Town",
                previous_school="Little Stars Nursery",
                class_applied="Primary 1",
                status="PENDING",
            )
        )

        db.commit()
        print("Database seed completed.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
