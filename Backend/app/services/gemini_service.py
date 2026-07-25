import os
import json
import re
import time
from typing import Any

from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

PERSONA_GEMINI_MODELS = [
    model.strip()
    for model in os.getenv(
        "PERSONA_GEMINI_MODELS",
        "models/gemini-3.5-flash,models/gemini-2.5-flash,models/gemini-1.5-flash",
    ).split(",")
    if model.strip()
]


def _parse_json(text: str) -> dict[str, Any]:
    if not text:
        raise json.JSONDecodeError("Empty response", "", 0)

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    fenced = re.search(r"```(?:json)?\s*(\{.*\}|\[.*\])\s*```", text, flags=re.DOTALL)
    if fenced:
        return json.loads(fenced.group(1))

    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        return json.loads(text[start : end + 1])

    start = text.find("[")
    end = text.rfind("]")
    if start != -1 and end != -1 and end > start:
        return json.loads(text[start : end + 1])

    raise json.JSONDecodeError("No JSON found", text, 0)


def _extract_persona_payload(response_data: Any) -> list[dict[str, Any]]:
    if isinstance(response_data, list):
        return [persona for persona in response_data if isinstance(persona, dict)]

    if isinstance(response_data, dict):
        personas = response_data.get("personas")
        if isinstance(personas, list) and personas:
            return [persona for persona in personas if isinstance(persona, dict)]
        return [response_data]

    return []


def _ensure_text(value: Any, fallback: str) -> str:
    text = str(value).strip() if value is not None else ""
    return text or fallback


def _ensure_int(value: Any, fallback: int) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return fallback


def _ensure_list(value: Any, fallback: list[str]) -> list[str]:
    if isinstance(value, list):
        cleaned = [str(item).strip() for item in value if str(item).strip()]
        return cleaned or fallback

    if isinstance(value, str):
        cleaned = [item.strip() for item in value.split(",") if item.strip()]
        return cleaned or fallback

    return fallback


def _ensure_mapping(value: Any, fallback: dict[str, Any]) -> dict[str, Any]:
    if isinstance(value, dict):
        return value
    return fallback


def _brief_text(
    product_name: str,
    industry: str,
    product_description: str,
    target_audience: str,
    research_objective: str,
) -> str:
    return "\n".join(
        [
            f"Product Name: {product_name}",
            f"Industry: {industry}",
            f"Product Description: {product_description}",
            f"Target Audience: {target_audience}",
            f"Research Objective: {research_objective}",
        ]
    )


def _normalize_persona(
    persona: dict[str, Any],
    index: int,
    product_name: str,
    industry: str,
    product_description: str,
    target_audience: str,
    research_objective: str,
) -> dict[str, Any]:
    fallback_name = f"{industry} Persona {index + 1}"
    fallback_location = target_audience.split(",")[0].strip() or "Global"
    fallback_summary = f"A {industry.lower()} user shaped by {research_objective.lower()} for {product_name}."

    return {
        "name": _ensure_text(persona.get("name"), fallback_name),
        "age": _ensure_int(persona.get("age"), 26 + (index % 10)),
        "gender": _ensure_text(persona.get("gender"), "Prefer not to say"),
        "city": _ensure_text(persona.get("city"), fallback_location),
        "country": _ensure_text(persona.get("country"), "Global"),
        "occupation": _ensure_text(
            persona.get("occupation"),
            target_audience.split(",")[0].strip() or industry,
        ),
        "education": _ensure_text(persona.get("education"), "Varies"),
        "annual_income": _ensure_text(persona.get("annual_income"), "Varies"),
        "marital_status": _ensure_text(persona.get("marital_status"), "Varies"),
        "persona_summary": _ensure_text(persona.get("persona_summary"), fallback_summary),
        "lifestyle": _ensure_text(persona.get("lifestyle"), "Balanced"),
        "hobbies": _ensure_list(persona.get("hobbies"), ["Reading", "Tech exploration"]),
        "daily_routine": _ensure_list(persona.get("daily_routine"), ["Checks tools daily", "Evaluates options quickly"]),
        "technology_usage": _ensure_text(persona.get("technology_usage"), "Moderate"),
        "digital_literacy": _ensure_text(persona.get("digital_literacy"), "Moderate"),
        "fitness_level": _ensure_text(persona.get("fitness_level"), "Moderate"),
        "goals": _ensure_list(persona.get("goals"), [f"Solve {research_objective.lower()}"]),
        "motivations": _ensure_list(persona.get("motivations"), ["Save time", "Reduce friction"]),
        "pain_points": _ensure_list(persona.get("pain_points"), ["Unclear workflows", "Slow adoption"]),
        "frustrations": _ensure_list(persona.get("frustrations"), ["Generic experiences", "Too many steps"]),
        "preferred_features": _ensure_list(persona.get("preferred_features"), ["Fast onboarding", "Clear value"]),
        "budget": _ensure_text(persona.get("budget"), "Moderate"),
        "purchase_channel": _ensure_text(persona.get("purchase_channel"), "Direct online"),
        "purchase_frequency": _ensure_text(persona.get("purchase_frequency"), "Monthly"),
        "brand_loyalty": _ensure_text(persona.get("brand_loyalty"), "Medium"),
        "devices": _ensure_list(persona.get("devices"), ["Laptop", "Phone"]),
        "operating_system": _ensure_text(persona.get("operating_system"), "Mixed"),
        "ecosystem": _ensure_text(persona.get("ecosystem"), "Cross-platform"),
        "favourite_apps": _ensure_list(persona.get("favourite_apps"), ["Notion", "Slack"]),
        "personality": _ensure_mapping(
            persona.get("personality"),
            {
                "traits": ["Pragmatic", "Curious"],
                "communication_style": "Direct",
                "decision_making": "Balanced",
                "description": "Practical and research-minded.",
            },
        ),
        "buying_behaviour": _ensure_mapping(
            persona.get("buying_behaviour"),
            {
                "price_sensitivity": "Moderate",
                "decision_factor": "Clear ROI",
                "purchase_trigger": research_objective,
                "description": "Evaluates products against value and fit.",
            },
        ),
        "accessibility_needs": persona.get("accessibility_needs"),
        "environmental_awareness": persona.get("environmental_awareness"),
        "quote": _ensure_text(persona.get("quote"), f'"{product_name} should feel tailored to my workflow."'),
    }


def _fallback_personas(
    product_name: str,
    industry: str,
    product_description: str,
    target_audience: str,
    research_objective: str,
    persona_count: int,
) -> list[dict[str, Any]]:
    archetypes = [
        {
            "name": "Maya Patel",
            "age": 29,
            "gender": "Female",
            "city": "Bengaluru",
            "country": "India",
            "occupation": target_audience.split(",")[0].strip() or industry,
            "technology_usage": "High",
            "digital_literacy": "Advanced",
            "goals": ["Move faster", "Validate ideas early"],
            "frustrations": ["Fragmented tooling", "Slow feedback loops"],
            "preferred_features": ["Fast setup", "Clear analytics", "Collaborative workflows"],
            "personality": {
                "traits": ["Curious", "Decisive", "Collaborative"],
                "communication_style": "Clear and concise",
                "decision_making": "Data-informed",
                "description": "Looks for products that remove friction without adding complexity.",
            },
        },
        {
            "name": "Daniel Kim",
            "age": 37,
            "gender": "Male",
            "city": "Seoul",
            "country": "South Korea",
            "occupation": "Operations Lead",
            "technology_usage": "Moderate",
            "digital_literacy": "Confident",
            "goals": ["Reduce manual work", "Keep teams aligned"],
            "frustrations": ["Unclear ownership", "Too many context switches"],
            "preferred_features": ["Automation", "Role clarity", "Reliable support"],
            "personality": {
                "traits": ["Pragmatic", "Methodical", "Patient"],
                "communication_style": "Structured",
                "decision_making": "Risk-aware",
                "description": "Wants stable systems that support repeatable workflows.",
            },
        },
        {
            "name": "Sofia Alvarez",
            "age": 24,
            "gender": "Female",
            "city": "Madrid",
            "country": "Spain",
            "occupation": "Early-career builder",
            "technology_usage": "High",
            "digital_literacy": "High",
            "goals": ["Learn quickly", "Ship polished work"],
            "frustrations": ["Steep learning curves", "Unhelpful onboarding"],
            "preferred_features": ["Guided setup", "Templates", "Instant feedback"],
            "personality": {
                "traits": ["Ambitious", "Exploratory", "Impatient"],
                "communication_style": "Friendly and direct",
                "decision_making": "Fast, with validation",
                "description": "Prefers products that make sophisticated tasks feel approachable.",
            },
        },
        {
            "name": "Marcus Johnson",
            "age": 46,
            "gender": "Male",
            "city": "Austin",
            "country": "United States",
            "occupation": "Enterprise stakeholder",
            "technology_usage": "Moderate",
            "digital_literacy": "Advanced",
            "goals": ["Stay compliant", "Protect existing investments"],
            "frustrations": ["Frequent UI changes", "Vague security posture"],
            "preferred_features": ["Security controls", "Auditability", "Admin visibility"],
            "personality": {
                "traits": ["Cautious", "Thorough", "Skeptical"],
                "communication_style": "Formal and precise",
                "decision_making": "Consensus-driven",
                "description": "Needs confidence that a product will fit existing governance requirements.",
            },
        },
    ]

    personas: list[dict[str, Any]] = []
    for index in range(persona_count):
        template = archetypes[index % len(archetypes)]
        personas.append(
            _normalize_persona(
                {
                    **template,
                    "persona_summary": f"A {template['occupation'].lower()} shaped by {research_objective.lower()}.",
                    "lifestyle": "Balanced",
                    "annual_income": "Varies",
                    "marital_status": "Varies",
                    "education": "Varies",
                    "budget": "Moderate",
                    "purchase_channel": "Direct online",
                    "purchase_frequency": "Monthly",
                    "brand_loyalty": "Medium",
                    "devices": ["Laptop", "Phone"],
                    "operating_system": "Mixed",
                    "ecosystem": "Cross-platform",
                    "daily_routine": ["Uses digital tools throughout the workday", "Checks product updates regularly"],
                    "motivations": ["Save time", "Work with confidence"],
                    "pain_points": ["Cluttered flows", "Manual work"],
                    "favourite_apps": ["Notion", "Slack", "Chrome"],
                    "quote": f'"{product_name} should help me make faster, better decisions."',
                    "buying_behaviour": {
                        "price_sensitivity": "Moderate",
                        "decision_factor": "Fit for workflow",
                        "purchase_trigger": research_objective,
                        "description": f"Evaluates {product_name} against the needs of {target_audience}.",
                    },
                },
                index,
                product_name,
                industry,
                product_description,
                target_audience,
                research_objective,
            )
        )

    return personas


def generate_personas(
    product_name: str | None = None,
    industry: str | None = None,
    product_description: str | None = None,
    target_audience: str | None = None,
    research_objective: str | None = None,
    persona_count: int = 10,
    product: str | None = None,
):
    product_name = _ensure_text(product_name, product or "Untitled Product")
    industry = _ensure_text(industry, "General")
    product_description = _ensure_text(product_description, product or "")
    target_audience = _ensure_text(target_audience, "General users")
    research_objective = _ensure_text(research_objective, "Product validation")
    persona_count = _ensure_int(persona_count, 10)

    product_brief = _brief_text(
        product_name,
        industry,
        product_description,
        target_audience,
        research_objective,
    )

    prompt = f"""You are an expert UX researcher and behavioral psychologist.

Generate {persona_count} completely unique, realistic, and internally consistent user personas for the following product brief.

Product brief:
{product_brief}

Rules:
- Return ONLY valid JSON.
- Do NOT use markdown.
- Generate exactly {persona_count} personas.
- Each persona must be grounded in the provided product brief.
- Vary age, seniority, decision style, and product needs across personas.
- Include all fields required by the response schema.
- Use lowercase JSON keys.
- Return JSON in this exact format:
{{
  "personas": [
    {{
      "name": "",
      "age": 0,
      "gender": "",
      "city": "",
      "country": "",
      "occupation": "",
      "education": "",
      "annual_income": "",
      "marital_status": "",
      "persona_summary": "",
      "lifestyle": "",
      "hobbies": [],
      "daily_routine": [],
      "technology_usage": "",
      "digital_literacy": "",
      "fitness_level": "",
      "goals": [],
      "motivations": [],
      "pain_points": [],
      "frustrations": [],
      "preferred_features": [],
      "budget": "",
      "purchase_channel": "",
      "purchase_frequency": "",
      "brand_loyalty": "",
      "devices": [],
      "operating_system": "",
      "ecosystem": "",
      "favourite_apps": [],
      "personality": {{
        "traits": [],
        "communication_style": "",
        "decision_making": "",
        "description": ""
      }},
      "buying_behaviour": {{
        "price_sensitivity": "",
        "decision_factor": "",
        "purchase_trigger": "",
        "description": ""
      }},
      "accessibility_needs": "",
      "environmental_awareness": "",
      "quote": ""
    }}
  ]
}}"""

    for attempt in range(3):
        for model_name in PERSONA_GEMINI_MODELS:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                )
                raw_personas = _extract_persona_payload(_parse_json(getattr(response, "text", "")))
                normalized_personas = [
                    _normalize_persona(
                        persona,
                        index,
                        product_name,
                        industry,
                        product_description,
                        target_audience,
                        research_objective,
                    )
                    for index, persona in enumerate(raw_personas[:persona_count])
                ]

                if normalized_personas:
                    return normalized_personas
            except json.JSONDecodeError:
                continue
            except Exception as e:
                print(e)
                continue

        if attempt < 2:
            time.sleep(2)

    print("Falling back to synthesized personas.")
    return _fallback_personas(
        product_name,
        industry,
        product_description,
        target_audience,
        research_objective,
        persona_count,
    )
