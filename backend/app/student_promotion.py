"""Student class promotion rules for Sunrise Academy Gombe."""

# Must stay in sync with SCHOOL_CLASSES in app/school_classes.py.
# Primary 3 is intentionally the final class — no next entry in this map.
PROMOTION_MAP: dict[str, str] = {
    "Nursery 1": "Nursery 2",
    "Nursery 2": "Primary 1",
    "Primary 1": "Primary 2",
    "Primary 2": "Primary 3",
}


def next_class_name(current_class: str | None) -> str | None:
    if not current_class:
        return None
    return PROMOTION_MAP.get(current_class)
