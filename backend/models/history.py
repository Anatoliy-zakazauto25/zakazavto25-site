"""History database models"""
import uuid
from datetime import datetime
from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base


class LeadHistory(Base):
    """Lead history model"""
    __tablename__ = "lead_history"
    
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    lead_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("leads.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    manager_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("managers.id", ondelete="SET NULL")
    )
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    old_value: Mapped[str | None] = mapped_column(Text)
    new_value: Mapped[str | None] = mapped_column(Text)
    comment: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, index=True)
    
    # Relationships
    lead: Mapped["Lead"] = relationship("Lead", back_populates="history")
    manager: Mapped["Manager"] = relationship(
        "Manager",
        back_populates="history_entries",
        foreign_keys=[manager_id]
    )
    
    def __repr__(self) -> str:
        return f"<LeadHistory {self.action} for Lead {self.lead_id}>"


class LeadComment(Base):
    """Lead comment model"""
    __tablename__ = "lead_comments"
    
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    lead_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("leads.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    manager_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("managers.id", ondelete="CASCADE"),
        nullable=False
    )
    comment: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, index=True)
    
    # Relationships
    lead: Mapped["Lead"] = relationship("Lead", back_populates="comments")
    manager: Mapped["Manager"] = relationship("Manager", back_populates="comments")
    
    def __repr__(self) -> str:
        return f"<LeadComment by Manager {self.manager_id} on Lead {self.lead_id}>"


class Settings(Base):
    """Settings model"""
    __tablename__ = "settings"
    
    key: Mapped[str] = mapped_column(String(255), primary_key=True)
    value: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self) -> str:
        return f"<Settings {self.key}>"
