"""Database enums"""
from enum import Enum


class LeadStatus(str, Enum):
    """Lead status enumeration"""
    NEW = "NEW"
    IN_PROGRESS = "IN_PROGRESS"
    CALLBACK = "CALLBACK"
    SUCCESS = "SUCCESS"
    REJECTED = "REJECTED"
    CLOSED = "CLOSED"


class HistoryAction(str, Enum):
    """History action enumeration"""
    CREATED = "CREATED"
    ASSIGNED = "ASSIGNED"
    STATUS_CHANGED = "STATUS_CHANGED"
    MANAGER_CHANGED = "MANAGER_CHANGED"
    COMMENT_ADDED = "COMMENT_ADDED"
    UPDATED = "UPDATED"
