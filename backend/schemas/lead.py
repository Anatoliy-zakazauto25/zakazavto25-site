"""Lead schemas"""
from typing import Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field, field_validator
import phonenumbers
from backend.models.enums import LeadStatus


class LeadCreateRequest(BaseModel):
    """Schema for creating lead from website"""
    external_id: Optional[str] = None
    client_name: str = Field(..., min_length=1, max_length=255)
    client_phone: str = Field(..., min_length=10, max_length=50)
    client_telegram: Optional[str] = Field(None, max_length=255)
    service: str = Field(..., min_length=1, max_length=255)
    car_brand: Optional[str] = Field(None, max_length=255)
    car_model: Optional[str] = Field(None, max_length=255)
    budget: Optional[str] = Field(None, max_length=100)
    comment: Optional[str] = None
    source_url: Optional[str] = None
    utm_source: Optional[str] = Field(None, max_length=255)
    utm_medium: Optional[str] = Field(None, max_length=255)
    utm_campaign: Optional[str] = Field(None, max_length=255)
    utm_content: Optional[str] = Field(None, max_length=255)
    utm_term: Optional[str] = Field(None, max_length=255)
    
    @field_validator("client_phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        """Validate and normalize phone number"""
        try:
            # Try to parse as Russian phone number
            parsed = phonenumbers.parse(v, "RU")
            if not phonenumbers.is_valid_number(parsed):
                raise ValueError("Invalid phone number")
            return phonenumbers.format_number(
                parsed,
                phonenumbers.PhoneNumberFormat.E164
            )
        except Exception:
            # If parsing fails, just clean the number
            cleaned = ''.join(filter(str.isdigit, v))
            if len(cleaned) < 10:
                raise ValueError("Phone number too short")
            return f"+{cleaned}"
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "external_id": "site_12345_20260914",
                "client_name": "Иван Петров",
                "client_phone": "+79161234567",
                "client_telegram": "@ivanpetrov",
                "service": "Покраска кузова",
                "car_brand": "Toyota",
                "car_model": "Camry",
                "budget": "50000-70000",
                "comment": "Нужно покрасить левую дверь",
                "source_url": "https://zakazavto.ru/services/painting",
                "utm_source": "google",
                "utm_medium": "cpc",
                "utm_campaign": "painting_spring"
            }
        }
    }


class LeadResponse(BaseModel):
    """Schema for lead response"""
    id: UUID
    external_id: Optional[str]
    client_name: str
    client_phone: str
    client_telegram: Optional[str]
    service: str
    car_brand: Optional[str]
    car_model: Optional[str]
    budget: Optional[str]
    comment: Optional[str]
    source_url: Optional[str]
    utm_source: Optional[str]
    utm_medium: Optional[str]
    utm_campaign: Optional[str]
    status: str
    assigned_manager_id: Optional[UUID]
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}


class LeadCreateResponse(BaseModel):
    """Response after creating lead"""
    success: bool = True
    lead_id: UUID
    message: str = "Заявка успешно принята"


class LeadUpdateStatus(BaseModel):
    """Schema for updating lead status"""
    status: LeadStatus


class LeadAssignManager(BaseModel):
    """Schema for assigning manager"""
    manager_id: UUID
