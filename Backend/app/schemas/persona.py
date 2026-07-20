from typing import List, Dict, Any, Optional
from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PersonaBase(BaseModel):
    # Basic Information
    name: str
    age: int
    gender: str
    city: str
    country: str

    # Professional Information
    occupation: str
    education: str
    annual_income: str
    marital_status: str

    # Persona Summary
    persona_summary: str
    lifestyle: str

    # Technology
    technology_usage: str
    digital_literacy: str
    fitness_level: str

    # Product Preferences
    budget: str
    purchase_channel: str
    purchase_frequency: str
    brand_loyalty: str

    # Devices
    operating_system: str
    ecosystem: str

    # Miscellaneous
    accessibility_needs: Optional[str] = None
    environmental_awareness: Optional[str] = None
    quote: str

    # Lists
    hobbies: List[str]
    daily_routine: List[str]
    goals: List[str]
    motivations: List[str]
    pain_points: List[str]
    frustrations: List[str]
    preferred_features: List[str]
    devices: List[str]
    favourite_apps: List[str]

    # Nested Objects
    personality: Dict[str, Any]
    buying_behaviour: Dict[str, Any]


class PersonaCreate(PersonaBase):
    pass

class ProductRequest(BaseModel):
    product: str

class PersonaResponse(PersonaBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)