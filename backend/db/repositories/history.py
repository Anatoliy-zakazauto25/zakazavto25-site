"""History repository"""
from typing import List
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from backend.models import LeadHistory, LeadComment, HistoryAction
from .base import BaseRepository


class HistoryRepository(BaseRepository[LeadHistory]):
    """Repository for LeadHistory model"""
    
    def __init__(self, db: AsyncSession):
        super().__init__(LeadHistory, db)
    
    async def get_lead_history(self, lead_id: UUID) -> List[LeadHistory]:
        """Get all history entries for a lead"""
        result = await self.db.execute(
            select(LeadHistory)
            .where(LeadHistory.lead_id == lead_id)
            .options(selectinload(LeadHistory.manager))
            .order_by(LeadHistory.created_at.asc())
        )
        return list(result.scalars().all())
    
    async def add_history(
        self,
        lead_id: UUID,
        action: HistoryAction,
        manager_id: UUID = None,
        old_value: str = None,
        new_value: str = None,
        comment: str = None
    ) -> LeadHistory:
        """Add history entry"""
        return await self.create(
            lead_id=lead_id,
            manager_id=manager_id,
            action=action,
            old_value=old_value,
            new_value=new_value,
            comment=comment
        )


class CommentRepository(BaseRepository[LeadComment]):
    """Repository for LeadComment model"""
    
    def __init__(self, db: AsyncSession):
        super().__init__(LeadComment, db)
    
    async def get_lead_comments(self, lead_id: UUID) -> List[LeadComment]:
        """Get all comments for a lead"""
        result = await self.db.execute(
            select(LeadComment)
            .where(LeadComment.lead_id == lead_id)
            .options(selectinload(LeadComment.manager))
            .order_by(LeadComment.created_at.asc())
        )
        return list(result.scalars().all())
    
    async def add_comment(
        self,
        lead_id: UUID,
        manager_id: UUID,
        comment: str
    ) -> LeadComment:
        """Add comment to lead"""
        return await self.create(
            lead_id=lead_id,
            manager_id=manager_id,
            comment=comment
        )
