"""Manager service"""
from typing import Optional, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from backend.db.repositories import ManagerRepository
from backend.models import Manager
from backend.schemas import ManagerCreate, ManagerUpdate
from backend.core.logging import get_logger

logger = get_logger(__name__)


class ManagerService:
    """Service for managing managers"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.manager_repo = ManagerRepository(db)
    
    async def create_manager(self, data: ManagerCreate) -> Manager:
        """
        Create new manager
        
        Args:
            data: Manager creation data
            
        Returns:
            Created manager
        """
        # Check if manager already exists
        existing = await self.manager_repo.get_by_telegram_id(data.telegram_id)
        if existing:
            logger.warning(
                "Manager already exists",
                telegram_id=data.telegram_id,
                manager_id=str(existing.id)
            )
            return existing
        
        manager = await self.manager_repo.create(**data.model_dump())
        await self.db.commit()
        
        logger.info(
            "Manager created",
            manager_id=str(manager.id),
            telegram_id=manager.telegram_id,
            full_name=manager.full_name
        )
        
        return manager
    
    async def update_manager(
        self,
        manager_id: UUID,
        data: ManagerUpdate
    ) -> Optional[Manager]:
        """
        Update manager
        
        Args:
            manager_id: Manager ID
            data: Update data
            
        Returns:
            Updated manager
        """
        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            return await self.manager_repo.get(manager_id)
        
        manager = await self.manager_repo.update(manager_id, **update_data)
        await self.db.commit()
        
        logger.info("Manager updated", manager_id=str(manager_id), updates=update_data)
        
        return manager
    
    async def get_manager(self, manager_id: UUID) -> Optional[Manager]:
        """Get manager by ID"""
        return await self.manager_repo.get(manager_id)
    
    async def get_manager_by_telegram_id(
        self,
        telegram_id: int
    ) -> Optional[Manager]:
        """Get manager by Telegram ID"""
        return await self.manager_repo.get_by_telegram_id(telegram_id)
    
    async def get_all_managers(self) -> List[Manager]:
        """Get all managers"""
        return await self.manager_repo.get_all()
    
    async def get_active_managers(self) -> List[Manager]:
        """Get active managers"""
        return await self.manager_repo.get_active_managers()
    
    async def activate_manager(self, manager_id: UUID) -> Optional[Manager]:
        """Activate manager"""
        return await self.update_manager(
            manager_id,
            ManagerUpdate(is_active=True)
        )
    
    async def deactivate_manager(self, manager_id: UUID) -> Optional[Manager]:
        """Deactivate manager"""
        return await self.update_manager(
            manager_id,
            ManagerUpdate(is_active=False)
        )
    
    async def is_admin(self, telegram_id: int) -> bool:
        """Check if user is admin"""
        return await self.manager_repo.is_admin(telegram_id)
