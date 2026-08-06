from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
from app.models.insight import ResearchInsightRecord


def save_research_insight(
    db: Session,
    product_name: str,
    industry: str,
    themes: List[Dict[str, Any]],
    sentiment_breakdown: Dict[str, Any],
    agreement_patterns: List[str],
    behavioral_trends: List[str],
    validation_scores: Dict[str, Any],
    key_quotes: List[Dict[str, Any]],
    actionable_recommendations: List[str],
    user_id: Optional[str] = None,
) -> ResearchInsightRecord:
    """Persists extracted analytical insights and validation scoring to database under user_id."""
    record = ResearchInsightRecord(
        user_id=user_id,
        product_name=product_name,
        industry=industry,
        themes=themes,
        sentiment_breakdown=sentiment_breakdown,
        agreement_patterns=agreement_patterns,
        behavioral_trends=behavioral_trends,
        validation_scores=validation_scores,
        key_quotes=key_quotes,
        actionable_recommendations=actionable_recommendations,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_latest_insight_for_user(
    db: Session,
    user_id: Optional[str] = None,
) -> Optional[ResearchInsightRecord]:
    """Retrieves the most recent research insight briefing for the calling user."""
    query = db.query(ResearchInsightRecord)
    if user_id:
        query = query.filter(ResearchInsightRecord.user_id == user_id)
    else:
        query = query.filter(ResearchInsightRecord.user_id.is_(None))
    return query.order_by(ResearchInsightRecord.created_at.desc()).first()


def delete_user_insights(
    db: Session,
    user_id: Optional[str] = None,
) -> int:
    """Deletes cached insights for the calling user upon triggering full re-analysis."""
    query = db.query(ResearchInsightRecord)
    if user_id:
        query = query.filter(ResearchInsightRecord.user_id == user_id)
    else:
        query = query.filter(ResearchInsightRecord.user_id.is_(None))
    count = query.delete(synchronize_session=False)
    db.commit()
    return count
