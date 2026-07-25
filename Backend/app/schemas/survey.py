from typing import List, Optional
from uuid import UUID, uuid4
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


PRODUCT_CATEGORIES = [
    "food_delivery",
    "ecommerce",
    "medicine",
    "travel",
    "education",
    "fitness",
    "entertainment",
    "finance",
    "grocery",
    "fashion",
    "electronics",
    "home_services",
]


class SurveyBrief(BaseModel):
    product_name: str = Field(..., description="Product or service name")
    industry: str = Field(..., description="Industry or product domain")
    product_description: str = Field(..., description="Short description of the product")
    target_audience: str = Field(..., description="Intended user segment")
    research_objective: str = Field(..., description="What the survey is trying to learn")
    question_count: int = Field(default=5, ge=3, le=5, description="Number of questions to generate (3-5)")


class QuestionGenerateRequest(SurveyBrief):
    pass


class GeneratedQuestion(BaseModel):
    question: str
    product_category: str
    question_type: str = Field(default="open_ended", description="open_ended, multiple_choice, rating, yes_no")


class QuestionGenerateResponse(BaseModel):
    product_name: str
    industry: str
    product_description: str
    target_audience: str
    research_objective: str
    questions: List[GeneratedQuestion]


class StoredSurveyQuestion(BaseModel):
    id: UUID
    product_name: str
    industry: str
    product_description: str
    target_audience: str
    research_objective: str
    question_text: str
    question_type: str
    question_order: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StoredPersonaSurveyResponse(BaseModel):
    id: UUID
    question_id: UUID
    persona_id: UUID
    response_text: str
    sentiment: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SurveyQuestion(BaseModel):
    question: str
    product_category: str


class PersonaSurveyResponse(BaseModel):
    persona_id: UUID
    persona_name: str
    response: str
    sentiment: str


class SurveySessionCreate(BaseModel):
    questions: List[SurveyQuestion] = Field(..., min_length=1)
    persona_ids: List[UUID] = Field(..., min_length=1)


class SurveySessionResponse(BaseModel):
    session_id: UUID
    questions: List[SurveyQuestion]
    persona_ids: List[UUID]
    status: str
    created_at: datetime


class SurveyResponse(BaseModel):
    question_index: int
    question: str
    product_category: str
    responses: List[PersonaSurveyResponse]


class SurveyResult(BaseModel):
    session_id: UUID
    responses: List[SurveyResponse]
    completed_at: datetime


class AutoSurveyRequest(BaseModel):
    product_name: str = Field(..., description="Product or service name")
    industry: str = Field(..., description="Industry or product domain")
    product_description: str = Field(..., description="Short description of the product")
    target_audience: str = Field(..., description="Intended user segment")
    research_objective: str = Field(..., description="What the survey is trying to learn")
    question_count: int = Field(default=5, ge=3, le=5)


class AutoSurveyResponse(BaseModel):
    questions: List[StoredSurveyQuestion]


class BatchSurveyRequest(BaseModel):
    questions: List[SurveyQuestion] = Field(..., min_length=1)
    persona_ids: List[UUID] = Field(..., min_length=1)
    parallel: bool = True


class SurveyMemoryStatus(BaseModel):
    session_id: UUID
    question_count: int
    memory_preserved: bool
    history_length: int


class ProductCategoriesResponse(BaseModel):
    categories: List[str]


class AddCustomQuestionRequest(BaseModel):
    question_text: str = Field(..., description="The survey question to deploy")
    product_name: Optional[str] = "SynthScope Product"
    industry: Optional[str] = "Technology"
    product_description: Optional[str] = "AI product validation"
    target_audience: Optional[str] = "General users"
    research_objective: Optional[str] = "User feedback"


class CustomQuestionResponse(BaseModel):
    question: StoredSurveyQuestion
    responses: List[StoredPersonaSurveyResponse]