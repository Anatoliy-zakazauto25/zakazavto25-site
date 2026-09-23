"""Application configuration"""
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings"""
    
    # Telegram Bot
    BOT_TOKEN: str
    MANAGER_CHAT_ID: int
    
    # API
    API_SECRET: str
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    
    # Database
    DATABASE_URL: str
    
    # Admin
    ADMIN_TELEGRAM_IDS: str  # comma-separated
    
    # Webhook (optional)
    WEBHOOK_URL: str = ""
    WEBHOOK_PATH: str = "/webhook"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    # Application
    RATE_LIMIT_PER_MINUTE: int = 60
    IDEMPOTENCY_CACHE_TTL: int = 86400
    
    # Distribution
    DISTRIBUTION_ALGORITHM: str = "round_robin"  # round_robin, least_loaded
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )
    
    @property
    def admin_ids(self) -> List[int]:
        """Parse admin IDs from comma-separated string"""
        return [int(id.strip()) for id in self.ADMIN_TELEGRAM_IDS.split(",") if id.strip()]
    
    @property
    def use_webhook(self) -> bool:
        """Check if webhook is configured"""
        return bool(self.WEBHOOK_URL)


settings = Settings()
