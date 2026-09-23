"""Statistics schemas"""
from typing import Dict, List
from datetime import datetime
from pydantic import BaseModel
from backend.models.enums import LeadStatus


class ManagerStatistics(BaseModel):
    """Statistics for a manager"""
    manager_id: str
    manager_name: str
    current_leads: int
    total_processed: int
    success_count: int
    rejected_count: int
    conversion_rate: float


class StatusStatistics(BaseModel):
    """Statistics by status"""
    status: LeadStatus
    count: int


class GeneralStatistics(BaseModel):
    """General statistics"""
    total_leads: int
    new_leads: int
    in_progress: int
    callback: int
    success: int
    rejected: int
    closed: int
    conversion_rate: float
    by_status: List[StatusStatistics]
    by_manager: List[ManagerStatistics]


class PeriodStatistics(BaseModel):
    """Statistics for a period"""
    period_start: datetime
    period_end: datetime
    total_leads: int
    success_count: int
    rejected_count: int
    conversion_rate: float
    leads_by_day: Dict[str, int]
