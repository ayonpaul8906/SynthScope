import uuid
from datetime import datetime

from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID, ARRAY, JSONB

from app.database.database import Base


class Persona(Base):
    __tablename__ = "personas"

    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Basic Information
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    city = Column(String, nullable=False)
    country = Column(String, nullable=False)

    # Professional Information
    occupation = Column(String, nullable=False)
    education = Column(String, nullable=False)
    annual_income = Column(String, nullable=False)
    marital_status = Column(String, nullable=False)

    # Persona Summary
    persona_summary = Column(String, nullable=False)
    lifestyle = Column(String, nullable=False)

    # Technology
    technology_usage = Column(String, nullable=False)
    digital_literacy = Column(String, nullable=False)
    fitness_level = Column(String, nullable=False)

    # Product Preferences
    budget = Column(String, nullable=False)
    purchase_channel = Column(String, nullable=False)
    purchase_frequency = Column(String, nullable=False)
    brand_loyalty = Column(String, nullable=False)

    # Devices
    operating_system = Column(String, nullable=False)
    ecosystem = Column(String, nullable=False)

    # Miscellaneous
    accessibility_needs = Column(String, nullable=True)
    environmental_awareness = Column(String, nullable=True)
    quote = Column(String, nullable=False)

    # Lists
    hobbies = Column(ARRAY(String), nullable=False)
    daily_routine = Column(ARRAY(String), nullable=False)
    goals = Column(ARRAY(String), nullable=False)
    motivations = Column(ARRAY(String), nullable=False)
    pain_points = Column(ARRAY(String), nullable=False)
    frustrations = Column(ARRAY(String), nullable=False)
    preferred_features = Column(ARRAY(String), nullable=False)
    devices = Column(ARRAY(String), nullable=False)
    favourite_apps = Column(ARRAY(String), nullable=False)

    # Nested Objects
    personality = Column(JSONB, nullable=False)
    buying_behaviour = Column(JSONB, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )