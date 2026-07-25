import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database.database import Base


class SurveyQuestionRecord(Base):
    __tablename__ = "survey_questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_name = Column(String, nullable=False)
    industry = Column(String, nullable=False)
    product_description = Column(Text, nullable=False)
    target_audience = Column(Text, nullable=False)
    research_objective = Column(Text, nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String, nullable=False, default="open_ended")
    question_order = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    responses = relationship(
        "PersonaSurveyResponseRecord",
        back_populates="question",
        cascade="all, delete-orphan",
    )


class PersonaSurveyResponseRecord(Base):
    __tablename__ = "persona_survey_responses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_id = Column(
        UUID(as_uuid=True),
        ForeignKey("survey_questions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    persona_id = Column(
        UUID(as_uuid=True),
        ForeignKey("personas.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    response_text = Column(Text, nullable=False)
    sentiment = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    question = relationship("SurveyQuestionRecord", back_populates="responses")
    persona = relationship("Persona")