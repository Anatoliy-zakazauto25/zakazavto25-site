"""Keyboards module initialization"""
from .inline import (
    get_lead_keyboard,
    get_manager_list_keyboard,
    get_admin_keyboard,
    get_stats_period_keyboard,
)

__all__ = [
    "get_lead_keyboard",
    "get_manager_list_keyboard",
    "get_admin_keyboard",
    "get_stats_period_keyboard",
]
