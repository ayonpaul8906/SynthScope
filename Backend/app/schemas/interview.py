from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class InterviewMessage(BaseModel):
    role: str = Field(..., description="Either 'user' or 'assistant'")
    text: str
    source: Optional[str] = "llm"


class InterviewChatRequest(BaseModel):
    persona_id: UUID
    message: str = Field(..., min_length=1)
    history: List[InterviewMessage] = Field(
        default_factory=list,
        description="Conversation memory so far for this persona.",
    )


class InterviewChatResponse(BaseModel):
    persona_id: UUID
    persona_name: str
    reply: str
    source: str = Field(
        default="llm",
        description="Indicates whether the answer originated directly from database memory ('db') or generative LLM synthesis ('llm')."
    )


class StoredInterviewMessage(BaseModel):
    id: UUID
    persona_id: UUID
    role: str
    text: str
    source: str
    created_at: datetime

    class Config:
        from_attributes = True


class InterviewQuestionDTO(BaseModel):
    id: str
    key: str
    question: str
    category: str


class InterviewThreadsResponse(BaseModel):
    threads: Dict[str, List[StoredInterviewMessage]]
