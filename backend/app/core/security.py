"""Security helpers for password hashing and token management."""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
from datetime import datetime, timedelta, timezone
from typing import Any, Callable, Dict, Optional

from app.core.config import get_settings

settings = get_settings()

_HASH_ALGORITHMS: Dict[str, Callable[[], "hashlib._Hash"]] = {
    "HS256": hashlib.sha256,
    "HS384": hashlib.sha384,
    "HS512": hashlib.sha512,
}


def _b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")


def _b64decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def _get_digestmod() -> Callable[[bytes], "hashlib._Hash"]:
    try:
        return _HASH_ALGORITHMS[settings.ALGORITHM]
    except KeyError as exc:  # pragma: no cover - validated via tests
        raise ValueError(f"Unsupported algorithm: {settings.ALGORITHM}") from exc


def create_access_token(
    subject: str | int,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Generate a signed token for the given subject using HMAC."""

    if isinstance(subject, int):
        subject = str(subject)

    expire = datetime.now(tz=timezone.utc) + (
        expires_delta
        if expires_delta is not None
        else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    payload: Dict[str, Any] = {
        "sub": subject,
        "exp": int(expire.timestamp()),
    }

    payload_json = json.dumps(payload, separators=(",", ":"), sort_keys=True).encode(
        "utf-8"
    )
    payload_segment = _b64encode(payload_json)

    digestmod = _get_digestmod()
    signature = hmac.new(
        settings.SECRET_KEY.encode("utf-8"),
        payload_segment.encode("utf-8"),
        digestmod,
    ).digest()
    signature_segment = _b64encode(signature)

    return f"{payload_segment}.{signature_segment}"


def decode_access_token(token: str) -> Dict[str, Any]:
    """Validate a token and return its payload."""

    try:
        payload_segment, signature_segment = token.split(".")
    except ValueError as exc:  # pragma: no cover - defensive programming
        raise ValueError("Token structure is invalid") from exc

    digestmod = _get_digestmod()
    expected_signature = hmac.new(
        settings.SECRET_KEY.encode("utf-8"),
        payload_segment.encode("utf-8"),
        digestmod,
    ).digest()
    actual_signature = _b64decode(signature_segment)

    if not hmac.compare_digest(expected_signature, actual_signature):
        raise ValueError("Token signature mismatch")

    payload_bytes = _b64decode(payload_segment)
    payload = json.loads(payload_bytes)

    exp = payload.get("exp")
    if exp is not None:
        expire_time = datetime.fromtimestamp(exp, tz=timezone.utc)
        if expire_time < datetime.now(tz=timezone.utc):
            raise ValueError("Token has expired")

    return payload
