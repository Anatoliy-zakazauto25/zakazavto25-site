"""Test API endpoints"""
import pytest
from httpx import AsyncClient
from main_api import app


@pytest.mark.asyncio
async def test_root_endpoint():
    """Test root endpoint"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["service"] == "ЗаказАвто CRM API"
        assert data["status"] == "running"


@pytest.mark.asyncio
async def test_health_endpoint():
    """Test health check endpoint"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"


@pytest.mark.asyncio
async def test_create_lead_without_api_key():
    """Test creating lead without API key"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/leads",
            json={
                "client_name": "Test Client",
                "client_phone": "+79161234567",
                "service": "Test Service"
            }
        )
        assert response.status_code == 422  # Missing required header


@pytest.mark.asyncio
async def test_create_lead_with_invalid_api_key():
    """Test creating lead with invalid API key"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/leads",
            headers={"X-API-Secret": "invalid-key"},
            json={
                "client_name": "Test Client",
                "client_phone": "+79161234567",
                "service": "Test Service"
            }
        )
        assert response.status_code == 401


@pytest.mark.asyncio
async def test_create_lead_success(db_session, sample_manager):
    """Test successful lead creation"""
    from backend.core.config import settings
    
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/leads",
            headers={"X-API-Secret": settings.API_SECRET},
            json={
                "external_id": "test_api_001",
                "client_name": "API Test Client",
                "client_phone": "+79161234567",
                "service": "API Test Service",
                "car_brand": "Toyota",
                "car_model": "Camry",
                "budget": "50000-70000",
                "comment": "Test comment",
                "utm_source": "test"
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert "lead_id" in data
