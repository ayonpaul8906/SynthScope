from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ThemeDTO(BaseModel):
    title: str
    mentions: int
    sentiment: str
    explanation: str


class SegmentScoreDTO(BaseModel):
    segment_name: str
    sample_size: int
    score_10: float
    score_pct: int
    reasoning: str
    verdict: str


class ValidationScoresDTO(BaseModel):
    overall_score: float
    overall_percentage: int
    verdict: str
    segments: List[SegmentScoreDTO]


class QuoteDTO(BaseModel):
    quote: str
    persona_name: str
    occupation: str
    location: str
    sentiment: str


class SentimentBreakdownDTO(BaseModel):
    positive: float
    neutral: float
    negative: float
    consensus_score: float
    total_sample: int


class InsightDashboardResponse(BaseModel):
    product_name: str
    industry: str
    themes: List[ThemeDTO]
    sentiment_breakdown: SentimentBreakdownDTO
    agreement_patterns: List[str]
    behavioral_trends: List[str]
    validation_scores: ValidationScoresDTO
    key_quotes: List[QuoteDTO]
    actionable_recommendations: List[str]

    class Config:
        from_attributes = True
