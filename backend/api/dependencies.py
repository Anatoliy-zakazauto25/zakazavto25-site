"""API dependencies"""
from typing import AsyncGenerator
from fastapi import Header, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from backend.core.config import settings
from backend.core.security import verify_api_secret
from backend.db.session import get_db


async def verify_api_key(
    x_api_secret: str = Header(..., description="API Secret Key")
) -> None:
    """
    Verify API secret key
    
    Args:
        x_api_secret: API secret from header
        
    Raises:
        HTTPException: If secret is invalid
    """
    if not verify_api_secret(x_api_secret, settings.API_SECRET):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API secret"
        )


# Idempotency cache (in production use Redis)
_idempotency_cache: dict[str, str] = {}


async def check_idempotency(
    x_idempotency_key: str = Header(None, description="Idempotency key for request deduplication")
) -> str | None:
    """
    Check idempotency key to prevent duplicate requests
    
    Args:
        x_idempotency_key: Idempotency key from header
        
    Returns:
        Idempotency key if provided
        
    Raises:
        HTTPException: If request is duplicate
    """
    if not x_idempotency_key:
        return None
    
    if x_idempotency_key in _idempotency_cache:
        # Return cached response for duplicate request
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Duplicate request: {_idempotency_cache[x_idempotency_key]}"
        )
    
    return x_idempotency_key


def save_idempotency_result(key: str | None, result: str) -> None:
    """Save idempotency result to cache"""
    if key:
        _idempotency_cache[key] = result
