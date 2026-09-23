"""Manager distribution service"""
from typing import Optional
from abc import ABC, abstractmethod
from sqlalchemy.ext.asyncio import AsyncSession
from backend.db.repositories import ManagerRepository
from backend.models import Manager
from backend.core.logging import get_logger

logger = get_logger(__name__)


class DistributionStrategy(ABC):
    """Abstract base class for distribution strategies"""
    
    @abstractmethod
    async def get_next_manager(
        self,
        db: AsyncSession
    ) -> Optional[Manager]:
        """Get next manager for lead assignment"""
        pass


class RoundRobinStrategy(DistributionStrategy):
    """Round-robin distribution strategy"""
    
    def __init__(self):
        self._current_index = 0
    
    async def get_next_manager(
        self,
        db: AsyncSession
    ) -> Optional[Manager]:
        """Get next manager in round-robin order"""
        repo = ManagerRepository(db)
        managers = await repo.get_active_managers()
        
        if not managers:
            logger.warning("No active managers available")
            return None
        
        # Get manager at current index
        manager = managers[self._current_index % len(managers)]
        
        # Move to next index
        self._current_index = (self._current_index + 1) % len(managers)
        
        logger.info(
            "Manager selected (round-robin)",
            manager_id=str(manager.id),
            manager_name=manager.full_name,
            index=self._current_index
        )
        
        return manager


class LeastLoadedStrategy(DistributionStrategy):
    """Least loaded distribution strategy"""
    
    async def get_next_manager(
        self,
        db: AsyncSession
    ) -> Optional[Manager]:
        """Get manager with least current leads"""
        repo = ManagerRepository(db)
        manager = await repo.get_least_loaded_manager()
        
        if not manager:
            logger.warning("No active managers available")
            return None
        
        logger.info(
            "Manager selected (least loaded)",
            manager_id=str(manager.id),
            manager_name=manager.full_name,
            current_leads=manager.current_leads_count
        )
        
        return manager


class DistributionService:
    """Service for distributing leads to managers"""
    
    def __init__(self, strategy: DistributionStrategy):
        self.strategy = strategy
    
    async def assign_manager(
        self,
        db: AsyncSession
    ) -> Optional[Manager]:
        """Assign next available manager"""
        return await self.strategy.get_next_manager(db)


# Factory function
def get_distribution_service(algorithm: str = "round_robin") -> DistributionService:
    """
    Get distribution service with specified algorithm
    
    Args:
        algorithm: Distribution algorithm (round_robin, least_loaded)
        
    Returns:
        DistributionService instance
    """
    strategies = {
        "round_robin": RoundRobinStrategy(),
        "least_loaded": LeastLoadedStrategy(),
    }
    
    strategy = strategies.get(algorithm, RoundRobinStrategy())
    return DistributionService(strategy)
