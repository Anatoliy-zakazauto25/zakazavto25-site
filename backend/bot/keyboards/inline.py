"""Inline keyboards for bot"""
from uuid import UUID
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.utils.keyboard import InlineKeyboardBuilder
from backend.models.enums import LeadStatus


def get_lead_keyboard(lead_id: UUID, current_status: str) -> InlineKeyboardMarkup:
    """
    Get inline keyboard for lead message
    
    Args:
        lead_id: Lead ID
        current_status: Current lead status
        
    Returns:
        InlineKeyboardMarkup
    """
    builder = InlineKeyboardBuilder()
    
    # Buttons based on current status
    if current_status == LeadStatus.NEW:
        builder.row(
            InlineKeyboardButton(
                text="📞 Взять в работу",
                callback_data=f"lead_take:{lead_id}"
            )
        )
    elif current_status == LeadStatus.IN_PROGRESS:
        builder.row(
            InlineKeyboardButton(
                text="✅ Успешно",
                callback_data=f"lead_success:{lead_id}"
            ),
            InlineKeyboardButton(
                text="❌ Отказ",
                callback_data=f"lead_reject:{lead_id}"
            )
        )
        builder.row(
            InlineKeyboardButton(
                text="⏳ Перезвонить позже",
                callback_data=f"lead_callback:{lead_id}"
            )
        )
    elif current_status == LeadStatus.CALLBACK:
        builder.row(
            InlineKeyboardButton(
                text="📞 Вернуть в работу",
                callback_data=f"lead_take:{lead_id}"
            )
        )
        builder.row(
            InlineKeyboardButton(
                text="✅ Успешно",
                callback_data=f"lead_success:{lead_id}"
            ),
            InlineKeyboardButton(
                text="❌ Отказ",
                callback_data=f"lead_reject:{lead_id}"
            )
        )
    else:
        # Closed statuses - minimal buttons
        pass
    
    # Always show these buttons
    builder.row(
        InlineKeyboardButton(
            text="📜 История",
            callback_data=f"lead_history:{lead_id}"
        ),
        InlineKeyboardButton(
            text="🔄 Передать",
            callback_data=f"lead_transfer:{lead_id}"
        )
    )
    
    return builder.as_markup()


def get_manager_list_keyboard(
    managers: list,
    lead_id: UUID
) -> InlineKeyboardMarkup:
    """
    Get keyboard with manager list for transfer
    
    Args:
        managers: List of Manager objects
        lead_id: Lead ID
        
    Returns:
        InlineKeyboardMarkup
    """
    builder = InlineKeyboardBuilder()
    
    for manager in managers:
        builder.row(
            InlineKeyboardButton(
                text=f"👤 {manager.full_name} ({manager.current_leads_count} заявок)",
                callback_data=f"transfer_to:{lead_id}:{manager.id}"
            )
        )
    
    builder.row(
        InlineKeyboardButton(
            text="❌ Отмена",
            callback_data=f"transfer_cancel:{lead_id}"
        )
    )
    
    return builder.as_markup()


def get_admin_keyboard() -> InlineKeyboardMarkup:
    """
    Get admin control keyboard
    
    Returns:
        InlineKeyboardMarkup
    """
    builder = InlineKeyboardBuilder()
    
    builder.row(
        InlineKeyboardButton(
            text="📊 Статистика",
            callback_data="admin_stats"
        )
    )
    builder.row(
        InlineKeyboardButton(
            text="👥 Менеджеры",
            callback_data="admin_managers"
        )
    )
    builder.row(
        InlineKeyboardButton(
            text="📋 Все заявки",
            callback_data="admin_leads"
        )
    )
    
    return builder.as_markup()


def get_stats_period_keyboard() -> InlineKeyboardMarkup:
    """
    Get statistics period selection keyboard
    
    Returns:
        InlineKeyboardMarkup
    """
    builder = InlineKeyboardBuilder()
    
    builder.row(
        InlineKeyboardButton(
            text="📅 Сегодня",
            callback_data="stats_today"
        ),
        InlineKeyboardButton(
            text="📅 Неделя",
            callback_data="stats_week"
        )
    )
    builder.row(
        InlineKeyboardButton(
            text="📅 Месяц",
            callback_data="stats_month"
        ),
        InlineKeyboardButton(
            text="📊 Общая",
            callback_data="stats_general"
        )
    )
    builder.row(
        InlineKeyboardButton(
            text="◀️ Назад",
            callback_data="admin_menu"
        )
    )
    
    return builder.as_markup()
