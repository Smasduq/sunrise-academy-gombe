from collections.abc import Callable
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.auth.security import decode_access_token
from app.database import get_db
from app.models import Role, User

bearer_scheme = HTTPBearer(auto_error=False)


class CurrentUser:
    def __init__(
        self,
        user_id: str,
        role: Role,
        profile_id: str,
        display_name: str,
        identifier: str,
    ):
        self.user_id = user_id
        self.role = role
        self.profile_id = profile_id
        self.display_name = display_name
        self.identifier = identifier


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    db: Annotated[Session, Depends(get_db)],
) -> CurrentUser:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    try:
        payload = decode_access_token(credentials.credentials)
        user_id = payload.get("sub")
        role_value = payload.get("role")
        profile_id = payload.get("profile_id")
        display_name = payload.get("display_name")
        identifier = payload.get("identifier")
        if not all([user_id, role_value, profile_id, display_name, identifier]):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return CurrentUser(
        user_id=user_id,
        role=Role(role_value),
        profile_id=profile_id,
        display_name=display_name,
        identifier=identifier,
    )


def require_role(*required_roles: Role) -> Callable:
    def dependency(current_user: Annotated[CurrentUser, Depends(get_current_user)]) -> CurrentUser:
        if current_user.role not in required_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
        return current_user

    return dependency
