import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database.database import Base


class InterviewQuestionRecord(Base):
    __tablename__ = "interview_questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_key = Column(String, nullable=False, unique=True, index=True)
    question_template = Column(Text, nullable=False)
    category = Column(String, nullable=False, default="basic")
    created_at = Column(DateTime, default=datetime.utcnow)


class InterviewMessageRecord(Base):
    """
    Stores interview conversation history scoped by user_id and persona_id.
    Ensures users only see their own dialogue turns across logins and sessions.
    """
    __tablename__ = "interview_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, nullable=True, index=True)
    persona_id = Column(
        UUID(as_uuid=True),
        ForeignKey("personas.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    role = Column(String, nullable=False)  # 'user' or 'assistant'
    text = Column(Text, nullable=False)
    source = Column(String, nullable=False, default="llm")  # 'db', 'llm', or 'greeting'
    created_at = Column(DateTime, default=datetime.utcnow)

    persona = relationship("Persona")
