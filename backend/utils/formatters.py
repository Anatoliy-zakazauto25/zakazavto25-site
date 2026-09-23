"""Message formatters"""
from datetime import datetime
from backend.models import Lead, Manager, LeadStatus


def format_lead_message(lead: Lead, manager: Manager | None = None) -> str:
    """
    Format lead information as Telegram message
    
    Args:
        lead: Lead instance
        manager: Assigned manager (optional)
        
    Returns:
        Formatted message text
    """
    status_emoji = {
        LeadStatus.NEW: "🆕",
        LeadStatus.IN_PROGRESS: "🔄",
        LeadStatus.CALLBACK: "⏳",
        LeadStatus.SUCCESS: "✅",
        LeadStatus.REJECTED: "❌",
        LeadStatus.CLOSED: "🔒",
    }
    
    status_text = {
        LeadStatus.NEW: "Новая",
        LeadStatus.IN_PROGRESS: "В работе",
        LeadStatus.CALLBACK: "Перезвонить позже",
        LeadStatus.SUCCESS: "Успешно",
        LeadStatus.REJECTED: "Отказ",
        LeadStatus.CLOSED: "Закрыта",
    }
    
    emoji = status_emoji.get(lead.status, "📋")
    status_name = status_text.get(lead.status, lead.status)
    
    # Build car info
    car_info = ""
    if lead.car_brand or lead.car_model:
        car_parts = [lead.car_brand or "", lead.car_model or ""]
        car_info = " ".join(filter(None, car_parts))
    
    # Format creation date
    created = lead.created_at.strftime("%d.%m.%Y %H:%M")
    
    # Build message
    lines = [
        f"{emoji} <b>ЗАЯВКА #{lead.external_id or str(lead.id)[:8].upper()}</b>",
        f"<b>Статус:</b> {status_name}",
        "",
        f"👤 <b>Имя:</b> {lead.client_name}",
        f"📞 <b>Телефон:</b> <code>{lead.client_phone}</code>",
    ]
    
    if lead.client_telegram:
        lines.append(f"💬 <b>Telegram:</b> {lead.client_telegram}")
    
    lines.append(f"📋 <b>Услуга:</b> {lead.service}")
    
    if car_info:
        lines.append(f"🚗 <b>Автомобиль:</b> {car_info}")
    
    if lead.budget:
        lines.append(f"💰 <b>Бюджет:</b> {lead.budget}")
    
    if lead.comment:
        lines.append(f"💬 <b>Комментарий:</b> {lead.comment}")
    
    if lead.source_url:
        # Truncate long URLs
        url_display = lead.source_url if len(lead.source_url) < 50 else lead.source_url[:47] + "..."
        lines.append(f"🌐 <b>Источник:</b> {url_display}")
    
    # UTM tags
    utm_parts = []
    if lead.utm_source:
        utm_parts.append(f"source={lead.utm_source}")
    if lead.utm_medium:
        utm_parts.append(f"medium={lead.utm_medium}")
    if lead.utm_campaign:
        utm_parts.append(f"campaign={lead.utm_campaign}")
    
    if utm_parts:
        lines.append(f"📊 <b>UTM:</b> {', '.join(utm_parts)}")
    
    lines.append(f"📅 <b>Дата:</b> {created}")
    
    if manager:
        lines.append(f"👨‍💼 <b>Менеджер:</b> {manager.full_name}")
    
    return "\n".join(lines)


def format_history_message(history_entries: list) -> str:
    """
    Format lead history as message
    
    Args:
        history_entries: List of LeadHistory instances
        
    Returns:
        Formatted history message
    """
    if not history_entries:
        return "История пуста"
    
    lines = ["📜 <b>История заявки:</b>\n"]
    
    for entry in history_entries:
        timestamp = entry.created_at.strftime("%d.%m.%Y %H:%M")
        manager_name = entry.manager.full_name if entry.manager else "Система"
        
        lines.append(f"⏰ {timestamp}")
        lines.append(f"👤 {manager_name}")
        lines.append(f"🔄 {entry.action}")
        
        if entry.old_value:
            lines.append(f"   Было: {entry.old_value}")
        if entry.new_value:
            lines.append(f"   Стало: {entry.new_value}")
        if entry.comment:
            lines.append(f"   💬 {entry.comment}")
        
        lines.append("")
    
    return "\n".join(lines)


def format_statistics_message(stats) -> str:
    """
    Format statistics as message
    
    Args:
        stats: Statistics object (GeneralStatistics or PeriodStatistics)
        
    Returns:
        Formatted statistics message
    """
    lines = ["📊 <b>Статистика</b>\n"]
    
    if hasattr(stats, 'period_start'):
        # Period statistics
        start = stats.period_start.strftime("%d.%m.%Y")
        end = stats.period_end.strftime("%d.%m.%Y")
        lines.append(f"📅 Период: {start} - {end}\n")
    
    lines.extend([
        f"📋 Всего заявок: <b>{stats.total_leads}</b>",
        f"✅ Успешно: <b>{stats.success_count}</b>",
        f"❌ Отказы: <b>{stats.rejected_count}</b>",
        f"📈 Конверсия: <b>{stats.conversion_rate}%</b>",
    ])
    
    if hasattr(stats, 'new_leads'):
        # General statistics
        lines.extend([
            "",
            "<b>По статусам:</b>",
            f"🆕 Новые: {stats.new_leads}",
            f"🔄 В работе: {stats.in_progress}",
            f"⏳ Перезвонить: {stats.callback}",
            f"🔒 Закрыты: {stats.closed}",
        ])
        
        if stats.by_manager:
            lines.append("\n<b>По менеджерам:</b>")
            for manager_stat in stats.by_manager:
                lines.append(
                    f"👤 {manager_stat.manager_name}: "
                    f"{manager_stat.total_processed} обработано, "
                    f"конверсия {manager_stat.conversion_rate}%"
                )
    
    return "\n".join(lines)
