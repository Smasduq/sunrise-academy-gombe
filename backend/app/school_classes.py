"""Canonical class list for Sunrise Academy Gombe."""

from sqlalchemy.orm import Session

from app.models import Assignment, Attendance, Class, ClassSubject, Result, StaffClass, Student

# name, level, section
SCHOOL_CLASSES: list[tuple[str, str, str | None]] = [
    ("Nursery 1", "Nursery", None),
    ("Nursery 2", "Nursery", None),
    ("Primary 1", "Primary", None),
    ("Primary 2", "Primary", None),
    ("Primary 3", "Primary", None),
]

SCHOOL_CLASS_NAMES = {name for name, _, _ in SCHOOL_CLASSES}
CLASS_SORT_ORDER = {name: index for index, (name, _, _) in enumerate(SCHOOL_CLASSES)}


def _class_in_use(db: Session, class_id: str) -> bool:
    checks = [
        db.query(Student).filter(Student.class_id == class_id).count(),
        db.query(StaffClass).filter(StaffClass.class_id == class_id).count(),
        db.query(Result).filter(Result.class_id == class_id).count(),
        db.query(Attendance).filter(Attendance.class_id == class_id).count(),
        db.query(Assignment).filter(Assignment.class_id == class_id).count(),
    ]
    return any(count > 0 for count in checks)


def prune_extra_classes(db: Session) -> None:
    extras = db.query(Class).filter(~Class.name.in_(SCHOOL_CLASS_NAMES)).all()
    for cls in extras:
        if _class_in_use(db, cls.id):
            continue
        db.query(ClassSubject).filter(ClassSubject.class_id == cls.id).delete()
        db.delete(cls)
    db.commit()


def ensure_school_classes(db: Session) -> None:
    for name, level, section in SCHOOL_CLASSES:
        exists = db.query(Class).filter(Class.name == name, Class.level == level).first()
        if not exists:
            db.add(Class(name=name, level=level, section=section, capacity=30))
    db.commit()
    prune_extra_classes(db)


def sort_school_classes(classes: list[Class]) -> list[Class]:
    filtered = [c for c in classes if c.name in SCHOOL_CLASS_NAMES]
    return sorted(filtered, key=lambda c: CLASS_SORT_ORDER.get(c.name, 999))
