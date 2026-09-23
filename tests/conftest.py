"""Pytest configuration"""
import pytest
import asyncio
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from backend.models.base import Base
from backend.core.config import settings

# Test database URL
TEST_DATABASE_URL = settings.DATABASE_URL.replace("zakazavto_db", "zakazavto_test_db")


@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for tests"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
async def engine():
    """Create test database engine"""
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield engine
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    await engine.dispose()


@pytest.fixture
async def db_session(engine) -> AsyncGenerator[AsyncSession, None]:
    """Create test database session"""
    async_session = async_sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with async_session() as session:
        yield session
        await session.rollback()


@pytest.fixture
async def sample_manager(db_session: AsyncSession):
    """Create sample manager for tests"""
    from backend.models import Manager
    
    manager = Manager(
        telegram_id=123456789,
        username="testmanager",
        full_name="Test Manager",
        is_active=True,
        is_admin=False
    )
    
    db_session.add(manager)
    await db_session.commit()
    await db_session.refresh(manager)
    
    return manager


@pytest.fixture
async def sample_lead(db_session: AsyncSession, sample_manager):
    """Create sample lead for tests"""
    from backend.models import Lead, LeadStatus
    
    lead = Lead(
        external_id="test_001",
        client_name="Test Client",
        client_phone="+79161234567",
        service="Test Service",
        car_brand="Toyota",
        car_model="Camry",
        status=LeadStatus.NEW,
        assigned_manager_id=sample_manager.id
    )
    
    db_session.add(lead)
    await db_session.commit()
    await db_session.refresh(lead)
    
    return lead
