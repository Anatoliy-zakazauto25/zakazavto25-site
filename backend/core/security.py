"""Security utilities"""
import secrets
import hashlib
from typing import Optional


def verify_api_secret(provided_secret: str, valid_secret: str) -> bool:
    """
    Verify API secret using constant-time comparison
    
    Args:
        provided_secret: Secret from request
        valid_secret: Valid secret from config
        
    Returns:
        True if secrets match
    """
    return secrets.compare_digest(provided_secret, valid_secret)


def generate_idempotency_key(data: dict) -> str:
    """
    Generate idempotency key from request data
    
    Args:
        data: Request data dictionary
        
    Returns:
        Unique hash string
    """
    # Create deterministic string from data
    data_string = str(sorted(data.items()))
    return hashlib.sha256(data_string.encode()).hexdigest()


def mask_phone(phone: str) -> str:
    """
    Mask phone number for logging
    
    Args:
        phone: Phone number
        
    Returns:
        Masked phone number
    """
    if len(phone) < 4:
        return "****"
    return f"{phone[:2]}{'*' * (len(phone) - 4)}{phone[-2:]}"


def mask_sensitive_data(data: dict) -> dict:
    """
    Mask sensitive data in dictionary for logging
    
    Args:
        data: Data dictionary
        
    Returns:
        Dictionary with masked sensitive fields
    """
    sensitive_fields = {"client_phone", "client_telegram", "phone", "telegram"}
    masked = data.copy()
    
    for field in sensitive_fields:
        if field in masked and masked[field]:
            if "phone" in field:
                masked[field] = mask_phone(str(masked[field]))
            else:
                masked[field] = "***MASKED***"
    
    return masked
