"""Hugging Face bucket storage for school images."""

from __future__ import annotations

import uuid
from pathlib import Path

from huggingface_hub import HfFileSystem, batch_bucket_files, bucket_info

from app.config import settings

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}
MAX_IMAGE_BYTES = 5 * 1024 * 1024  # 5 MB


class StorageError(Exception):
    pass


def is_configured() -> bool:
    return bool(settings.hf_token and settings.hf_bucket_id)


def public_url(remote_path: str) -> str:
    bucket_id = settings.hf_bucket_id.strip("/")
    path = remote_path.lstrip("/")
    hffs = HfFileSystem(token=settings.hf_token or None)
    return hffs.url(f"hf://buckets/{bucket_id}/{path}")


def upload_image(
    data: bytes,
    *,
    content_type: str,
    folder: str = "images",
    filename: str | None = None,
) -> str:
    if not is_configured():
        raise StorageError("Hugging Face bucket is not configured. Set HF_TOKEN and HF_BUCKET_ID in backend/.env")

    if content_type not in ALLOWED_IMAGE_TYPES:
        raise StorageError("Only JPEG, PNG, WebP, and GIF images are allowed.")

    if len(data) > MAX_IMAGE_BYTES:
        raise StorageError("Image must be 5 MB or smaller.")

    ext = ALLOWED_IMAGE_TYPES[content_type]
    safe_name = filename or f"{uuid.uuid4().hex}{ext}"
    if not safe_name.lower().endswith(ext):
        safe_name = f"{Path(safe_name).stem}{ext}"

    remote_path = f"{folder.strip('/')}/{safe_name}"
    bucket_id = settings.hf_bucket_id.strip("/")

    batch_bucket_files(
        bucket_id,
        add=[(data, remote_path)],
        token=settings.hf_token,
    )
    return public_url(remote_path)


def check_connection() -> dict:
    if not is_configured():
        return {
            "configured": False,
            "connected": False,
            "message": "Set HF_TOKEN and HF_BUCKET_ID in backend/.env",
        }

    try:
        info = bucket_info(settings.hf_bucket_id.strip("/"), token=settings.hf_token)
        return {
            "configured": True,
            "connected": True,
            "bucket_id": info.id,
            "private": info.private,
            "total_files": info.total_files,
            "size_bytes": info.size,
            "message": "Connected to Hugging Face bucket",
        }
    except Exception as exc:
        return {
            "configured": True,
            "connected": False,
            "bucket_id": settings.hf_bucket_id,
            "message": str(exc),
        }
