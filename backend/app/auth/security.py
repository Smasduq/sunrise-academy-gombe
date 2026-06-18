from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.config import settings
from app.models import Role, User, UserStatus


ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=12)).decode()


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode(), password_hash.encode())


def create_access_token(
    *,
    user_id: str,
    role: Role,
    profile_id: str,
    display_name: str,
    identifier: str,
) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {
        "sub": user_id,
        "role": role.value,
        "profile_id": profile_id,
        "display_name": display_name,
        "identifier": identifier,
        "exp": expire,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    return jwt.decode(token, settings.jwt_secret, algorithms=[ALGORITHM])


def authenticate_student(db: Session, admission_number: str, password: str) -> dict | None:
    from app.models import Student

    student = (
        db.query(Student)
        .filter(Student.admission_number == admission_number.upper())
        .first()
    )
    if not student:
        return None

    user = db.query(User).filter(User.id == student.user_id).first()
    if not user or user.role != Role.STUDENT or user.status == UserStatus.SUSPENDED:
        return None
    if not verify_password(password, user.password_hash):
        return None

    return {
        "user_id": user.id,
        "role": user.role,
        "profile_id": student.id,
        "display_name": f"{student.first_name} {student.last_name}",
        "identifier": student.admission_number,
    }


def authenticate_admin(db: Session, email: str, password: str) -> dict | None:
    from app.models import Admin

    admin = db.query(Admin).filter(Admin.email == email.strip().lower()).first()
    if not admin:
        return None

    user = db.query(User).filter(User.id == admin.user_id).first()
    if not user or user.role != Role.ADMIN or user.status == UserStatus.SUSPENDED:
        return None
    if not verify_password(password, user.password_hash):
        return None

    return {
        "user_id": user.id,
        "role": user.role,
        "profile_id": admin.id,
        "display_name": f"{admin.first_name} {admin.last_name}",
        "identifier": admin.email,
    }


def authenticate_staff(db: Session, staff_id: str, password: str) -> dict | None:
    from app.models import Staff

    staff = db.query(Staff).filter(Staff.staff_id == staff_id.upper()).first()
    if not staff:
        return None

    user = db.query(User).filter(User.id == staff.user_id).first()
    if not user or user.role != Role.STAFF or user.status == UserStatus.SUSPENDED:
        return None
    if not verify_password(password, user.password_hash):
        return None

    return {
        "user_id": user.id,
        "role": user.role,
        "profile_id": staff.id,
        "display_name": f"{staff.first_name} {staff.last_name}",
        "identifier": staff.staff_id,
    }
