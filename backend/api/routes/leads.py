"""Lead API routes"""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from backend.db.session import get_db
from backend.schemas import LeadCreateRequest, LeadCreateResponse, LeadResponse
from backend.services import LeadService, NotificationService
from backend.api.dependencies import verify_api_key, check_idempotency, save_idempotency_result
from backend.core.logging import get_logger
from backend.core.security import mask_sensitive_data

logger = get_logger(__name__)

router = APIRouter(prefix="/leads", tags=["leads"])


# Global bot instance (will be set from main)
_bot_instance = None


def set_bot_instance(bot):
    """Set bot instance for notifications"""
    global _bot_instance
    _bot_instance = bot


async def send_lead_notifications(
    lead_id: UUID,
    db: AsyncSession
):
    """
    Background task to send lead notifications
    
    Args:
        lead_id: Lead ID
        db: Database session
    """
    if not _bot_instance:
        logger.warning("Bot instance not available for notifications")
        return
    
    try:
        # Get lead service
        lead_service = LeadService(db)
        lead = await lead_service.get_lead(lead_id)
        
        if not lead or not lead.assigned_manager:
            logger.warning("Lead or manager not found", lead_id=str(lead_id))
            return
        
        # Send notifications
        notification_service = NotificationService(_bot_instance)
        
        # Send to manager chat
        chat_msg_id = await notification_service.send_new_lead_to_chat(
            lead,
            lead.assigned_manager
        )
        
        # Send to manager's private chat
        manager_msg_id = await notification_service.send_new_lead_to_manager(
            lead,
            lead.assigned_manager
        )
        
        # Update message IDs
        if chat_msg_id:
            lead.chat_message_id = chat_msg_id
        if manager_msg_id:
            lead.telegram_message_id = manager_msg_id
        
        await db.commit()
        
        logger.info(
            "Lead notifications sent",
            lead_id=str(lead_id),
            chat_msg_id=chat_msg_id,
            manager_msg_id=manager_msg_id
        )
        
    except Exception as e:
        logger.error(
            "Failed to send lead notifications",
            lead_id=str(lead_id),
            error=str(e)
        )


@router.post(
    "",
    response_model=LeadCreateResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(verify_api_key)]
)
async def create_lead(
    lead_data: LeadCreateRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    idempotency_key: str | None = Depends(check_idempotency)
):
    """
    Create new lead from website
    
    Requires API secret in X-API-Secret header.
    Supports idempotency via X-Idempotency-Key header.
    
    Args:
        lead_data: Lead data
        background_tasks: FastAPI background tasks
        db: Database session
        idempotency_key: Idempotency key for deduplication
        
    Returns:
        Lead creation response
    """
    try:
        # Log request (with masked sensitive data)
        logger.info(
            "Creating lead",
            data=mask_sensitive_data(lead_data.model_dump())
        )
        
        # Create lead
        lead_service = LeadService(db)
        lead = await lead_service.create_lead(lead_data)
        
        # Save idempotency result
        save_idempotency_result(idempotency_key, str(lead.id))
        
        # Schedule background notifications
        background_tasks.add_task(
            send_lead_notifications,
            lead.id,
            db
        )
        
        logger.info("Lead created successfully", lead_id=str(lead.id))
        
        return LeadCreateResponse(
            success=True,
            lead_id=lead.id,
            message="Заявка успешно принята"
        )
        
    except ValueError as e:
        logger.error("Lead creation validation error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error("Lead creation error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get(
    "/{lead_id}",
    response_model=LeadResponse,
    dependencies=[Depends(verify_api_key)]
)
async def get_lead(
    lead_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Get lead by ID
    
    Args:
        lead_id: Lead ID
        db: Database session
        
    Returns:
        Lead data
    """
    lead_service = LeadService(db)
    lead = await lead_service.get_lead(lead_id)
    
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found"
        )
    
    return lead
