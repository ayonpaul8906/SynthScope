import asyncio
import json
import os
import re
import time
from datetime import datetime
from typing import Dict, List, Optional
from uuid import UUID, uuid4

from dotenv import load_dotenv
from google import genai
from sqlalchemy.orm import Session

from app.models.persona import Persona
from app.models.survey import SurveyQuestionRecord
from app.repositories.persona_repository import get_all_personas
from app.repositories.survey_repository import (
    create_survey_responses,
    get_survey_question,
    get_survey_responses_for_question,
)
from app.schemas.survey import (
    BatchSurveyRequest,
    PersonaSurveyResponse,
    SurveyQuestion,
    SurveyResponse,
    SurveyResult,
    SurveySessionCreate,
    SurveySessionResponse,
)

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Retain original Gemini model configuration as requested by user
SURVEY_GEMINI_MODELS = [
    m.strip()
    for m in os.getenv(
        "SURVEY_GEMINI_MODELS",
        "models/gemini-3.5-flash,models/gemini-2.5-flash,models/gemini-1.5-flash",
    ).split(",")
    if m.strip()
]


# ---------------------------------------------------------------------------
# Dynamic Sentiment Archetype Assignment (Balanced Cohort Mix)
# ---------------------------------------------------------------------------

SENTIMENT_ROTATION = ["positive", "neutral", "negative", "positive", "mixed"]


def _determine_persona_sentiment(persona: Persona, index: int = 0) -> str:
    """
    Assign a balanced, realistic sentiment stance (Positive, Negative, Neutral, Mixed)
    across the persona cohort, influenced by persona traits and rotation index.
    """
    loyalty = (persona.brand_loyalty or "").lower()
    budget = (persona.budget or "").lower()

    # Extreme persona trait overrides
    if loyalty in {"very high", "high"} and index % 2 == 0:
        return "positive"

    if budget in {"low", "strict"} and (persona.pain_points and len(persona.pain_points) > 2) and index % 2 == 1:
        return "negative"

    # Default rotation for diverse sentiment spread across cohort
    return SENTIMENT_ROTATION[index % len(SENTIMENT_ROTATION)]


# ---------------------------------------------------------------------------
# Fallback Human Responses
# ---------------------------------------------------------------------------

def _build_human_fallback(persona: Persona, product_name: str, sentiment: str) -> str:
    goal = persona.goals[0].lower() if persona.goals else "improve my daily routine"
    pain = persona.pain_points[0].lower() if persona.pain_points else "unclear processes"
    feature = persona.preferred_features[0].lower() if persona.preferred_features else "simplicity"

    if sentiment == "positive":
        return f"Honestly, {product_name} sounds really promising! Anything that helps with {goal} is something I'd happily try out."
    elif sentiment == "negative":
        return f"I'm pretty skeptical about {product_name}. My biggest frustration is usually {pain}, and I'm not convinced this fixes that."
    elif sentiment == "mixed":
        return f"I see potential in {product_name}, especially if it delivers on {feature}. But I'd need to test it first before deciding."
    else:
        return f"Looks decent enough. If {product_name} fits cleanly into my workflow without extra hassle, I'd consider using it."


# ---------------------------------------------------------------------------
# JSON Parsing & Cleanup
# ---------------------------------------------------------------------------

def _parse_model_json(text: str) -> Dict:
    if not text:
        raise json.JSONDecodeError("Empty model response", "", 0)

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    fenced = re.search(r"```(?:json)?\s*(\{.*\})\s*```", text, flags=re.DOTALL)
    if fenced:
        return json.loads(fenced.group(1))

    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        return json.loads(text[start: end + 1])

    raise json.JSONDecodeError("No JSON object found in model response", text, 0)


def _clean_user_facing_response(response_text: str, persona_name: str) -> str:
    text = response_text.strip().strip('"').strip("'")
    if not text:
        return text

    patterns = [
        rf"^as\s+(a\s+persona|real\tag|synthetic\s+user|{re.escape(persona_name)})\s*,?\s*",
        r"^regarding\s+['\"].*?['\"]\s*(and\s+your\s+question\s+['\"].*?['\"])?\s*,?\s*",
        r"^for\s+this\s+question\s*,?\s*",
    ]
    for pattern in patterns:
        text = re.sub(pattern, "", text, flags=re.IGNORECASE)

    if text.lower().startswith(("as ", "regarding ")) and "," in text:
        text = text.split(",", 1)[1].strip()

    if text and text[0].islower():
        text = text[0].upper() + text[1:]

    return text


def _is_generic_response(response_text: str) -> bool:
    lower_text = response_text.lower().strip()
    generic_phrases = [
        "i would probably use this",
        "that is my view",
        "as an ai",
        "as a synthetic persona",
        "it depends on my needs",
    ]
    return any(phrase in lower_text for phrase in generic_phrases)


# ---------------------------------------------------------------------------
# Conversational Human Response Generation
# ---------------------------------------------------------------------------

def generate_response_for_persona(
    persona: Persona,
    question: str,
    product_category: str,
    history: Optional[List[Dict]] = None,
    index: int = 0,
) -> PersonaSurveyResponse:
    target_sentiment = _determine_persona_sentiment(persona, index)

    prompt = f"""You are {persona.name}, age {persona.age}, working as a {persona.occupation}. You are answering a survey question like a real human typing a quick response on your phone.

Your personality profile:
- Goals: {', '.join(persona.goals[:2]) if persona.goals else 'efficient daily workflow'}
- Frustrations: {', '.join(persona.pain_points[:2]) if persona.pain_points else 'clunky software'}
- Favorite feature: {persona.preferred_features[0] if persona.preferred_features else 'speed'}
- Quote / Vibe: "{persona.quote}"

Product Domain: {product_category}

Survey Question: {question}

STANCE ({target_sentiment.upper()}):
- POSITIVE: Express genuine enthusiasm or interest in a natural, casual voice ("I love this idea...", "Honestly, sounds really helpful for...", "I'd definitely use this because...").
- NEGATIVE: Express honest skepticism, doubt, or dissatisfaction ("Not really feeling this...", "Honestly, I doubt this helps with...", "Main issue I see is...").
- NEUTRAL/MIXED: Express a practical, balanced view ("It looks fine, but...", "I'd use it if it's convenient...", "Seems okay, nothing revolutionary...").

RULES FOR HUMAN TONE:
- Write like a real person typing casually and naturally.
- 1 to 2 clear sentences maximum.
- NEVER start with "As a persona" or "As {persona.name}".
- Sound authentic, personal, and conversational.

Return ONLY valid JSON:
{{
  "response": "your casual human response",
  "sentiment": "{target_sentiment}"
}}"""

    default_response = PersonaSurveyResponse(
        persona_id=persona.id,
        persona_name=persona.name,
        response=_build_human_fallback(persona, product_category, target_sentiment),
        sentiment=target_sentiment,
    )

    for attempt in range(2):
        for model_name in SURVEY_GEMINI_MODELS:
            try:
                result = client.models.generate_content(model=model_name, contents=prompt)
                data = _parse_model_json(getattr(result, "text", ""))

                response_text = str(data.get("response", "")).strip()
                response_text = _clean_user_facing_response(response_text, persona.name)
                sentiment = str(data.get("sentiment", target_sentiment)).strip().lower()
                if sentiment not in {"positive", "negative", "neutral", "mixed"}:
                    sentiment = target_sentiment

                if not response_text or _is_generic_response(response_text):
                    response_text = _build_human_fallback(persona, product_category, target_sentiment)

                return PersonaSurveyResponse(
                    persona_id=persona.id,
                    persona_name=persona.name,
                    response=response_text,
                    sentiment=sentiment,
                )
            except Exception as e:
                print(f"[survey] Model {model_name} notice: {e}")
                continue

        if attempt < 1:
            time.sleep(1)

    return default_response


def generate_response_for_stored_question(
    persona: Persona,
    question: SurveyQuestionRecord,
    index: int = 0,
) -> PersonaSurveyResponse:
    target_sentiment = _determine_persona_sentiment(persona, index)

    # Build unique persona voice based on their specific traits
    persona_goals = ', '.join(persona.goals[:2]) if persona.goals else 'save time and work efficiently'
    persona_frustrations = ', '.join(persona.pain_points[:2]) if persona.pain_points else 'friction and complexity'
    persona_features = persona.preferred_features[0] if persona.preferred_features else 'simplicity'
    persona_quote = persona.quote or ''

    prompt = f"""You are playing the role of {persona.name}, a real {persona.age}-year-old {persona.occupation} from {getattr(persona, 'city', 'India')}, {getattr(persona, 'country', '')}.

Your personality and context:
- Occupation: {persona.occupation}
- Key goal: {persona_goals}
- Key frustration: {persona_frustrations}
- Preferred feature: {persona_features}
- Your quote: "{persona_quote}"
- Brand loyalty: {persona.brand_loyalty or 'Medium'}
- Budget: {persona.budget or 'Moderate'}

Product being researched:
- Product Name: {question.product_name}
- Industry: {question.industry}
- Brief: {question.product_description}

=== THE SPECIFIC QUESTION YOU MUST ANSWER ===
{question.question_text}

=== YOUR REQUIRED STANCE: {target_sentiment.upper()} ===
- POSITIVE: Be genuinely enthusiastic and specific to this question ("Honestly, for this exact thing I'd say...", "This is actually what I've been wanting...").
- NEGATIVE: Express honest doubt or frustration directly about what's being asked ("Not gonna lie, this is my biggest concern...", "I struggle with exactly this...").
- NEUTRAL: Give a balanced, thoughtful answer to this specific question ("It depends for me because...", "I can see both sides here...").
- MIXED: Show conflicted feelings specific to the question ("Part of me loves this but...", "I want to say yes, but my experience tells me...").

CRITICAL RULES:
1. Your response MUST directly answer the question "{question.question_text}" — do NOT give a generic product overview.
2. Make your response feel like a real person's opinion ON THIS SPECIFIC QUESTION.
3. Be conversational, 1-2 sentences max.
4. Do NOT start with "As {persona.name}" or "As a persona".
5. Reference something specific from the question if possible.

Return ONLY this JSON:
{{
  "response": "your specific answer to this question",
  "sentiment": "{target_sentiment}"
}}"""

    default_response = PersonaSurveyResponse(
        persona_id=persona.id,
        persona_name=persona.name,
        response=_build_human_fallback(persona, question.product_name, target_sentiment),
        sentiment=target_sentiment,
    )

    for attempt in range(2):
        for model_name in SURVEY_GEMINI_MODELS:
            try:
                result = client.models.generate_content(model=model_name, contents=prompt)
                data = _parse_model_json(getattr(result, "text", ""))

                response_text = str(data.get("response", "")).strip()
                response_text = _clean_user_facing_response(response_text, persona.name)
                sentiment = str(data.get("sentiment", target_sentiment)).strip().lower()
                if sentiment not in {"positive", "negative", "neutral", "mixed"}:
                    sentiment = target_sentiment

                if not response_text or _is_generic_response(response_text):
                    response_text = _build_human_fallback(persona, question.product_name, target_sentiment)

                return PersonaSurveyResponse(
                    persona_id=persona.id,
                    persona_name=persona.name,
                    response=response_text,
                    sentiment=sentiment,
                )
            except Exception as e:
                print(f"[survey] Model {model_name} notice: {e}")
                continue

        if attempt < 1:
            time.sleep(1)

    return default_response


# ---------------------------------------------------------------------------
# Session-based Legacy & Stored Question Survey Handlers
# ---------------------------------------------------------------------------

class SurveyMemory:
    def __init__(self):
        self.history: Dict[UUID, List[Dict]] = {}

    def add_interaction(self, session_id: UUID, persona_id: UUID, question: str, response: str):
        if session_id not in self.history:
            self.history[session_id] = []
        self.history[session_id].append(
            {
                "persona_id": str(persona_id),
                "question": question,
                "response": response,
                "timestamp": datetime.utcnow().isoformat(),
            }
        )

    def get_history(self, session_id: UUID) -> List[Dict]:
        return self.history.get(session_id, [])

    def clear_session(self, session_id: UUID):
        self.history.pop(session_id, None)

    def is_preserved(self, session_id: UUID) -> bool:
        return session_id in self.history


survey_memory = SurveyMemory()
active_sessions: Dict[UUID, SurveySessionCreate] = {}


def create_survey_session(db: Session, request: SurveySessionCreate) -> SurveySessionResponse:
    session_id = uuid4()
    active_sessions[session_id] = request
    return SurveySessionResponse(
        session_id=session_id,
        questions=request.questions,
        persona_ids=request.persona_ids,
        status="created",
        created_at=datetime.utcnow(),
    )


def conduct_survey_question(
    db: Session,
    session_id: UUID,
    question: SurveyQuestion,
    question_index: int,
    persona_ids: List[UUID],
    parallel: bool = True,
) -> SurveyResponse:
    personas = db.query(Persona).filter(Persona.id.in_(persona_ids)).all()
    history = survey_memory.get_history(session_id)
    persona_responses: List[PersonaSurveyResponse] = []

    for idx, persona in enumerate(personas):
        resp = generate_response_for_persona(persona, question.question, question.product_category, history, index=idx)
        persona_responses.append(resp)

    for resp in persona_responses:
        survey_memory.add_interaction(session_id, resp.persona_id, question.question, resp.response)

    return SurveyResponse(
        question_index=question_index,
        question=question.question,
        product_category=question.product_category,
        responses=persona_responses,
    )


def run_batch_survey(db: Session, request: BatchSurveyRequest) -> SurveyResult:
    session = create_survey_session(
        db,
        SurveySessionCreate(questions=request.questions, persona_ids=request.persona_ids),
    )

    all_responses = []
    for i, question in enumerate(request.questions):
        resp = conduct_survey_question(
            db=db,
            session_id=session.session_id,
            question=question,
            question_index=i,
            persona_ids=request.persona_ids,
            parallel=request.parallel,
        )
        all_responses.append(resp)

    return SurveyResult(session_id=session.session_id, responses=all_responses, completed_at=datetime.utcnow())


def answer_stored_question_for_all_personas(
    db: Session,
    question_id: UUID,
    user_id: Optional[str] = None,
    parallel: bool = False,
):
    """Generate and persist survey responses across all stored personas for a question scoped by user_id."""
    question = get_survey_question(db, question_id, user_id=user_id)
    if not question:
        raise ValueError(f"Question {question_id} not found")

    existing_responses = get_survey_responses_for_question(db, question_id, user_id=user_id)
    if existing_responses:
        return existing_responses

    personas = get_all_personas(db, user_id=user_id)
    if not personas:
        raise ValueError("No personas found in the database for this user")

    persona_responses = []
    for idx, persona in enumerate(personas):
        try:
            resp = generate_response_for_stored_question(persona, question, index=idx)
        except Exception as e:
            print(f"[survey] Error generating response for {persona.name}: {e}")
            target_sentiment = _determine_persona_sentiment(persona, idx)
            resp = PersonaSurveyResponse(
                persona_id=persona.id,
                persona_name=persona.name,
                response=_build_human_fallback(persona, question.product_name, target_sentiment),
                sentiment=target_sentiment,
            )

        persona_responses.append(resp)

    return create_survey_responses(db, question_id, persona_responses, user_id=user_id)
