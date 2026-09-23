"""Role filter for bot handlers"""
from typing import Union
from aiogram.filters import BaseFilter
from aiogram.types import Message, CallbackQuery
from sqlalchemy.ext.asyncio import AsyncSession
from backend.db import AsyncSessionLocal
from backend.services import ManagerService
from backend.core.config import settings


class IsAdminFilter(BaseFilter):
    """Filter to check if user is admin"""
    
    async def __call__(
        self,
        event: Union[Message, CallbackQuery]
    ) -> bool:
        """Check if user is admin"""
        user = event.from_user
        if not user:
            return False
        
        # Check if user is in admin IDs from config
        if user.id in settings.admin_ids:
            return True
        
        # Check in database
        async with AsyncSessionLocal() as db:
            manager_service = ManagerService(db)
            return await manager_service.is_admin(user.id)


class IsManagerFilter(BaseFilter):
    """Filter to check if user is registered manager"""
    
    async def __call__(
        self,
        event: Union[Message, CallbackQuery]
    ) -> bool:
        """Check if user is manager"""
        user = event.from_user
        if not user:
            return False
        
        async with AsyncSessionLocal() as db:
            manager_service = ManagerService(db)
            manager = await manager_service.get_manager_by_telegram_id(user.id)
            # Administrators can use the manager handlers too; /start provisions
            # the admin record on first use.
            return (manager is not None and manager.is_active) or user.id in settings.admin_ids
