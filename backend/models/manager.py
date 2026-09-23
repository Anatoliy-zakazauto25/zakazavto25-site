"""Manager database model"""
import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, Integer, BigInteger
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base


class Manager(Base):
    """Manager model"""
    __tablename__ = "managers"
    
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    telegram_id: Mapped[int] = mapped_column(BigInteger, unique=True, nullable=False, index=True)
    username: Mapped[str | None] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    current_leads_count: Mapped[int] = mapped_column(Integer, default=0)
    total_leads_processed: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    leads: Mapped[list["Lead"]] = relationship(
        "Lead",
        back_populates="assigned_manager",
        foreign_keys="Lead.assigned_manager_id"
    )
    history_entries: Mapped[list["LeadHistory"]] = relationship(
        "LeadHistory",
        back_populates="manager",
        foreign_keys="LeadHistory.manager_id"
    )
    comments: Mapped[list["LeadComment"]] = relationship(
        "LeadComment",
        back_populates="manager"
    )
    
    def __repr__(self) -> str:
        return f"<Manager {self.full_name} (@{self.username})>"
