"""Validators"""
import re
from typing import Optional


def validate_telegram_username(username: str) -> Optional[str]:
    """
    Validate and normalize Telegram username
    
    Args:
        username: Username to validate
        
    Returns:
        Normalized username or None if invalid
    """
    if not username:
        return None
    
    # Remove @ if present
    username = username.lstrip('@')
    
    # Telegram username rules: 5-32 chars, alphanumeric and underscore
    if not re.match(r'^[a-zA-Z0-9_]{5,32}$', username):
        return None
    
    return f"@{username}"


def validate_phone_simple(phone: str) -> bool:
    """
    Simple phone validation
    
    Args:
        phone: Phone number
        
    Returns:
        True if valid
    """
    # Remove all non-digits
    digits = re.sub(r'\D', '', phone)
    
    # Should have at least 10 digits
    return len(digits) >= 10


def sanitize_html(text: str) -> str:
    """
    Sanitize text for HTML display in Telegram
    
    Args:
        text: Text to sanitize
        
    Returns:
        Sanitized text
    """
    replacements = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
    }
    
    for char, replacement in replacements.items():
        text = text.replace(char, replacement)
    
    return text
