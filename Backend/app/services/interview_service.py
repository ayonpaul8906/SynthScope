import os
import time
from typing import Any, Dict, List, Optional
from uuid import UUID

from dotenv import load_dotenv
from google import genai
from sqlalchemy.orm import Session

from app.models.persona import Persona
from app.models.product_brief import ProductBriefRecord
from app.repositories.interview_repository import list_interview_questions
from app.repositories.product_brief_repository import get_latest_product_brief

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

INTERVIEW_GEMINI_MODELS = [
    model.strip()
    for model in os.getenv(
        "INTERVIEW_GEMINI_MODELS",
        "models/gemini-3.5-flash,models/gemini-3.5-flash-lite,models/gemini-2.5-flash",
    ).split(",")
    if model.strip()
]

MAX_HISTORY_TURNS = 40


def _clean_reply(text: str) -> str:
    text = text.strip()
    # Strip surrounding quotes accidentally emitted by the model
    if len(text) >= 2 and text[0] == '"' and text[-1] == '"':
        text = text[1:-1]
    return text.strip()


def get_personalized_questions_for_persona(
    db: Session,
    persona: Optional[Persona] = None,
    user_id: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Fetches stored interview questions from DB and dynamically renders templates
    using the selected persona's attributes and the user's active product brief.
    """
    questions = list_interview_questions(db)
    brief = get_latest_product_brief(db, user_id=user_id)

    occupation = persona.occupation if persona else "Software Professional"
    budget = persona.budget if persona else "standard tier budget"
    industry = brief.industry if brief else "your industry"
    product_name = brief.product_name if brief else "a new enterprise solution"

    rendered = []
    for q in questions:
        text = q.question_template.replace("{occupation}", str(occupation))
        text = text.replace("{budget}", str(budget))
        text = text.replace("{industry}", str(industry))
        text = text.replace("{product_name}", str(product_name))
        rendered.append({
            "id": str(q.id),
            "key": q.question_key,
            "question": text,
            "category": q.category,
        })
    return rendered


def generate_db_hardcoded_reply(
    persona: Persona,
    question_key: str,
    brief: Optional[ProductBriefRecord] = None,
) -> str:
    """
    Synthesizes an immediate, deeply personalized response straight from the persona's
    database records without invoking the LLM, ensuring zero latency and deterministic memory.
    """
    product_name = brief.product_name if brief else "a software solution"
    industry = brief.industry if brief else "my daily workspace"
    
    routine = persona.daily_routine[0] if (persona.daily_routine and len(persona.daily_routine) > 0) else "coordinating high-priority projects and tasks"
    apps = ", ".join(persona.favourite_apps[:3]) if persona.favourite_apps else "a core suite of specialized apps"
    pain = persona.pain_points[0] if (persona.pain_points and len(persona.pain_points) > 0) else "slow, fragmented software interfaces"
    frustrat = persona.frustrations[0] if (persona.frustrations and len(persona.frustrations) > 0) else "manual administrative repetition"
    feature = persona.preferred_features[0] if (persona.preferred_features and len(persona.preferred_features) > 0) else "an intuitive, frictionless user interface"
    motivation = persona.motivations[0] if (persona.motivations and len(persona.motivations) > 0) else "eliminating unnecessary complexity"
    goal = persona.goals[0] if (persona.goals and len(persona.goals) > 0) else "optimize my daily efficiency"
    devices = ", ".join(persona.devices) if persona.devices else "MacBook Pro and iPhone"

    buying = persona.buying_behaviour or {}
    price_sens = buying.get("price_sensitivity", "moderate")
    decision_factor = buying.get("decision_factor", "demonstrated productivity ROI")

    if question_key == "routine":
        return (
            f"As a {persona.age}-year-old {persona.occupation} working in {persona.city}, my daily routine consistently revolves around {routine.lower()}. "
            f"Given my {persona.lifestyle.lower()} pace, I rely on tools like {apps} to keep my workflows streamlined without getting bogged down."
        )
    elif question_key == "frustrations":
        return (
            f"In the {industry} realm, my single biggest operational headache is unquestionably {pain.lower()}. "
            f"Too many tools claim to simplify workflows but actually create extra friction around {frustrat.lower()}, which drains real productivity from my day."
        )
    elif question_key == "features":
        return (
            f"For me to actively champion adoption of {product_name}, it really comes down to delivering {feature.lower()} with zero learning curve. "
            f"My overriding driver is {motivation.lower()}, so if your platform natively accomplishes that, it fits exactly what I look for."
        )
    elif question_key == "pricing":
        return (
            f"Operating within my annual compensation bracket ({persona.annual_income}), my typical software budget sits around {persona.budget} with a {price_sens.lower()} sensitivity to recurring fees. "
            f"My ultimate purchase catalyst is {decision_factor.lower()}—if {product_name} clearly saves me manual hours every week, the investment justifies itself immediately."
        )
    elif question_key == "tech_stack":
        return (
            f"My daily technology ecosystem centers firmly on {persona.ecosystem}, working across {devices} running {persona.operating_system}. "
            f"With my {persona.digital_literacy.lower()} literacy level, my daily drivers are {apps}; any new platform needs to integrate smoothly alongside them."
        )
    else:
        return (
            f"As I frequently remind my team: '{persona.quote.strip()}' "
            f"Evaluating {product_name} from my chair as a {persona.occupation}, my fundamental objective is to {goal.lower()}. If your platform accelerates that without friction, I'm completely on board."
        )


def _build_persona_profile(persona: Persona) -> str:
    personality = persona.personality or {}
    buying = persona.buying_behaviour or {}
    return f"""PERSONA PROFILE:
- Name: {persona.name}
- Age: {persona.age}
- Gender: {persona.gender}
- Location: {persona.city}, {persona.country}
- Occupation: {persona.occupation}
- Education: {persona.education}
- Annual Income: {persona.annual_income}
- Marital Status: {persona.marital_status}
- Lifestyle: {persona.lifestyle}
- Summary: {persona.persona_summary}
- Hobbies: {', '.join(persona.hobbies) if persona.hobbies else 'None'}
- Daily Routine: {', '.join(persona.daily_routine) if persona.daily_routine else 'None'}
- Technology Usage: {persona.technology_usage}
- Digital Literacy: {persona.digital_literacy}
- Fitness Level: {persona.fitness_level}
- Goals: {', '.join(persona.goals) if persona.goals else 'None'}
- Motivations: {', '.join(persona.motivations) if persona.motivations else 'None'}
- Pain Points: {', '.join(persona.pain_points) if persona.pain_points else 'None'}
- Frustrations: {', '.join(persona.frustrations) if persona.frustrations else 'None'}
- Preferred Features: {', '.join(persona.preferred_features) if persona.preferred_features else 'None'}
- Budget: {persona.budget}
- Purchase Channel: {persona.purchase_channel}
- Purchase Frequency: {persona.purchase_frequency}
- Brand Loyalty: {persona.brand_loyalty}
- Devices: {', '.join(persona.devices) if persona.devices else 'None'}
- Operating System: {persona.operating_system}
- Ecosystem: {persona.ecosystem}
- Favourite Apps: {', '.join(persona.favourite_apps) if persona.favourite_apps else 'None'}
- Personality Traits: {', '.join(personality.get('traits') or []) if personality.get('traits') else 'None'}
- Communication Style: {personality.get('communication_style', 'None')}
- Decision Making: {personality.get('decision_making', 'None')}
- Personality Description: {personality.get('description', 'None')}
- Buying Behaviour Price Sensitivity: {buying.get('price_sensitivity', 'None')}
- Buying Behaviour Decision Factor: {buying.get('decision_factor', 'None')}
- Buying Behaviour Purchase Trigger: {buying.get('purchase_trigger', 'None')}
- Buying Behaviour Description: {buying.get('description', 'None')}
- Accessibility Needs: {persona.accessibility_needs or 'None'}
- Environmental Awareness: {persona.environmental_awareness or 'Moderate'}
- Personal Quote: "{persona.quote}"."""


def _build_product_brief_block(brief: Optional[ProductBriefRecord]) -> str:
    if not brief:
        return ""
    return f"""
PRODUCT & RESEARCH CONTEXT (The researcher interviewing you is exploring this specific product):
- Product Name: {brief.product_name}
- Industry: {brief.industry}
- Product Description: {brief.product_description}
- Target Audience: {brief.target_audience}
- Research Objective: {brief.research_objective}
"""


def _build_history(history: List[Any], persona_name: str) -> str:
    if not history:
        return "None (this is the start of the conversation)."

    trimmed = history[-MAX_HISTORY_TURNS:]
    lines = []
    for msg in trimmed:
        if isinstance(msg, dict):
            role = msg.get("role", "user")
            text = str(msg.get("text", "")).strip()
        else:
            role = getattr(msg, "role", "user")
            text = str(getattr(msg, "text", "")).strip()
        if not text:
            continue
        speaker = "Interviewer" if role == "user" else persona_name
        lines.append(f"{speaker}: {text}")
    return "\n".join(lines) or "None (this is the start of the conversation)."


def _build_fallback(persona: Persona, message: str, brief: Optional[ProductBriefRecord] = None) -> str:
    goal = persona.goals[0] if persona.goals else "make my daily work easier"
    pain = persona.pain_points[0] if persona.pain_points else "slow, clunky software"
    feature = persona.preferred_features[0] if persona.preferred_features else "a simple, fast experience"
    product_name = brief.product_name if brief else "your software solution"

    if "frustrat" in message.lower() or "pain" in message.lower() or "problem" in message.lower():
        return (
            f"Honestly, my biggest headache is {pain.lower()}. "
            f"As a {persona.occupation} in {persona.city}, that's what eats into my time the most."
        )
    if "feature" in message.lower() or "want" in message.lower() or "like to see" in message.lower():
        return (
            f"For me to consider adopting {product_name}, it would come down to {feature.lower()}—that's what I care about most. "
            f"If your tool nails that without extra admin friction, I'm very interested."
        )
    if "price" in message.lower() or "cost" in message.lower() or "budget" in message.lower() or "roi" in message.lower():
        return (
            f"I operate with a budget around {persona.budget}, but I need to see clear value. "
            f"Transparent pricing and demonstrated ROI with {product_name} are what would win my buy-in."
        )
    if "routine" in message.lower() or "day" in message.lower() or "daily" in message.lower():
        return (
            f"A typical workday for me as a {persona.occupation} centers on staying focused on {goal.lower()}. "
            f"I rely on daily tools like {', '.join(persona.favourite_apps[:3]) if persona.favourite_apps else 'a few core apps'} to keep things moving."
        )
    return (
        f"That's a valid perspective. Evaluating {product_name} from where I stand as a {persona.occupation}, my top priority is {goal.lower()}. "
        f"If your solution genuinely helps achieve that without adding complexity, I'm eager to explore it."
    )


def generate_interview_reply(
    persona: Persona,
    message: str,
    history: Optional[List[Any]] = None,
    brief: Optional[ProductBriefRecord] = None,
) -> str:
    history = history or []
    persona_profile = _build_persona_profile(persona)
    product_block = _build_product_brief_block(brief)
    conversation = _build_history(history, persona.name)

    prompt = f"""You are {persona.name}, a real {persona.age}-year-old {persona.occupation} living in {persona.city}, {persona.country}. You are taking part in a live user-research interview and must answer exactly the way this person would — in first person, with a natural conversational voice, and with opinions and behaviour that stay consistent throughout the whole interview.

{persona_profile}
{product_block}

CONVERSATION SO FAR (your memory — your answers must stay consistent with everything below):
{conversation}

THE INTERVIEWER JUST ASKED YOU:
{message}

RULES & PERSONALIZATION:
1. Stay fully in character as {persona.name}. NEVER break character. NEVER mention being an AI, a model, a synthetic persona, a simulation, or a chatbot.
2. Answer the specific question just asked, deeply grounded in your demographic traits, daily routines, financial profile ({persona.annual_income} income / {persona.budget} budget), and what you said earlier in this conversation.
3. When discussing the interviewer's specific product concept ({brief.product_name if brief else 'software'}), evaluate it strictly through your individual persona lens: does it alleviate your stated pain points ({', '.join(persona.pain_points) if persona.pain_points else 'friction'})? Would it integrate into your preferred tech ecosystem ({persona.ecosystem}) and daily apps ({', '.join(persona.favourite_apps) if persona.favourite_apps else 'tools'})?
4. If the interviewer asks the same question again, give your own consistent answer based on your profile and memory — do not ask for extra information and do not repeat the interviewer's words.
5. Keep it human, authentic, and conversational: 2 to 4 sentences. No bullet points, no markdown, no JSON.
6. Do not start your reply with "As {persona.name}" or "As a persona" or "As a synthetic user".

Return ONLY your reply text."""

    fallback = _build_fallback(persona, message, brief)

    for attempt in range(2):
        for model_name in INTERVIEW_GEMINI_MODELS:
            try:
                result = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                )
                reply = _clean_reply(getattr(result, "text", ""))
                if reply:
                    return reply
            except Exception as e:
                print(f"[interview] Model {model_name} attempt {attempt} notice: {e}")
                continue

        if attempt < 1:
            time.sleep(1)

    return fallback
