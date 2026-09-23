"""Notification service for Telegram"""
from typing import Optional
from uuid import UUID
from aiogram import Bot
from aiogram.exceptions import TelegramAPIError
from backend.models import Lead, Manager
from backend.core.config import settings
from backend.core.logging import get_logger
from backend.utils.formatters import format_lead_message

logger = get_logger(__name__)


class NotificationService:
    """Service for sending Telegram notifications"""
    
    def __init__(self, bot: Bot):
        self.bot = bot
    
    async def send_new_lead_to_chat(
        self,
        lead: Lead,
        manager: Manager
    ) -> Optional[int]:
        """
        Send new lead notification to manager chat
        
        Args:
            lead: Lead instance
            manager: Assigned manager
            
        Returns:
            Message ID if sent successfully
        """
        try:
            from backend.bot.keyboards.inline import get_lead_keyboard
            
            message_text = format_lead_message(lead, manager)
            keyboard = get_lead_keyboard(lead.id, lead.status)
            
            message = await self.bot.send_message(
                chat_id=settings.MANAGER_CHAT_ID,
                text=message_text,
                reply_markup=keyboard,
                parse_mode="HTML"
            )
            
            logger.info(
                "Lead sent to manager chat",
                lead_id=str(lead.id),
                message_id=message.message_id
            )
            
            return message.message_id
            
        except TelegramAPIError as e:
            logger.error(
                "Failed to send lead to chat",
                lead_id=str(lead.id),
                error=str(e)
            )
            return None
    
    async def send_new_lead_to_manager(
        self,
        lead: Lead,
        manager: Manager
    ) -> Optional[int]:
        """
        Send new lead notification to manager's private chat
        
        Args:
            lead: Lead instance
            manager: Assigned manager
            
        Returns:
            Message ID if sent successfully
        """
        try:
            from backend.bot.keyboards.inline import get_lead_keyboard
            
            message_text = format_lead_message(lead, manager)
            keyboard = get_lead_keyboard(lead.id, lead.status)
            
            message = await self.bot.send_message(
                chat_id=manager.telegram_id,
                text=message_text,
                reply_markup=keyboard,
                parse_mode="HTML"
            )
            
            logger.info(
                "Lead sent to manager",
                lead_id=str(lead.id),
                manager_id=str(manager.id),
                message_id=message.message_id
            )
            
            return message.message_id
            
        except TelegramAPIError as e:
            logger.error(
                "Failed to send lead to manager",
                lead_id=str(lead.id),
                manager_id=str(manager.id),
                error=str(e)
            )
            return None
    
    async def update_lead_message(
        self,
        chat_id: int,
        message_id: int,
        lead: Lead,
        manager: Manager
    ) -> bool:
        """
        Update existing lead message
        
        Args:
            chat_id: Telegram chat ID
            message_id: Message ID to update
            lead: Updated lead instance
            manager: Assigned manager
            
        Returns:
            True if updated successfully
        """
        try:
            from backend.bot.keyboards.inline import get_lead_keyboard
            
            message_text = format_lead_message(lead, manager)
            keyboard = get_lead_keyboard(lead.id, lead.status)
            
            await self.bot.edit_message_text(
                chat_id=chat_id,
                message_id=message_id,
                text=message_text,
                reply_markup=keyboard,
                parse_mode="HTML"
            )
            
            logger.info(
                "Lead message updated",
                lead_id=str(lead.id),
                chat_id=chat_id,
                message_id=message_id
            )
            
            return True
            
        except TelegramAPIError as e:
            logger.error(
                "Failed to update lead message",
                lead_id=str(lead.id),
                chat_id=chat_id,
                message_id=message_id,
                error=str(e)
            )
            return False
    
    async def notify_admin(
        self,
        message: str,
        admin_id: Optional[int] = None
    ) -> None:
        """
        Send notification to admin
        
        Args:
            message: Notification message
            admin_id: Specific admin ID (if None, notifies all admins)
        """
        admin_ids = [admin_id] if admin_id else settings.admin_ids
        
        for admin_telegram_id in admin_ids:
            try:
                await self.bot.send_message(
                    chat_id=admin_telegram_id,
                    text=f"⚠️ <b>Уведомление администратора</b>\n\n{message}",
                    parse_mode="HTML"
                )
                logger.info("Admin notified", admin_id=admin_telegram_id)
            except TelegramAPIError as e:
                logger.error(
                    "Failed to notify admin",
                    admin_id=admin_telegram_id,
                    error=str(e)
                )
