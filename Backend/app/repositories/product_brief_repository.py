from typing import Optional
from sqlalchemy.orm import Session

from app.models.product_brief import ProductBriefRecord


def save_product_brief(
    db: Session,
    product_name: str,
    industry: str,
    product_description: str,
    target_audience: str,
    research_objective: str,
    persona_count: int = 5,
    user_id: Optional[str] = None,
) -> ProductBriefRecord:
    """Persist the current product brief scoped by user_id. Replaces the existing record for this user only."""
    # Only delete previous briefs belonging to this specific user!
    query = db.query(ProductBriefRecord)
    if user_id:
        query.filter(ProductBriefRecord.user_id == user_id).delete()
    else:
        query.filter(ProductBriefRecord.user_id == None).delete()

    record = ProductBriefRecord(
        user_id=user_id,
        product_name=product_name,
        industry=industry,
        product_description=product_description,
        target_audience=target_audience,
        research_objective=research_objective,
        persona_count=persona_count,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_latest_product_brief(db: Session, user_id: Optional[str] = None) -> ProductBriefRecord | None:
    """Retrieve the most recently saved product brief for the given user."""
    query = db.query(ProductBriefRecord)
    if user_id:
        query = query.filter(ProductBriefRecord.user_id == user_id)
    else:
        query = query.filter(ProductBriefRecord.user_id == None)
    return query.order_by(ProductBriefRecord.created_at.desc()).first()
