"""Lead service"""
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from backend.db.repositories import LeadRepository, ManagerRepository, HistoryRepository
from backend.models import Lead, LeadStatus, HistoryAction, Manager
from backend.schemas import LeadCreateRequest
from backend.services.distribution import get_distribution_service
from backend.core.config import settings
from backend.core.logging import get_logger

logger = get_logger(__name__)


class LeadService:
    """Service for managing leads"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.lead_repo = LeadRepository(db)
        self.manager_repo = ManagerRepository(db)
        self.history_repo = HistoryRepository(db)
    
    async def create_lead(
        self,
        data: LeadCreateRequest
    ) -> Lead:
        """
        Create new lead and assign manager
        
        Args:
            data: Lead creation data
            
        Returns:
            Created lead
        """
        # Check for duplicate by external_id
        if data.external_id:
            existing = await self.lead_repo.get_by_external_id(data.external_id)
            if existing:
                logger.warning(
                    "Duplicate lead attempt",
                    external_id=data.external_id,
                    existing_id=str(existing.id)
                )
                return existing
        
        # Create lead
        lead = await self.lead_repo.create(**data.model_dump())
        logger.info("Lead created", lead_id=str(lead.id), external_id=lead.external_id)
        
        # Add creation history
        await self.history_repo.add_history(
            lead_id=lead.id,
            action=HistoryAction.CREATED,
            new_value=f"Заявка создана: {lead.client_name}"
        )
        
        # Assign manager
        distribution_service = get_distribution_service(settings.DISTRIBUTION_ALGORITHM)
        manager = await distribution_service.assign_manager(self.db)
        
        if manager:
            await self.assign_manager(lead.id, manager.id)
        else:
            logger.warning("No manager available for assignment", lead_id=str(lead.id))
        
        await self.db.commit()
        return lead
    
    async def assign_manager(
        self,
        lead_id: UUID,
        manager_id: UUID,
        reassign: bool = False
    ) -> Lead:
        """
        Assign lead to manager
        
        Args:
            lead_id: Lead ID
            manager_id: Manager ID
            reassign: Whether this is a reassignment
            
        Returns:
            Updated lead
        """
        lead = await self.lead_repo.get(lead_id)
        if not lead:
            raise ValueError(f"Lead {lead_id} not found")
        
        manager = await self.manager_repo.get(manager_id)
        if not manager:
            raise ValueError(f"Manager {manager_id} not found")
        
        old_manager_id = lead.assigned_manager_id
        
        # Update lead
        lead.assigned_manager_id = manager_id
        await self.db.flush()
        
        # Update manager counters
        if old_manager_id and reassign:
            await self.manager_repo.decrement_leads_count(old_manager_id)
        
        await self.manager_repo.increment_leads_count(manager_id)
        
        # Add history
        action = HistoryAction.MANAGER_CHANGED if reassign else HistoryAction.ASSIGNED
        await self.history_repo.add_history(
            lead_id=lead_id,
            manager_id=manager_id,
            action=action,
            old_value=str(old_manager_id) if old_manager_id else None,
            new_value=str(manager_id)
        )
        
        logger.info(
            "Manager assigned",
            lead_id=str(lead_id),
            manager_id=str(manager_id),
            reassign=reassign
        )
        
        await self.db.commit()
        return lead
    
    async def update_status(
        self,
        lead_id: UUID,
        new_status: LeadStatus,
        manager_id: Optional[UUID] = None
    ) -> Lead:
        """
        Update lead status
        
        Args:
            lead_id: Lead ID
            new_status: New status
            manager_id: Manager performing the action
            
        Returns:
            Updated lead
        """
        lead = await self.lead_repo.get(lead_id)
        if not lead:
            raise ValueError(f"Lead {lead_id} not found")
        
        old_status = lead.status
        lead.status = new_status
        await self.db.flush()
        
        # Add history
        await self.history_repo.add_history(
            lead_id=lead_id,
            manager_id=manager_id,
            action=HistoryAction.STATUS_CHANGED,
            old_value=old_status,
            new_value=new_status
        )
        
        # Decrement manager counter if lead is closed
        if new_status in [LeadStatus.SUCCESS, LeadStatus.REJECTED, LeadStatus.CLOSED]:
            if lead.assigned_manager_id:
                await self.manager_repo.decrement_leads_count(lead.assigned_manager_id)
        # Increment if lead is taken to work from NEW
        elif old_status == LeadStatus.NEW and new_status == LeadStatus.IN_PROGRESS:
            # Counter already incremented during assignment
            pass
        
        logger.info(
            "Lead status updated",
            lead_id=str(lead_id),
            old_status=old_status,
            new_status=new_status
        )
        
        await self.db.commit()
        return lead
    
    async def get_lead(self, lead_id: UUID) -> Optional[Lead]:
        """Get lead by ID"""
        return await self.lead_repo.get_with_manager(lead_id)
    
    async def get_leads_by_status(
        self,
        status: LeadStatus,
        skip: int = 0,
        limit: int = 100
    ) -> List[Lead]:
        """Get leads by status"""
        return await self.lead_repo.get_by_status(status, skip, limit)
    
    async def get_manager_leads(
        self,
        manager_id: UUID,
        skip: int = 0,
        limit: int = 100
    ) -> List[Lead]:
        """Get leads assigned to manager"""
        return await self.lead_repo.get_by_manager(manager_id, skip, limit)
