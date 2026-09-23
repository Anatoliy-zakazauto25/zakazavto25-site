"""Lead repository"""
from typing import Optional, List
from uuid import UUID
from datetime import datetime, timedelta
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from backend.models import Lead, LeadStatus
from .base import BaseRepository


class LeadRepository(BaseRepository[Lead]):
    """Repository for Lead model"""
    
    def __init__(self, db: AsyncSession):
        super().__init__(Lead, db)
    
    async def get_by_external_id(self, external_id: str) -> Optional[Lead]:
        """Get lead by external ID"""
        result = await self.db.execute(
            select(Lead).where(Lead.external_id == external_id)
        )
        return result.scalar_one_or_none()
    
    async def get_with_manager(self, lead_id: UUID) -> Optional[Lead]:
        """Get lead with manager relationship loaded"""
        result = await self.db.execute(
            select(Lead)
            .options(selectinload(Lead.assigned_manager))
            .where(Lead.id == lead_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_status(
        self,
        status: LeadStatus,
        skip: int = 0,
        limit: int = 100
    ) -> List[Lead]:
        """Get leads by status"""
        result = await self.db.execute(
            select(Lead)
            .where(Lead.status == status)
            .options(selectinload(Lead.assigned_manager))
            .offset(skip)
            .limit(limit)
            .order_by(Lead.created_at.desc())
        )
        return list(result.scalars().all())
    
    async def get_by_manager(
        self,
        manager_id: UUID,
        skip: int = 0,
        limit: int = 100
    ) -> List[Lead]:
        """Get leads assigned to manager"""
        result = await self.db.execute(
            select(Lead)
            .where(Lead.assigned_manager_id == manager_id)
            .options(selectinload(Lead.assigned_manager))
            .offset(skip)
            .limit(limit)
            .order_by(Lead.created_at.desc())
        )
        return list(result.scalars().all())
    
    async def count_by_status(self, status: LeadStatus) -> int:
        """Count leads by status"""
        result = await self.db.execute(
            select(func.count(Lead.id)).where(Lead.status == status)
        )
        return result.scalar() or 0
    
    async def count_by_manager(self, manager_id: UUID) -> int:
        """Count leads by manager"""
        result = await self.db.execute(
            select(func.count(Lead.id)).where(Lead.assigned_manager_id == manager_id)
        )
        return result.scalar() or 0
    
    async def get_leads_by_date_range(
        self,
        start_date: datetime,
        end_date: datetime
    ) -> List[Lead]:
        """Get leads within date range"""
        result = await self.db.execute(
            select(Lead)
            .where(
                and_(
                    Lead.created_at >= start_date,
                    Lead.created_at <= end_date
                )
            )
            .options(selectinload(Lead.assigned_manager))
            .order_by(Lead.created_at.desc())
        )
        return list(result.scalars().all())
    
    async def update_status(
        self,
        lead_id: UUID,
        new_status: LeadStatus
    ) -> Optional[Lead]:
        """Update lead status"""
        lead = await self.get(lead_id)
        if lead:
            lead.status = new_status
            await self.db.flush()
            await self.db.refresh(lead)
        return lead
    
    async def assign_manager(
        self,
        lead_id: UUID,
        manager_id: UUID
    ) -> Optional[Lead]:
        """Assign lead to manager"""
        lead = await self.get(lead_id)
        if lead:
            lead.assigned_manager_id = manager_id
            await self.db.flush()
            await self.db.refresh(lead)
        return lead
