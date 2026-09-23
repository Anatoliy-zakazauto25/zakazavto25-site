"""Telegram bot application entry point"""
import asyncio
import sys
from aiogram import Bot, Dispatcher
from aiogram.enums import ParseMode
from aiogram.client.default import DefaultBotProperties
from backend.core import setup_logging, get_logger, settings
from backend.db import init_db, close_db
from backend.bot.handlers import manager_router, admin_router, callbacks_router

# Setup logging
setup_logging()
logger = get_logger(__name__)


async def main():
    """Main bot function"""
    logger.info("Starting Telegram bot", version="1.0.0")
    
    # Initialize database
    await init_db()
    logger.info("Database initialized")
    
    # Create bot and dispatcher
    bot = Bot(
        token=settings.BOT_TOKEN,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML)
    )
    
    dp = Dispatcher()
    
    # Register routers
    dp.include_router(callbacks_router)  # First - most specific
    dp.include_router(admin_router)
    dp.include_router(manager_router)
    
    logger.info("Routers registered")
    
    # Set bot instance for API notifications
    from backend.api.routes.leads import set_bot_instance
    set_bot_instance(bot)
    
    try:
        # Start polling
        logger.info("Bot started successfully")
        await dp.start_polling(
            bot,
            allowed_updates=dp.resolve_used_update_types()
        )
    except Exception as e:
        logger.error("Bot error", error=str(e))
        raise
    finally:
        # Cleanup
        logger.info("Shutting down bot")
        await bot.session.close()
        await close_db()
        logger.info("Bot stopped")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Bot stopped by user")
        sys.exit(0)
    except Exception as e:
        logger.error("Fatal error", error=str(e))
        sys.exit(1)
