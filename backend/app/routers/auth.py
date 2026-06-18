from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.deps import CurrentUser, get_current_user
from app.auth.security import (
    authenticate_admin,
    authenticate_staff,
    authenticate_student,
    create_access_token,
    hash_password,
    verify_password,
)
from app.database import get_db
from app.models import User
from app.schemas import (
    ChangePasswordRequest,
    MessageResponse,
    StaffLoginRequest,
    StudentLoginRequest,
    TokenResponse,
)
from app.schemas_admin import AdminLoginRequest

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/student/login", response_model=TokenResponse)
def student_login(payload: StudentLoginRequest, db: Annotated[Session, Depends(get_db)]):
    account = authenticate_student(db, payload.admission_number, payload.password)
    if not account:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(**account)
    return TokenResponse(
        access_token=token,
        user_id=account["user_id"],
        role=account["role"],
        display_name=account["display_name"],
        identifier=account["identifier"],
        profile_id=account["profile_id"],
    )


@router.post("/staff/login", response_model=TokenResponse)
def staff_login(payload: StaffLoginRequest, db: Annotated[Session, Depends(get_db)]):
    account = authenticate_staff(db, payload.staff_id, payload.password)
    if not account:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(**account)
    return TokenResponse(
        access_token=token,
        user_id=account["user_id"],
        role=account["role"],
        display_name=account["display_name"],
        identifier=account["identifier"],
        profile_id=account["profile_id"],
    )


@router.post("/admin/login", response_model=TokenResponse)
def admin_login(payload: AdminLoginRequest, db: Annotated[Session, Depends(get_db)]):
    account = authenticate_admin(db, str(payload.email), payload.password)
    if not account:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(**account)
    return TokenResponse(
        access_token=token,
        user_id=account["user_id"],
        role=account["role"],
        display_name=account["display_name"],
        identifier=account["identifier"],
        profile_id=account["profile_id"],
    )


@router.post("/change-password", response_model=MessageResponse)
def change_password(
    payload: ChangePasswordRequest,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    user = db.query(User).filter(User.id == current_user.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if not verify_password(payload.current_password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")

    user.password_hash = hash_password(payload.new_password)
    db.commit()
    return MessageResponse(message="Password changed successfully.")
