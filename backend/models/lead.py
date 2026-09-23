"""Lead database model"""
import uuid
from datetime import datetime
from sqlalchemy import String, Text, BigInteger, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base
from .enums import LeadStatus


class Lead(Base):
    """Lead model"""
    __tablename__ = "leads"
    
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    external_id: Mapped[str | None] = mapped_column(String(255), unique=True, index=True)
    
    # Client information
    client_name: Mapped[str] = mapped_column(String(255), nullable=False)
    client_phone: Mapped[str] = mapped_column(String(50), nullable=False)
    client_telegram: Mapped[str | None] = mapped_column(String(255))
    
    # Service information
    service: Mapped[str] = mapped_column(String(255), nullable=False)
    car_brand: Mapped[str | None] = mapped_column(String(255))
    car_model: Mapped[str | None] = mapped_column(String(255))
    budget: Mapped[str | None] = mapped_column(String(100))
    comment: Mapped[str | None] = mapped_column(Text)
    
    # Source tracking
    source_url: Mapped[str | None] = mapped_column(Text)
    utm_source: Mapped[str | None] = mapped_column(String(255))
    utm_medium: Mapped[str | None] = mapped_column(String(255))
    utm_campaign: Mapped[str | None] = mapped_column(String(255))
    utm_content: Mapped[str | None] = mapped_column(String(255))
    utm_term: Mapped[str | None] = mapped_column(String(255))
    
    # Status and assignment
    status: Mapped[str] = mapped_column(
        String(50),
        default=LeadStatus.NEW,
        nullable=False,
        index=True
    )
    assigned_manager_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("managers.id", ondelete="SET NULL"),
        index=True
    )
    
    # Telegram message IDs
    telegram_message_id: Mapped[int | None] = mapped_column(BigInteger)
    chat_message_id: Mapped[int | None] = mapped_column(BigInteger)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    assigned_manager: Mapped["Manager"] = relationship(
        "Manager",
        back_populates="leads",
        foreign_keys=[assigned_manager_id]
    )
    history: Mapped[list["LeadHistory"]] = relationship(
        "LeadHistory",
        back_populates="lead",
        cascade="all, delete-orphan"
    )
    comments: Mapped[list["LeadComment"]] = relationship(
        "LeadComment",
        back_populates="lead",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return f"<Lead {self.external_id or self.id} - {self.client_name}>"
