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
    class_id: str | None
    class_name: str | None
    guardian_name: str | None
    guardian_phone: str | None
    gender: str | None
    address: str | None
    status: UserStatus
    created_at: datetime


class StudentCreateRequest(BaseModel):
    admission_number: str = Field(min_length=3)
    first_name: str = Field(min_length=2)
    last_name: str = Field(min_length=2)
    password: str = Field(min_length=8)
    class_id: str | None = None
    guardian_name: str | None = None
    guardian_phone: str | None = None
    gender: str | None = None
    address: str | None = None
    status: UserStatus = UserStatus.ACTIVE


class StudentUpdateRequest(BaseModel):
    admission_number: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    password: str | None = Field(default=None, min_length=8)
    class_id: str | None = None
    guardian_name: str | None = None
    guardian_phone: str | None = None
    gender: str | None = None
    address: str | None = None
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
