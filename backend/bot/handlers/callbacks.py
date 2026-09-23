"""Callback handlers for lead actions"""
from uuid import UUID
from aiogram import Router, F
from aiogram.types import CallbackQuery
from backend.db import AsyncSessionLocal
from backend.services import LeadService, ManagerService, NotificationService
from backend.models import LeadStatus
from backend.utils import format_lead_message, format_history_message
from backend.bot.keyboards import get_lead_keyboard, get_manager_list_keyboard
from backend.bot.filters import IsManagerFilter
from backend.core.logging import get_logger
from backend.core.config import settings

logger = get_logger(__name__)

router = Router()
router.callback_query.filter(IsManagerFilter())


@router.callback_query(F.data.startswith("lead_take:"))
async def callback_lead_take(callback: CallbackQuery):
    """Handle 'Take to work' button"""
    lead_id_str = callback.data.split(":")[1]
    lead_id = UUID(lead_id_str)
    
    async with AsyncSessionLocal() as db:
        manager_service = ManagerService(db)
        manager = await manager_service.get_manager_by_telegram_id(callback.from_user.id)
        
        if not manager:
            await callback.answer("❌ Менеджер не найден", show_alert=True)
            return
        
        lead_service = LeadService(db)
        lead = await lead_service.get_lead(lead_id)
        
        if not lead:
            await callback.answer("❌ Заявка не найдена", show_alert=True)
            return
        
        # Check if already taken by another manager
        if (lead.status == LeadStatus.IN_PROGRESS and 
            lead.assigned_manager_id != manager.id):
            await callback.answer(
                f"⚠️ Заявка уже в работе у {lead.assigned_manager.full_name}",
                show_alert=True
            )
            return
        
        # Update status
        await lead_service.update_status(
            lead_id,
            LeadStatus.IN_PROGRESS,
            manager.id
        )
        
        # Update message
        lead = await lead_service.get_lead(lead_id)
        text = format_lead_message(lead, manager)
        keyboard = get_lead_keyboard(lead_id, LeadStatus.IN_PROGRESS)
        
        await callback.message.edit_text(
            text,
            reply_markup=keyboard,
            parse_mode="HTML"
        )
        
        # Update in chat if message exists
        if lead.chat_message_id:
            try:
                from aiogram import Bot
                bot = Bot(token=settings.BOT_TOKEN)
                notification_service = NotificationService(bot)
                
                await notification_service.update_lead_message(
                    settings.MANAGER_CHAT_ID,
                    lead.chat_message_id,
                    lead,
                    manager
                )
            except Exception as e:
                logger.error("Failed to update chat message", error=str(e))
        
        await callback.answer("✅ Заявка взята в работу")


@router.callback_query(F.data.startswith("lead_success:"))
async def callback_lead_success(callback: CallbackQuery):
    """Handle 'Success' button"""
    lead_id_str = callback.data.split(":")[1]
    lead_id = UUID(lead_id_str)
    
    async with AsyncSessionLocal() as db:
        manager_service = ManagerService(db)
        manager = await manager_service.get_manager_by_telegram_id(callback.from_user.id)
        
        if not manager:
            await callback.answer("❌ Менеджер не найден", show_alert=True)
            return
        
        lead_service = LeadService(db)
        lead = await lead_service.get_lead(lead_id)
        
        if not lead:
            await callback.answer("❌ Заявка не найдена", show_alert=True)
            return
        
        # Update status
        await lead_service.update_status(
            lead_id,
            LeadStatus.SUCCESS,
            manager.id
        )
        
        # Update message
        lead = await lead_service.get_lead(lead_id)
        text = format_lead_message(lead, manager)
        keyboard = get_lead_keyboard(lead_id, LeadStatus.SUCCESS)
        
        await callback.message.edit_text(
            text,
            reply_markup=keyboard,
            parse_mode="HTML"
        )
        
        # Update in chat
        if lead.chat_message_id:
            try:
                from aiogram import Bot
                bot = Bot(token=settings.BOT_TOKEN)
                notification_service = NotificationService(bot)
                
                await notification_service.update_lead_message(
                    settings.MANAGER_CHAT_ID,
                    lead.chat_message_id,
                    lead,
                    manager
                )
            except Exception as e:
                logger.error("Failed to update chat message", error=str(e))
        
        await callback.answer("✅ Заявка успешно закрыта")


@router.callback_query(F.data.startswith("lead_reject:"))
async def callback_lead_reject(callback: CallbackQuery):
    """Handle 'Reject' button"""
    lead_id_str = callback.data.split(":")[1]
    lead_id = UUID(lead_id_str)
    
    async with AsyncSessionLocal() as db:
        manager_service = ManagerService(db)
        manager = await manager_service.get_manager_by_telegram_id(callback.from_user.id)
        
        if not manager:
            await callback.answer("❌ Менеджер не найден", show_alert=True)
            return
        
        lead_service = LeadService(db)
        lead = await lead_service.get_lead(lead_id)
        
        if not lead:
            await callback.answer("❌ Заявка не найдена", show_alert=True)
            return
        
        # Update status
        await lead_service.update_status(
            lead_id,
            LeadStatus.REJECTED,
            manager.id
        )
        
        # Update message
        lead = await lead_service.get_lead(lead_id)
        text = format_lead_message(lead, manager)
        keyboard = get_lead_keyboard(lead_id, LeadStatus.REJECTED)
        
        await callback.message.edit_text(
            text,
            reply_markup=keyboard,
            parse_mode="HTML"
        )
        
        # Update in chat
        if lead.chat_message_id:
            try:
                from aiogram import Bot
                bot = Bot(token=settings.BOT_TOKEN)
                notification_service = NotificationService(bot)
                
                await notification_service.update_lead_message(
                    settings.MANAGER_CHAT_ID,
                    lead.chat_message_id,
                    lead,
                    manager
                )
            except Exception as e:
                logger.error("Failed to update chat message", error=str(e))
        
        await callback.answer("✅ Отказ зафиксирован")


@router.callback_query(F.data.startswith("lead_callback:"))
async def callback_lead_callback(callback: CallbackQuery):
    """Handle 'Callback later' button"""
    lead_id_str = callback.data.split(":")[1]
    lead_id = UUID(lead_id_str)
    
    async with AsyncSessionLocal() as db:
        manager_service = ManagerService(db)
        manager = await manager_service.get_manager_by_telegram_id(callback.from_user.id)
        
        if not manager:
            await callback.answer("❌ Менеджер не найден", show_alert=True)
            return
        
        lead_service = LeadService(db)
        lead = await lead_service.get_lead(lead_id)
        
        if not lead:
            await callback.answer("❌ Заявка не найдена", show_alert=True)
            return
        
        # Update status
        await lead_service.update_status(
            lead_id,
            LeadStatus.CALLBACK,
            manager.id
        )
        
        # Update message
        lead = await lead_service.get_lead(lead_id)
        text = format_lead_message(lead, manager)
        keyboard = get_lead_keyboard(lead_id, LeadStatus.CALLBACK)
        
        await callback.message.edit_text(
            text,
            reply_markup=keyboard,
            parse_mode="HTML"
        )
        
        # Update in chat
        if lead.chat_message_id:
            try:
                from aiogram import Bot
                bot = Bot(token=settings.BOT_TOKEN)
                notification_service = NotificationService(bot)
                
                await notification_service.update_lead_message(
                    settings.MANAGER_CHAT_ID,
                    lead.chat_message_id,
                    lead,
                    manager
                )
            except Exception as e:
                logger.error("Failed to update chat message", error=str(e))
        
        await callback.answer("⏳ Статус обновлен: перезвонить позже")


@router.callback_query(F.data.startswith("lead_history:"))
async def callback_lead_history(callback: CallbackQuery):
    """Show lead history"""
    lead_id_str = callback.data.split(":")[1]
    lead_id = UUID(lead_id_str)
    
    async with AsyncSessionLocal() as db:
        from backend.db.repositories import HistoryRepository
        
        history_repo = HistoryRepository(db)
        history_entries = await history_repo.get_lead_history(lead_id)
        
        message = format_history_message(history_entries)
        
        await callback.message.answer(
            message,
            parse_mode="HTML"
        )
    
    await callback.answer("📜 История заявки")


@router.callback_query(F.data.startswith("lead_transfer:"))
async def callback_lead_transfer(callback: CallbackQuery):
    """Show manager list for transfer"""
    lead_id_str = callback.data.split(":")[1]
    lead_id = UUID(lead_id_str)
    
    async with AsyncSessionLocal() as db:
        manager_service = ManagerService(db)
        managers = await manager_service.get_active_managers()
        
        # Exclude current manager
        current_manager = await manager_service.get_manager_by_telegram_id(
            callback.from_user.id
        )
        if current_manager:
            managers = [m for m in managers if m.id != current_manager.id]
        
        if not managers:
            await callback.answer("❌ Нет доступных менеджеров", show_alert=True)
            return
        
        keyboard = get_manager_list_keyboard(managers, lead_id)
        
        await callback.message.answer(
            "👥 Выберите менеджера для передачи заявки:",
            reply_markup=keyboard
        )
    
    await callback.answer()


@router.callback_query(F.data.startswith("transfer_to:"))
async def callback_transfer_to(callback: CallbackQuery):
    """Transfer lead to selected manager"""
    parts = callback.data.split(":")
    lead_id = UUID(parts[1])
    new_manager_id = UUID(parts[2])
    
    async with AsyncSessionLocal() as db:
        lead_service = LeadService(db)
        
        try:
            lead = await lead_service.assign_manager(
                lead_id,
                new_manager_id,
                reassign=True
            )
            
            manager_service = ManagerService(db)
            new_manager = await manager_service.get_manager(new_manager_id)
            
            await callback.message.edit_text(
                f"✅ Заявка передана менеджеру {new_manager.full_name}"
            )
            
            # Notify new manager
            from aiogram import Bot
            bot = Bot(token=settings.BOT_TOKEN)
            notification_service = NotificationService(bot)
            
            await notification_service.send_new_lead_to_manager(lead, new_manager)
            
            await callback.answer("✅ Заявка передана")
            
        except Exception as e:
            logger.error("Failed to transfer lead", error=str(e))
            await callback.answer("❌ Ошибка при передаче заявки", show_alert=True)


@router.callback_query(F.data.startswith("transfer_cancel:"))
async def callback_transfer_cancel(callback: CallbackQuery):
    """Cancel transfer"""
    await callback.message.edit_text("❌ Передача отменена")
    await callback.answer()
