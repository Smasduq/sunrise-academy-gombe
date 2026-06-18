from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import academic, admin, admin_overview, admin_students, auth, health, public, staff, student


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Schema migrations are run separately (see scripts/migrate_db.py) to avoid
    # blocking startup on slow remote databases.
    yield


app = FastAPI(
    title="Sunrise Academy Gombe API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers — admin_students MUST come before admin so /students/stats
# and /students/{id}/profile are not captured by admin's /students/{student_id}.
app.include_router(health.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(academic.router, prefix="/api")
app.include_router(student.router, prefix="/api")
app.include_router(staff.router, prefix="/api")
app.include_router(admin_students.router, prefix="/api")
app.include_router(admin_overview.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(public.router, prefix="/api")
