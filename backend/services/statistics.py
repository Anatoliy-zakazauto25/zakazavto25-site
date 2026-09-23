"""Statistics service"""
from typing import List, Dict
from datetime import datetime, timedelta
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from backend.models import Lead, Manager, LeadStatus
from backend.schemas import (
    GeneralStatistics,
    StatusStatistics,
    ManagerStatistics,
    PeriodStatistics
)
from backend.core.logging import get_logger

logger = get_logger(__name__)


class StatisticsService:
    """Service for calculating statistics"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_general_statistics(self) -> GeneralStatistics:
        """Get general statistics"""
        # Count by status
        status_counts = {}
        for status in LeadStatus:
            result = await self.db.execute(
                select(func.count(Lead.id)).where(Lead.status == status)
            )
            status_counts[status.value] = result.scalar() or 0
        
        total_leads = sum(status_counts.values())
        success = status_counts.get(LeadStatus.SUCCESS, 0)
        rejected = status_counts.get(LeadStatus.REJECTED, 0)
        
        # Calculate conversion
        completed = success + rejected
        conversion_rate = (success / completed * 100) if completed > 0 else 0
        
        # Status breakdown
        by_status = [
            StatusStatistics(status=status, count=count)
            for status, count in status_counts.items()
        ]
        
        # Manager statistics
        by_manager = await self._get_manager_statistics()
        
        return GeneralStatistics(
            total_leads=total_leads,
            new_leads=status_counts.get(LeadStatus.NEW, 0),
            in_progress=status_counts.get(LeadStatus.IN_PROGRESS, 0),
            callback=status_counts.get(LeadStatus.CALLBACK, 0),
            success=success,
            rejected=rejected,
            closed=status_counts.get(LeadStatus.CLOSED, 0),
            conversion_rate=round(conversion_rate, 2),
            by_status=by_status,
            by_manager=by_manager
        )
    
    async def _get_manager_statistics(self) -> List[ManagerStatistics]:
        """Get statistics by manager"""
        result = await self.db.execute(
            select(Manager).where(Manager.total_leads_processed > 0)
        )
        managers = result.scalars().all()
        
        stats = []
        for manager in managers:
            # Count success and rejected
            success_result = await self.db.execute(
                select(func.count(Lead.id)).where(
                    and_(
                        Lead.assigned_manager_id == manager.id,
                        Lead.status == LeadStatus.SUCCESS
                    )
                )
            )
            success_count = success_result.scalar() or 0
            
            rejected_result = await self.db.execute(
                select(func.count(Lead.id)).where(
                    and_(
                        Lead.assigned_manager_id == manager.id,
                        Lead.status == LeadStatus.REJECTED
                    )
                )
            )
            rejected_count = rejected_result.scalar() or 0
            
            completed = success_count + rejected_count
            conversion = (success_count / completed * 100) if completed > 0 else 0
            
            stats.append(
                ManagerStatistics(
                    manager_id=str(manager.id),
                    manager_name=manager.full_name,
                    current_leads=manager.current_leads_count,
                    total_processed=manager.total_leads_processed,
                    success_count=success_count,
                    rejected_count=rejected_count,
                    conversion_rate=round(conversion, 2)
                )
            )
        
        return stats
    
    async def get_period_statistics(
        self,
        start_date: datetime,
        end_date: datetime
    ) -> PeriodStatistics:
        """Get statistics for period"""
        # Get leads in period
        result = await self.db.execute(
            select(Lead).where(
                and_(
                    Lead.created_at >= start_date,
                    Lead.created_at <= end_date
                )
            )
        )
        leads = result.scalars().all()
        
        total_leads = len(leads)
        success_count = sum(1 for lead in leads if lead.status == LeadStatus.SUCCESS)
        rejected_count = sum(1 for lead in leads if lead.status == LeadStatus.REJECTED)
        
        completed = success_count + rejected_count
        conversion_rate = (success_count / completed * 100) if completed > 0 else 0
        
        # Group by day
        leads_by_day: Dict[str, int] = {}
        for lead in leads:
            day_key = lead.created_at.strftime("%Y-%m-%d")
            leads_by_day[day_key] = leads_by_day.get(day_key, 0) + 1
        
        return PeriodStatistics(
            period_start=start_date,
            period_end=end_date,
            total_leads=total_leads,
            success_count=success_count,
            rejected_count=rejected_count,
            conversion_rate=round(conversion_rate, 2),
            leads_by_day=leads_by_day
        )
    
    async def get_today_statistics(self) -> PeriodStatistics:
        """Get today's statistics"""
        now = datetime.utcnow()
        start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = start_of_day + timedelta(days=1)
        
        return await self.get_period_statistics(start_of_day, end_of_day)
    
    async def get_week_statistics(self) -> PeriodStatistics:
        """Get this week's statistics"""
        now = datetime.utcnow()
        start_of_week = now - timedelta(days=now.weekday())
        start_of_week = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_week = start_of_week + timedelta(days=7)
        
        return await self.get_period_statistics(start_of_week, end_of_week)
    
    async def get_month_statistics(self) -> PeriodStatistics:
        """Get this month's statistics"""
        now = datetime.utcnow()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Calculate next month
        if now.month == 12:
            end_of_month = start_of_month.replace(year=now.year + 1, month=1)
        else:
            end_of_month = start_of_month.replace(month=now.month + 1)
        
        return await self.get_period_statistics(start_of_month, end_of_month)
