"""Test services"""
import pytest
from backend.services import LeadService, ManagerService
from backend.schemas import LeadCreateRequest, ManagerCreate
from backend.models import LeadStatus


@pytest.mark.asyncio
async def test_create_manager(db_session):
    """Test manager creation"""
    manager_service = ManagerService(db_session)
    
    manager_data = ManagerCreate(
        telegram_id=987654321,
        username="newmanager",
        full_name="New Manager"
    )
    
    manager = await manager_service.create_manager(manager_data)
    
    assert manager.telegram_id == 987654321
    assert manager.full_name == "New Manager"
    assert manager.is_active is True
    assert manager.current_leads_count == 0


@pytest.mark.asyncio
async def test_create_lead(db_session, sample_manager):
    """Test lead creation"""
    lead_service = LeadService(db_session)
    
    lead_data = LeadCreateRequest(
        external_id="test_service_001",
        client_name="Service Test Client",
        client_phone="+79161234567",
        service="Service Test",
        car_brand="BMW",
        car_model="X5"
    )
    
    lead = await lead_service.create_lead(lead_data)
    
    assert lead.client_name == "Service Test Client"
    assert lead.status == LeadStatus.NEW
    assert lead.assigned_manager_id is not None


@pytest.mark.asyncio
async def test_update_lead_status(db_session, sample_lead, sample_manager):
    """Test lead status update"""
    lead_service = LeadService(db_session)
    
    updated_lead = await lead_service.update_status(
        sample_lead.id,
        LeadStatus.IN_PROGRESS,
        sample_manager.id
    )
    
    assert updated_lead.status == LeadStatus.IN_PROGRESS


@pytest.mark.asyncio
async def test_get_manager_leads(db_session, sample_lead, sample_manager):
    """Test getting manager's leads"""
    lead_service = LeadService(db_session)
    
    leads = await lead_service.get_manager_leads(sample_manager.id)
    
    assert len(leads) >= 1
    assert any(lead.id == sample_lead.id for lead in leads)
