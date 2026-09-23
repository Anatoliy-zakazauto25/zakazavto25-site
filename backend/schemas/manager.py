"""Manager schemas"""
from typing import Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field


class ManagerCreate(BaseModel):
    """Schema for creating manager"""
    telegram_id: int
    username: Optional[str] = None
    full_name: str = Field(..., min_length=1, max_length=255)
    is_admin: bool = False


class ManagerUpdate(BaseModel):
    """Schema for updating manager"""
    username: Optional[str] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None


class ManagerResponse(BaseModel):
    """Schema for manager response"""
    id: UUID
    telegram_id: int
    username: Optional[str]
    full_name: str
    is_active: bool
    is_admin: bool
    current_leads_count: int
    total_leads_processed: int
    created_at: datetime
    
    model_config = {"from_attributes": True}
