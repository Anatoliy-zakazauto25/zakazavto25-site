"""Handlers module initialization"""
from . import manager, admin, callbacks

# Export routers
manager_router = manager.router
admin_router = admin.router
callbacks_router = callbacks.router

__all__ = [
    "manager_router",
    "admin_router",
    "callbacks_router",
]
