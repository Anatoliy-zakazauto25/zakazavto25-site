"""Manager handlers"""
from aiogram import Router, F
from aiogram.filters import Command
from aiogram.types import Message
from backend.db import AsyncSessionLocal
from backend.services import LeadService, ManagerService
from backend.schemas import ManagerCreate
from backend.models import LeadStatus
from backend.utils import format_lead_message
from backend.bot.filters import IsManagerFilter
from backend.core.config import settings
from backend.core.logging import get_logger

logger = get_logger(__name__)

router = Router()
router.message.filter(IsManagerFilter())


@router.message(Command("start"))
async def cmd_start(message: Message):
    """Handle /start command"""
    async with AsyncSessionLocal() as db:
        manager_service = ManagerService(db)
        manager = await manager_service.get_manager_by_telegram_id(message.from_user.id)

        if not manager and message.from_user.id in settings.admin_ids:
            manager = await manager_service.create_manager(
                ManagerCreate(
                    telegram_id=message.from_user.id,
                    username=message.from_user.username,
                    full_name=message.from_user.full_name,
                    is_admin=True,
                )
            )
        
        if manager:
            await message.answer(
                f"👋 Привет, {manager.full_name}!\n\n"
                f"Вы зарегистрированы как менеджер.\n"
                f"Новые заявки будут приходить вам автоматически.\n\n"
                f"Доступные команды:\n"
                f"/my_leads - мои заявки\n"
                f"/help - справка"
            )
        else:
            await message.answer(
                "❌ Вы не зарегистрированы как менеджер.\n"
                "Обратитесь к администратору."
            )


@router.message(Command("help"))
async def cmd_help(message: Message):
    """Handle /help command"""
    help_text = """
📋 <b>Справка по боту</b>

<b>Команды:</b>
/start - начать работу
/my_leads - мои текущие заявки
/help - эта справка

<b>Работа с заявками:</b>

При получении новой заявки используйте кнопки:
• 📞 Взять в работу - начать обработку
• ⏳ Перезвонить позже - отложить заявку
• ✅ Успешно - успешно закрыть
• ❌ Отказ - отказ клиента
• 🔄 Передать - передать другому менеджеру
• 📜 История - посмотреть историю заявки

<b>Статусы заявок:</b>
🆕 Новая - только что получена
🔄 В работе - взята в обработку
⏳ Перезвонить - ожидает повторного звонка
✅ Успешно - успешно закрыта
❌ Отказ - клиент отказался
🔒 Закрыта - завершена

По вопросам обращайтесь к администратору.
"""
    await message.answer(help_text, parse_mode="HTML")


@router.message(Command("my_leads"))
async def cmd_my_leads(message: Message):
    """Handle /my_leads command - show manager's active leads"""
    async with AsyncSessionLocal() as db:
        manager_service = ManagerService(db)
        manager = await manager_service.get_manager_by_telegram_id(message.from_user.id)
        
        if not manager:
            await message.answer("❌ Менеджер не найден")
            return
        
        lead_service = LeadService(db)
        leads = await lead_service.get_manager_leads(manager.id, limit=10)
        
        if not leads:
            await message.answer("📭 У вас нет активных заявок")
            return
        
        # Filter only active leads
        active_leads = [
            lead for lead in leads
            if lead.status not in [LeadStatus.SUCCESS, LeadStatus.REJECTED, LeadStatus.CLOSED]
        ]
        
        if not active_leads:
            await message.answer("📭 У вас нет активных заявок")
            return
        
        await message.answer(
            f"📋 <b>Ваши активные заявки ({len(active_leads)}):</b>\n",
            parse_mode="HTML"
        )
        
        from backend.bot.keyboards import get_lead_keyboard
        
        for lead in active_leads:
            text = format_lead_message(lead, manager)
            keyboard = get_lead_keyboard(lead.id, lead.status)
            
            await message.answer(
                text,
                reply_markup=keyboard,
                parse_mode="HTML"
            )
