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

SURVEY_GEMINI_MODELS = [
    m.strip()
    for m in os.getenv(
        "SURVEY_GEMINI_MODELS",
        "models/gemini-3.5-flash,models/gemini-2.5-flash,models/gemini-1.5-flash",
    ).split(",")
    if m.strip()
]


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


def build_persona_context(persona: Persona) -> str:
    return f"""
Persona: {persona.name}
Age: {persona.age}
Gender: {persona.gender}
Location: {persona.city}, {persona.country}
Occupation: {persona.occupation}
Education: {persona.education}
Income: {persona.annual_income}
Technology Usage: {persona.technology_usage}
Digital Literacy: {persona.digital_literacy}
Budget: {persona.budget}
Purchase Channel: {persona.purchase_channel}
Purchase Frequency: {persona.purchase_frequency}
Brand Loyalty: {persona.brand_loyalty}
Operating System: {persona.operating_system}
Ecosystem: {persona.ecosystem}
Personality: {json.dumps(persona.personality)}
Buying Behaviour: {json.dumps(persona.buying_behaviour)}
Hobbies: {json.dumps(persona.hobbies)}
Goals: {json.dumps(persona.goals)}
Motivations: {json.dumps(persona.motivations)}
Pain Points: {json.dumps(persona.pain_points)}
Frustrations: {json.dumps(persona.frustrations)}
Preferred Features: {json.dumps(persona.preferred_features)}
Favourite Apps: {json.dumps(persona.favourite_apps)}
Summary: {persona.persona_summary}
Quote: {persona.quote}
"""


def _build_persona_distinctive_profile(persona: Persona) -> str:
    return (
        f"budget={persona.budget}; "
        f"purchase_channel={persona.purchase_channel}; "
        f"purchase_frequency={persona.purchase_frequency}; "
        f"brand_loyalty={persona.brand_loyalty}; "
        f"device={persona.operating_system}/{persona.ecosystem}; "
        f"top_pain_point={persona.pain_points[0] if persona.pain_points else 'unknown'}; "
        f"top_preferred_feature={persona.preferred_features[0] if persona.preferred_features else 'unknown'}; "
        f"quote={persona.quote}"
    )


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
        return json.loads(text[start : end + 1])

    raise json.JSONDecodeError("No JSON object found in model response", text, 0)


def _build_fallback_response(persona: Persona, question: str, product_category: str) -> str:
    primary_pain_point = persona.pain_points[0] if persona.pain_points else "it does not fit my routine"
    primary_feature = persona.preferred_features[0] if persona.preferred_features else "speed"
    primary_goal = persona.goals[0] if persona.goals else "save time"

    if persona.purchase_frequency.lower() in {"daily", "often", "frequent"}:
        base = f"I would use it often if it feels fast and reliable"
    elif persona.budget.lower() in {"low", "budget", "price sensitive"}:
        base = f"I would only use it if the price is reasonable"
    else:
        base = f"I would use it when it clearly helps me"

    return f"{base} because {primary_feature.lower()} matters to me and {primary_pain_point.lower()}."


def _clean_user_facing_response(response_text: str, persona_name: str) -> str:
    text = response_text.strip().strip('"').strip("'")
    if not text:
        return text

    patterns = [
        rf"^as\s+{re.escape(persona_name)}\s*,?\s*",
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


def _ensure_persona_variation(response_text: str, persona: Persona, question: str) -> str:
    text = response_text.strip()
    if not text:
        return text

    lower_text = text.lower()
    persona_cues = [
        persona.budget.lower(),
        persona.purchase_channel.lower(),
        persona.purchase_frequency.lower(),
        persona.brand_loyalty.lower(),
        persona.technology_usage.lower(),
        persona.digital_literacy.lower(),
        persona.operating_system.lower(),
        persona.ecosystem.lower(),
    ]

    if any(cue and cue in lower_text for cue in persona_cues):
        return text

    if persona.pain_points:
        text = f"{text} Because {persona.pain_points[0].lower()}."
    elif persona.preferred_features:
        text = f"{text} I value {persona.preferred_features[0].lower()}."
    elif persona.goals:
        text = f"{text} It helps me {persona.goals[0].lower()}."
    else:
        text = f"{text} That is my view as {persona.name}."

    words = text.split()
    if len(words) > 22:
        text = " ".join(words[:22]).rstrip(".,;") + "."

    return text


def _build_persona_specific_response(persona: Persona) -> str:
    if persona.pain_points:
        detail = persona.pain_points[0].lower()
        return f"I’d try it if it solves {detail}."

    if persona.preferred_features:
        detail = persona.preferred_features[0].lower()
        return f"I want {detail}, so that would matter to me."

    if persona.goals:
        detail = persona.goals[0].lower()
        return f"I’d use it if it helps me {detail}."

    if persona.budget:
        return f"It works for me only if the price fits my {persona.budget.lower()} budget."

    if persona.purchase_channel:
        return f"I’d prefer it through {persona.purchase_channel.lower()} if it feels easy."

    return f"I’d use it if it fits my routine as {persona.name}."


def _is_generic_response(response_text: str) -> bool:
    lower_text = response_text.lower().strip()
    generic_phrases = [
        "i would probably use this",
        "i would use it when it clearly helps me",
        "i would only use it if the price is reasonable",
        "i would use it often if it feels fast and reliable",
        "that is my view",
        "that is how i see it",
    ]
    return any(phrase in lower_text for phrase in generic_phrases)


def generate_response_for_persona(
    persona: Persona,
    question: str,
    product_category: str,
    history: Optional[List[Dict]] = None,
) -> PersonaSurveyResponse:
    context = build_persona_context(persona)

    history_context = ""
    if history:
        history_context = "Previous conversation:\n"
        for entry in history:
            if entry["persona_id"] == str(persona.id):
                history_context += f"Q: {entry['question']}\nA: {entry['response']}\n\n"

    prompt = f"""You are {persona.name}, a synthetic user participating in a survey.

Your background:
{context}

Product Category: {product_category}

{history_context}Please respond to the following survey question as {persona.name}. Be authentic and consistent with your persona's background, personality, and communication style.
Write a short, natural answer that sounds like a real person.
Do not start with "As {persona.name}".
Do not repeat the product category or question text.

Question: {question}

Return ONLY valid JSON with no markdown in this format:
{{
  "response": "your response as this persona",
  "sentiment": "positive/negative/neutral/mixed"
}}"""

    default_response = PersonaSurveyResponse(
        persona_id=persona.id,
        persona_name=persona.name,
        response=_build_fallback_response(persona, question, product_category),
        sentiment="neutral",
    )

    for attempt in range(3):
        for model_name in SURVEY_GEMINI_MODELS:
            try:
                result = client.models.generate_content(model=model_name, contents=prompt)
                data = _parse_model_json(getattr(result, "text", ""))

                response_text = str(data.get("response", "")).strip()
                response_text = _clean_user_facing_response(response_text, persona.name)
                sentiment = str(data.get("sentiment", "neutral")).strip().lower()
                if sentiment not in {"positive", "negative", "neutral", "mixed"}:
                    sentiment = "neutral"

                if not response_text:
                    response_text = _build_fallback_response(persona, question, product_category)

                return PersonaSurveyResponse(
                    persona_id=persona.id,
                    persona_name=persona.name,
                    response=response_text,
                    sentiment=sentiment,
                )
            except Exception:
                continue

        if attempt < 2:
            time.sleep(2)

    return default_response


def generate_response_for_stored_question(
    persona: Persona,
    question: SurveyQuestionRecord,
) -> PersonaSurveyResponse:
    context = build_persona_context(persona)
    distinctive_profile = _build_persona_distinctive_profile(persona)

    prompt = f"""You are {persona.name}, a synthetic user participating in a survey.

Your background:
{context}

Distinctive profile:
{distinctive_profile}

Survey context:
Product Name: {question.product_name}
Industry: {question.industry}
Product Description: {question.product_description}
Target Audience: {question.target_audience}
Research Objective: {question.research_objective}

Please respond to the following survey question as {persona.name}. Be authentic and consistent with your persona's background, personality, and communication style.
Write a short, natural answer that sounds like a real person.
Use 1 sentence only.
Keep it under 20 words.
Make it sound different from other personas.
Do not start with "As {persona.name}".
Do not repeat the product context or question text.
Your answer must be clearly distinct from other personas and should reflect at least one concrete persona-specific detail such as budget, pain point, preferred feature, device, or purchase habit.

Question: {question.question_text}

Return ONLY valid JSON with no markdown in this format:
{{
  "response": "your response as this persona",
  "sentiment": "positive/negative/neutral/mixed"
}}"""

    default_response = PersonaSurveyResponse(
        persona_id=persona.id,
        persona_name=persona.name,
        response=_build_fallback_response(persona, question.question_text, question.industry),
        sentiment="neutral",
    )

    for attempt in range(3):
        for model_name in SURVEY_GEMINI_MODELS:
            try:
                result = client.models.generate_content(model=model_name, contents=prompt)
                data = _parse_model_json(getattr(result, "text", ""))

                response_text = str(data.get("response", "")).strip()
                response_text = _clean_user_facing_response(response_text, persona.name)
                response_text = _ensure_persona_variation(response_text, persona, question.question_text)
                sentiment = str(data.get("sentiment", "neutral")).strip().lower()
                if sentiment not in {"positive", "negative", "neutral", "mixed"}:
                    sentiment = "neutral"

                if not response_text or _is_generic_response(response_text):
                    response_text = _build_persona_specific_response(persona)

                return PersonaSurveyResponse(
                    persona_id=persona.id,
                    persona_name=persona.name,
                    response=response_text,
                    sentiment=sentiment,
                )
            except Exception:
                continue

        if attempt < 2:
            time.sleep(2)

    return default_response


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

    if parallel:
        async def _run_parallel():
            tasks = [
                _async_generate(p, question.question, question.product_category, history)
                for p in personas
            ]
            return await asyncio.gather(*tasks)

        persona_responses = asyncio.run(_run_parallel())
    else:
        for persona in personas:
            resp = generate_response_for_persona(persona, question.question, question.product_category, history)
            persona_responses.append(resp)

    for resp in persona_responses:
        survey_memory.add_interaction(session_id, resp.persona_id, question.question, resp.response)

    return SurveyResponse(
        question_index=question_index,
        question=question.question,
        product_category=question.product_category,
        responses=persona_responses,
    )


async def _async_generate(
    persona: Persona,
    question: str,
    product_category: str,
    history: Optional[List[Dict]] = None,
) -> PersonaSurveyResponse:
    return generate_response_for_persona(persona, question, product_category, history)


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


def get_survey_result(db: Session, session_id: UUID) -> SurveyResult:
    if session_id not in active_sessions:
        raise ValueError(f"Session {session_id} not found")

    session = active_sessions[session_id]
    history = survey_memory.get_history(session_id)

    grouped: Dict[str, List[Dict]] = {}
    for entry in history:
        grouped.setdefault(entry["question"], []).append(entry)

    responses = []
    for i, q in enumerate(session.questions):
        entries = grouped.get(q.question, [])
        persona_responses = []
        for pid in session.persona_ids:
            matching = [e for e in entries if e["persona_id"] == str(pid)]
            if matching:
                persona = db.query(Persona).filter(Persona.id == pid).first()
                persona_responses.append(
                    PersonaSurveyResponse(
                        persona_id=pid,
                        persona_name=persona.name if persona else "Unknown",
                        response=matching[-1]["response"],
                        sentiment="neutral",
                    )
                )

        responses.append(
            SurveyResponse(
                question_index=i,
                question=q.question,
                product_category=q.product_category,
                responses=persona_responses,
            )
        )

    return SurveyResult(session_id=session_id, responses=responses, completed_at=datetime.utcnow())


def answer_stored_question_for_all_personas(
    db: Session,
    question_id: UUID,
    parallel: bool = True,
):
    question = get_survey_question(db, question_id)
    if not question:
        raise ValueError(f"Question {question_id} not found")

    existing_responses = get_survey_responses_for_question(db, question_id)
    if existing_responses:
        return existing_responses

    personas = get_all_personas(db)
    if not personas:
        raise ValueError("No personas found in the database")

    seen_responses: set[str] = set()

    if parallel:
        async def _run_parallel():
            tasks = [
                _async_generate_for_stored_question(persona, question)
                for persona in personas
            ]
            return await asyncio.gather(*tasks)

        persona_responses = asyncio.run(_run_parallel())
    else:
        persona_responses = [
            generate_response_for_stored_question(persona, question)
            for persona in personas
        ]

    for index, persona_response in enumerate(persona_responses):
        normalized = persona_response.response.strip().lower()
        if normalized in seen_responses or _is_generic_response(persona_response.response):
            persona = personas[index]
            persona_response.response = _build_persona_specific_response(persona)
            normalized = persona_response.response.strip().lower()

        seen_responses.add(normalized)

    return create_survey_responses(db, question_id, persona_responses)


async def _async_generate_for_stored_question(
    persona: Persona,
    question: SurveyQuestionRecord,
) -> PersonaSurveyResponse:
    return generate_response_for_stored_question(persona, question)
    if session_id not in active_sessions:
        raise ValueError(f"Session {session_id} not found")

    session = active_sessions[session_id]
    history = survey_memory.get_history(session_id)

    grouped = {}
    for entry in history:
        q = entry["question"]
        if q not in grouped:
            grouped[q] = []
        grouped[q].append(entry)

    responses = []
    for i, q in enumerate(session.questions):
        entries = grouped.get(q.question, [])
        persona_responses = []
        for pid in session.persona_ids:
            matching = [e for e in entries if e["persona_id"] == str(pid)]
            if matching:
                persona = db.query(Persona).filter(Persona.id == pid).first()
                persona_responses.append(PersonaSurveyResponse(
                    persona_id=pid,
                    persona_name=persona.name if persona else "Unknown",
                    response=matching[-1]["response"],
                    sentiment="neutral"
                ))
        responses.append(SurveyResponse(
            question_index=i,
            question=q.question,
            product_category=q.product_category,
            responses=persona_responses
        ))

    return SurveyResult(
        session_id=session_id,
        responses=responses,
        completed_at=datetime.utcnow()
    )
