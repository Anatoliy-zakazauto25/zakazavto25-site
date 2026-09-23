"""Admin handlers"""
from uuid import UUID
from aiogram import Router, F
from aiogram.filters import Command
from aiogram.types import Message, CallbackQuery
from backend.db import AsyncSessionLocal
from backend.services import ManagerService, StatisticsService
from backend.schemas import ManagerCreate
from backend.bot.filters import IsAdminFilter
from backend.bot.keyboards import get_admin_keyboard, get_stats_period_keyboard
from backend.utils import format_statistics_message
from backend.core.logging import get_logger

logger = get_logger(__name__)

router = Router()
router.message.filter(IsAdminFilter())
router.callback_query.filter(IsAdminFilter())


@router.message(Command("admin"))
async def cmd_admin(message: Message):
    """Handle /admin command"""
    await message.answer(
        "🔧 <b>Панель администратора</b>\n\n"
        "Выберите действие:",
        reply_markup=get_admin_keyboard(),
        parse_mode="HTML"
    )


@router.message(Command("add_manager"))
async def cmd_add_manager(message: Message):
    """
    Handle /add_manager command
    Format: /add_manager @username Full Name
    """
    args = message.text.split(maxsplit=2)
    
    if len(args) < 3:
        await message.answer(
            "❌ Неверный формат\n\n"
            "Использование:\n"
            "<code>/add_manager @username Полное Имя</code>\n\n"
            "Пример:\n"
            "<code>/add_manager @ivan Иван Петров</code>",
            parse_mode="HTML"
        )
        return
    
    username = args[1].lstrip('@')
    full_name = args[2]
    
    await message.answer(
        "⚠️ Для завершения регистрации менеджер должен:\n"
        f"1. Отправить команду /start боту\n"
        f"2. Или вы можете указать его Telegram ID\n\n"
        f"Имя: {full_name}\n"
        f"Username: @{username}\n\n"
        "Отправьте Telegram ID менеджера или /cancel для отмены:"
    )
    
    # In production, use FSM (Finite State Machine) for conversation
    # For simplicity, just show the instruction


@router.callback_query(F.data == "admin_menu")
async def callback_admin_menu(callback: CallbackQuery):
    """Show admin menu"""
    await callback.message.edit_text(
        "🔧 <b>Панель администратора</b>\n\n"
        "Выберите действие:",
        reply_markup=get_admin_keyboard(),
        parse_mode="HTML"
    )
    await callback.answer()


@router.callback_query(F.data == "admin_stats")
async def callback_admin_stats(callback: CallbackQuery):
    """Show statistics menu"""
    await callback.message.edit_text(
        "📊 <b>Статистика</b>\n\n"
        "Выберите период:",
        reply_markup=get_stats_period_keyboard(),
        parse_mode="HTML"
    )
    await callback.answer()


@router.callback_query(F.data == "stats_general")
async def callback_stats_general(callback: CallbackQuery):
    """Show general statistics"""
    async with AsyncSessionLocal() as db:
        stats_service = StatisticsService(db)
        stats = await stats_service.get_general_statistics()
        
        message = format_statistics_message(stats)
        
        await callback.message.answer(
            message,
            parse_mode="HTML"
        )
    
    await callback.answer("✅ Общая статистика")


@router.callback_query(F.data == "stats_today")
async def callback_stats_today(callback: CallbackQuery):
    """Show today's statistics"""
    async with AsyncSessionLocal() as db:
        stats_service = StatisticsService(db)
        stats = await stats_service.get_today_statistics()
        
        message = format_statistics_message(stats)
        
        await callback.message.answer(
            message,
            parse_mode="HTML"
        )
    
    await callback.answer("✅ Статистика за сегодня")


@router.callback_query(F.data == "stats_week")
async def callback_stats_week(callback: CallbackQuery):
    """Show week statistics"""
    async with AsyncSessionLocal() as db:
        stats_service = StatisticsService(db)
        stats = await stats_service.get_week_statistics()
        
        message = format_statistics_message(stats)
        
        await callback.message.answer(
            message,
            parse_mode="HTML"
        )
    
    await callback.answer("✅ Статистика за неделю")


@router.callback_query(F.data == "stats_month")
async def callback_stats_month(callback: CallbackQuery):
    """Show month statistics"""
    async with AsyncSessionLocal() as db:
        stats_service = StatisticsService(db)
        stats = await stats_service.get_month_statistics()
        
        message = format_statistics_message(stats)
        
        await callback.message.answer(
            message,
            parse_mode="HTML"
        )
    
    await callback.answer("✅ Статистика за месяц")


@router.callback_query(F.data == "admin_managers")
async def callback_admin_managers(callback: CallbackQuery):
    """Show managers list"""
    async with AsyncSessionLocal() as db:
        manager_service = ManagerService(db)
        managers = await manager_service.get_all_managers()
        
        if not managers:
            await callback.message.answer("📭 Менеджеры не найдены")
            await callback.answer()
            return
        
        lines = ["👥 <b>Список менеджеров:</b>\n"]
        
        for manager in managers:
            status = "✅" if manager.is_active else "❌"
            admin = "👑" if manager.is_admin else ""
            
            lines.append(
                f"{status} {admin} <b>{manager.full_name}</b>\n"
                f"   @{manager.username or 'нет'}\n"
                f"   ID: <code>{manager.telegram_id}</code>\n"
                f"   Текущих: {manager.current_leads_count}, "
                f"Всего: {manager.total_leads_processed}\n"
            )
        
        await callback.message.answer(
            "\n".join(lines),
            parse_mode="HTML"
        )
    
    await callback.answer()


@router.callback_query(F.data == "admin_leads")
async def callback_admin_leads(callback: CallbackQuery):
    """Show recent leads"""
    async with AsyncSessionLocal() as db:
        from backend.db.repositories import LeadRepository
        
        lead_repo = LeadRepository(db)
        leads = await lead_repo.get_all(skip=0, limit=10)
        
        if not leads:
            await callback.message.answer("📭 Заявки не найдены")
            await callback.answer()
            return
        
        await callback.message.answer(
            f"📋 <b>Последние {len(leads)} заявок:</b>",
            parse_mode="HTML"
        )
        
        from backend.utils import format_lead_message
        from backend.bot.keyboards import get_lead_keyboard
        
        for lead in leads:
            text = format_lead_message(lead, lead.assigned_manager)
            keyboard = get_lead_keyboard(lead.id, lead.status)
            
            await callback.message.answer(
                text,
                reply_markup=keyboard,
                parse_mode="HTML"
            )
    
    await callback.answer()
