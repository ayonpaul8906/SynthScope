import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID

from app.database.database import Base


class ProductBriefRecord(Base):
    """Stores the latest product brief used during persona generation.
    Used by survey question and response generation to ensure
    product-specific, context-aware output."""

    __tablename__ = "product_briefs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, nullable=True, index=True)
    product_name = Column(String, nullable=False)
    industry = Column(String, nullable=False)
    product_description = Column(Text, nullable=False)
    target_audience = Column(Text, nullable=False)
    research_objective = Column(Text, nullable=False)
    persona_count = Column(Integer, nullable=False, default=5)
    created_at = Column(DateTime, default=datetime.utcnow)
