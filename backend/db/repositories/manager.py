"""Manager repository"""
from typing import Optional, List
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from backend.models import Manager
from .base import BaseRepository


class ManagerRepository(BaseRepository[Manager]):
    """Repository for Manager model"""
    
    def __init__(self, db: AsyncSession):
        super().__init__(Manager, db)
    
    async def get_by_telegram_id(self, telegram_id: int) -> Optional[Manager]:
        """Get manager by Telegram ID"""
        result = await self.db.execute(
            select(Manager).where(Manager.telegram_id == telegram_id)
        )
        return result.scalar_one_or_none()
    
    async def get_active_managers(self) -> List[Manager]:
        """Get all active managers"""
        result = await self.db.execute(
            select(Manager)
            .where(Manager.is_active == True)
            .order_by(Manager.created_at)
        )
        return list(result.scalars().all())
    
    async def get_least_loaded_manager(self) -> Optional[Manager]:
        """Get manager with least current leads"""
        result = await self.db.execute(
            select(Manager)
            .where(Manager.is_active == True)
            .order_by(Manager.current_leads_count.asc())
            .limit(1)
        )
        return result.scalar_one_or_none()
    
    async def increment_leads_count(self, manager_id) -> None:
        """Increment current leads count"""
        await self.db.execute(
            update(Manager)
            .where(Manager.id == manager_id)
            .values(
                current_leads_count=Manager.current_leads_count + 1,
                total_leads_processed=Manager.total_leads_processed + 1
            )
        )
        await self.db.flush()
    
    async def decrement_leads_count(self, manager_id) -> None:
        """Decrement current leads count"""
        await self.db.execute(
            update(Manager)
            .where(Manager.id == manager_id)
            .values(current_leads_count=Manager.current_leads_count - 1)
        )
        await self.db.flush()
    
    async def is_admin(self, telegram_id: int) -> bool:
        """Check if user is admin"""
        result = await self.db.execute(
            select(Manager.is_admin)
            .where(Manager.telegram_id == telegram_id)
        )
        is_admin = result.scalar_one_or_none()
        return is_admin or False
