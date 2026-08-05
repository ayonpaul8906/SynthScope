import os
import json
import re
import time
import random
from typing import Any, Dict, List

from dotenv import load_dotenv
from google import genai

from app.agents.product_analysis_agent import ProductAnalysisAgent
from app.agents.persona_validator import PersonaValidator
from app.agents.diversity_checker import DiversityChecker

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

PERSONA_GEMINI_MODELS = [
    model.strip()
    for model in os.getenv(
        "PERSONA_GEMINI_MODELS",
        "models/gemini-3.5-flash-lite,models/gemini-3.5-flash",
    ).split(",")
    if model.strip()
]

# Initialize agents
product_analysis_agent = ProductAnalysisAgent(client=client)
persona_validator = PersonaValidator()
diversity_checker = DiversityChecker()


def _parse_json(text: str) -> Dict[str, Any]:
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


def _extract_persona_payload(response_data: Any) -> List[Dict[str, Any]]:
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


def _ensure_list(value: Any, fallback: List[str]) -> List[str]:
    if isinstance(value, list):
        cleaned = [str(item).strip() for item in value if str(item).strip()]
        return cleaned or fallback

    if isinstance(value, str):
        cleaned = [item.strip() for item in value.split(",") if item.strip()]
        return cleaned or fallback

    return fallback


def _ensure_mapping(value: Any, fallback: Dict[str, Any]) -> Dict[str, Any]:
    if isinstance(value, dict):
        return value
    return fallback


# Sentiment archetype rotation for diverse cohort
SENTIMENT_ARCHETYPES = ["champion", "pragmatist", "critic", "enthusiast", "skeptic", "mixed"]


def _detect_geography(target_audience: str, product_description: str, industry: str) -> str:
    """Detect if the product/audience is India-specific or global."""
    combined = f"{target_audience} {product_description} {industry}".lower()
    india_keywords = [
        "india", "indian", "bharat", "hindi", "rupee", "upi", "pan card",
        "bengaluru", "bangalore", "mumbai", "delhi", "hyderabad", "pune", "chennai",
        "kolkata", "ahmedabad", "jaipur", "startup india", "tier-1", "tier-2",
        "neet", "iit", "iim", "gst", "msme", "digital india",
    ]
    india_score = sum(1 for kw in india_keywords if kw in combined)
    return "india" if india_score >= 1 else "global"


def _normalize_persona(
    persona: Dict[str, Any],
    index: int,
    product_name: str,
    industry: str,
    product_description: str,
    target_audience: str,
    research_objective: str,
) -> Dict[str, Any]:
    fallback_name = f"{industry} Persona {index + 1}"
    fallback_location = target_audience.split(",")[0].strip() or "Global"
    fallback_summary = f"A {industry.lower()} user shaped by {research_objective.lower()} for {product_name}."
    # Assign sentiment archetype deterministically per index for diversity
    sentiment_archetype = SENTIMENT_ARCHETYPES[index % len(SENTIMENT_ARCHETYPES)]

    return {
        "name": _ensure_text(persona.get("name"), fallback_name),
        "age": _ensure_int(persona.get("age"), 24 + (index * 5) % 40),
        "gender": _ensure_text(persona.get("gender"), "Prefer not to say"),
        "city": _ensure_text(persona.get("city"), fallback_location),
        "country": _ensure_text(persona.get("country"), "Global"),
        "occupation": _ensure_text(
            persona.get("occupation"),
            target_audience.split(",")[0].strip() or industry,
        ),
        "education": _ensure_text(persona.get("education"), "Bachelor's Degree"),
        "annual_income": _ensure_text(persona.get("annual_income"), "Moderate"),
        "marital_status": _ensure_text(persona.get("marital_status"), "Single"),
        "persona_summary": _ensure_text(persona.get("persona_summary"), fallback_summary),
        "lifestyle": _ensure_text(persona.get("lifestyle"), "Balanced"),
        "hobbies": _ensure_list(persona.get("hobbies"), ["Reading", "Tech exploration"]),
        "daily_routine": _ensure_list(persona.get("daily_routine"), ["Evaluates digital tools daily", "Organises team workflows"]),
        "technology_usage": _ensure_text(persona.get("technology_usage"), "High"),
        "digital_literacy": _ensure_text(persona.get("digital_literacy"), "Advanced"),
        "fitness_level": _ensure_text(persona.get("fitness_level"), "Moderate"),
        "goals": _ensure_list(persona.get("goals"), [f"Optimize workflow for {product_name}", f"Fulfill {research_objective.lower()}"]),
        "motivations": _ensure_list(persona.get("motivations"), ["Save time", "Improve productivity"]),
        "pain_points": _ensure_list(persona.get("pain_points"), ["Unclear interfaces", "Manual data entry"]),
        "frustrations": _ensure_list(persona.get("frustrations"), ["Complex onboarding", "Slow performance"]),
        "preferred_features": _ensure_list(persona.get("preferred_features"), ["Intuitive UI", "Instant feedback", "Integrations"]),
        "budget": _ensure_text(persona.get("budget"), "Moderate"),
        "purchase_channel": _ensure_text(persona.get("purchase_channel"), "Direct Online"),
        "purchase_frequency": _ensure_text(persona.get("purchase_frequency"), "Monthly"),
        "brand_loyalty": _ensure_text(persona.get("brand_loyalty"), "Medium"),
        "devices": _ensure_list(persona.get("devices"), ["Laptop", "Smartphone"]),
        "operating_system": _ensure_text(persona.get("operating_system"), "macOS"),
        "ecosystem": _ensure_text(persona.get("ecosystem"), "Cross-platform"),
        "favourite_apps": _ensure_list(persona.get("favourite_apps"), ["Notion", "Slack", "Chrome"]),
        "personality": _ensure_mapping(
            persona.get("personality"),
            {
                "traits": ["Analytical", "Pragmatic", "Goal-oriented"],
                "communication_style": "Direct and concise",
                "decision_making": "Data-informed",
                "description": f"Focused on obtaining value from {product_name}.",
            },
        ),
        "buying_behaviour": _ensure_mapping(
            persona.get("buying_behaviour"),
            {
                "price_sensitivity": "Moderate",
                "decision_factor": "Value and usability",
                "purchase_trigger": research_objective,
                "description": f"Evaluates {product_name} against target requirements.",
            },
        ),
        "accessibility_needs": persona.get("accessibility_needs"),
        "environmental_awareness": persona.get("environmental_awareness"),
        "quote": _ensure_text(persona.get("quote"), f'"{product_name} should streamline my daily routine seamlessly."'),
        "sentiment_archetype": persona.get("sentiment_archetype") or sentiment_archetype,
    }


def _dynamic_fallback_personas(
    product_name: str,
    industry: str,
    product_description: str,
    target_audience: str,
    research_objective: str,
    persona_count: int,
    geography: str = "global",
) -> List[Dict[str, Any]]:
    """
    Synthesizes unique, non-hardcoded user personas tailored specifically to the given product brief.
    Biases toward Indian personas if geography=="india".
    """
    INDIAN_NAMES = [
        ("Aarav Sharma", "Male", "Bengaluru", "India"),
        ("Priya Nair", "Female", "Mumbai", "India"),
        ("Rohit Verma", "Male", "Delhi", "India"),
        ("Anjali Singh", "Female", "Pune", "India"),
        ("Karan Mehta", "Male", "Hyderabad", "India"),
        ("Sneha Reddy", "Female", "Chennai", "India"),
        ("Vivek Joshi", "Male", "Kolkata", "India"),
        ("Pooja Gupta", "Female", "Jaipur", "India"),
        ("Arjun Patel", "Male", "Ahmedabad", "India"),
        ("Kavitha Rao", "Female", "Bengaluru", "India"),
        ("Nikhil Sinha", "Male", "Noida", "India"),
        ("Divya Iyer", "Female", "Coimbatore", "India"),
        ("Siddharth Kapoor", "Male", "Gurgaon", "India"),
        ("Meera Krishnan", "Female", "Kochi", "India"),
        ("Aditya Kumar", "Male", "Lucknow", "India"),
    ]
    GLOBAL_NAMES = [
        ("Elena Rossi", "Female", "Milan", "Italy"),
        ("Marcus Vance", "Male", "Austin", "United States"),
        ("Yuki Tanaka", "Male", "Tokyo", "Japan"),
        ("Sofia Alvarez", "Female", "Madrid", "Spain"),
        ("Lucas Dubois", "Male", "Paris", "France"),
        ("Amina Hassan", "Female", "Dubai", "UAE"),
        ("Soren Lindqvist", "Male", "Stockholm", "Sweden"),
        ("Camila Silva", "Female", "São Paulo", "Brazil"),
        ("Chloe Zhang", "Female", "Singapore", "Singapore"),
        ("David Kim", "Male", "Seoul", "South Korea"),
    ]

    # If India-specific, use 70% Indian names
    if geography == "india":
        indian_count = max(1, int(persona_count * 0.7))
        global_count = persona_count - indian_count
        names_pool = (
            INDIAN_NAMES[:indian_count] +
            GLOBAL_NAMES[:global_count]
        )
    else:
        names_pool = (INDIAN_NAMES[:3] + GLOBAL_NAMES)[:persona_count]

    # Pad if needed
    while len(names_pool) < persona_count:
        names_pool += names_pool
    names_pool = names_pool[:persona_count]

    def _realistic_income(country: str, age: int, occupation: str) -> str:
        occ_lower = occupation.lower()
        country_lower = country.lower()
        if "india" in country_lower:
            if age < 25 or "junior" in occ_lower or "intern" in occ_lower:
                return "₹4-8 LPA"
            elif "senior" in occ_lower or "lead" in occ_lower or "manager" in occ_lower:
                return "₹18-35 LPA"
            elif "director" in occ_lower or "vp" in occ_lower or "founder" in occ_lower:
                return "₹40-80 LPA"
            else:
                return "₹10-20 LPA"
        elif "united states" in country_lower or "usa" in country_lower:
            if age < 25:
                return "$45,000-$65,000/yr"
            elif "senior" in occ_lower or "lead" in occ_lower:
                return "$120,000-$180,000/yr"
            else:
                return "$70,000-$110,000/yr"
        elif "united kingdom" in country_lower or "uk" in country_lower:
            return "£45,000-£75,000/yr" if age > 28 else "£28,000-£42,000/yr"
        elif any(c in country_lower for c in ["germany", "france", "sweden", "netherlands"]):
            return "€50,000-€80,000/yr" if age > 28 else "€30,000-€48,000/yr"
        else:
            return "$40,000-$70,000/yr"

    roles_pool = [
        f"{target_audience.split(',')[0].strip()} Lead",
        f"Senior {industry} Specialist",
        f"{industry} Product Manager",
        f"Operations Lead ({industry})",
        "Strategy & Growth Manager",
        f"{industry} Consultant",
        "Independent Practitioner",
        "Team Coordinator",
        f"Junior {target_audience.split(',')[0].strip()}",
        f"Freelance {industry} Expert",
    ]
    traits_pool = [
        ["Pragmatic", "Analytical", "Efficient"],
        ["Curious", "Exploratory", "Creative"],
        ["Methodical", "Cautious", "Detail-oriented"],
        ["Ambitious", "Fast-paced", "Decisive"],
        ["Collaborative", "Empathetic", "Adaptable"],
        ["Skeptical", "Critical", "Research-driven"],
    ]
    sentiments = ["champion", "pragmatist", "critic", "enthusiast", "skeptic", "mixed"]

    generated: List[Dict[str, Any]] = []
    for idx in range(persona_count):
        identity = names_pool[idx % len(names_pool)]
        name, gender, city, country = identity
        age = 23 + ((idx * 7) % 32)
        role = roles_pool[idx % len(roles_pool)]
        traits = traits_pool[idx % len(traits_pool)]
        income = _realistic_income(country, age, role)
        sentiment = sentiments[idx % len(sentiments)]

        raw_persona = {
            "name": name,
            "age": age,
            "gender": gender,
            "city": city,
            "country": country,
            "occupation": role,
            "education": "Bachelor's Degree" if age < 35 else "Master's Degree",
            "annual_income": income,
            "marital_status": "Single" if age < 30 else "Married",
            "persona_summary": f"{name} is a {age}-year-old {role} in {city}, seeking to use {product_name} to {research_objective.lower()}.",
            "lifestyle": "Active professional focused on efficiency and growth",
            "hobbies": ["Digital trends", "Fitness", "Travel", "Continuous learning"][(idx % 2):(idx % 2) + 2],
            "daily_routine": [
                f"Evaluates tools like {product_name} for workflow improvements",
                "Reviews goals and team priorities",
                "Seeks friction-free digital solutions",
            ],
            "technology_usage": "High" if idx % 2 == 0 else "Moderate",
            "digital_literacy": "Advanced" if age < 40 else "Confident",
            "fitness_level": "Moderate",
            "goals": [
                f"Achieve: {research_objective}",
                f"Get measurable value from {product_name}",
                "Remove friction from daily workflow",
            ],
            "motivations": ["Efficiency gains", "Clear ROI", "Seamless UX"],
            "pain_points": [
                f"Fragmented solutions in {industry}",
                "Unclear onboarding experience",
                "Time wasted on repetitive manual tasks",
            ],
            "frustrations": ["Unresponsive tools", "Poor customisation"],
            "preferred_features": ["Fast setup", "Clean UI", "Automated insights"],
            "budget": "Flexible" if age > 35 else "Moderate",
            "purchase_channel": "Direct Online",
            "purchase_frequency": "Monthly",
            "brand_loyalty": "Medium",
            "devices": ["MacBook", "iPhone"] if idx % 2 == 0 else ["Dell Laptop", "Android"],
            "operating_system": "macOS" if idx % 2 == 0 else "Windows",
            "ecosystem": "Apple" if idx % 2 == 0 else "Google",
            "favourite_apps": ["Notion", "Slack", "Figma", "Linear", "WhatsApp"][(idx % 3):(idx % 3) + 3],
            "personality": {
                "traits": traits,
                "communication_style": "Direct and structured",
                "decision_making": "Data-informed",
                "description": f"{name} values clarity and tools that reduce friction.",
            },
            "buying_behaviour": {
                "price_sensitivity": "Moderate",
                "decision_factor": "Value and usability",
                "purchase_trigger": research_objective,
                "description": f"Evaluates {product_name} for alignment with {target_audience} needs.",
            },
            "accessibility_needs": None,
            "environmental_awareness": "Moderate",
            "quote": f'"{product_name} should solve {product_description or industry} problems without adding more overhead."',
            "sentiment_archetype": sentiment,
        }

        normalized = _normalize_persona(
            raw_persona, idx, product_name, industry,
            product_description, target_audience, research_objective,
        )
        generated.append(normalized)

    return generated


def generate_personas(
    product_name: str | None = None,
    industry: str | None = None,
    product_description: str | None = None,
    target_audience: str | None = None,
    research_objective: str | None = None,
    persona_count: int = 10,
    product: str | None = None,
) -> List[Dict[str, Any]]:
    """
    Enhanced Persona Generation Pipeline:
    1. Runs ProductAnalysisAgent to infer rich product context.
    2. Invokes Gemini to generate diverse personas based on brief & product analysis.
    3. Runs PersonaValidator to deterministically validate persona payloads.
    4. Runs DiversityChecker to evaluate and audit batch diversity score.
    5. Dynamically synthesizes contextual personas if LLM calls rate limit or fail.
    """
    p_name = _ensure_text(product_name, product or "Untitled Product")
    ind = _ensure_text(industry, "General")
    desc = _ensure_text(product_description, product or "")
    aud = _ensure_text(target_audience, "General users")
    obj = _ensure_text(research_objective, "Product validation")
    count = _ensure_int(persona_count, 10)

    # Step 1: Product Context Analysis via ProductAnalysisAgent
    analysis_context = product_analysis_agent.analyze_product(
        product_name=p_name,
        industry=ind,
        product_description=desc,
        target_audience=aud,
        research_objective=obj,
        persona_count=count,
    )

    analysis_summary = (
        f"Product Category: {analysis_context.get('product_category', ind)}\n"
        f"Expected Segments: {', '.join(analysis_context.get('expected_user_segments', []))}\n"
        f"Behavioral Traits: {', '.join(analysis_context.get('behavioral_characteristics', []))}\n"
        f"Likely Motivations: {', '.join(analysis_context.get('likely_motivations', []))}\n"
        f"Likely Pain Points: {', '.join(analysis_context.get('likely_pain_points', []))}\n"
        f"Diversity Guidelines: {', '.join(analysis_context.get('persona_diversity_recommendations', []))}"
    )

    geography = _detect_geography(aud, desc, ind)
    india_instruction = ""
    income_instruction = ""
    if geography == "india":
        india_instruction = (
            "\n\nGEOGRAPHY DIRECTIVE: This product is India-focused. Generate AT LEAST 65% of personas "
            "as Indian users from cities like Bengaluru, Mumbai, Delhi, Hyderabad, Pune, Chennai, Kolkata, Jaipur, Ahmedabad, Noida, Gurgaon. "
            "Use authentic Indian names (both first and last names from Indian cultures). "
            "Include diverse Indian roles: startup founders, product managers, engineers, BBA/MBA graduates, "
            "government employees, teachers, small business owners, freelancers, college students."
        )
        income_instruction = (
            "\nINCOME FORMAT FOR INDIA: Use Indian salary format — e.g., '₹6 LPA', '₹12-18 LPA', '₹25 LPA', '₹45 LPA'. "
            "Freshers: ₹3-8 LPA. Mid-level: ₹10-25 LPA. Senior: ₹25-60 LPA. Directors/Founders: ₹60 LPA+."
        )
    else:
        income_instruction = (
            "\nINCOME FORMAT: Use realistic local currency — "
            "USA: $45K-$180K/yr. UK: £28K-£90K. Europe: €30K-€90K. India: ₹4-60 LPA. "
            "Match income to seniority and country realistically."
        )

    prompt = f"""You are an expert UX researcher and behavioral psychologist.

Generate {count} completely unique, realistic, and internally consistent user personas for the following product brief and expert analysis context.

Product Brief:
Product Name: {p_name}
Industry: {ind}
Product Description: {desc}
Target Audience: {aud}
Research Objective: {obj}

Expert Product Analysis Context:
{analysis_summary}
{india_instruction}
{income_instruction}

Rules:
- Return ONLY valid JSON, no markdown code blocks.
- Generate exactly {count} personas.
- Ground each persona in the product brief and analysis context.
- Each persona MUST have a unique name, city, occupation, age, and background.
- Vary age (18-65), seniority level, city, gender, education, and product needs realistically.
- Include a mix of sentiment_archetype: use this rotation: champion, pragmatist, critic, enthusiast, skeptic, mixed.
- NEVER use placeholder values like 'Varies', 'Unknown', 'N/A', or generic filler.
- Income MUST be specific, realistic, in local currency format (not just 'Moderate').
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
      "sentiment_archetype": "",
      "quote": ""
    }}
  ]
}}"""

    generated_personas: List[Dict[str, Any]] = []

    for attempt in range(2):
        for model_name in PERSONA_GEMINI_MODELS:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                )
                raw_personas = _extract_persona_payload(_parse_json(getattr(response, "text", "")))
                normalized = [
                    _normalize_persona(
                        persona,
                        index,
                        p_name,
                        ind,
                        desc,
                        aud,
                        obj,
                    )
                    for index, persona in enumerate(raw_personas[:count])
                ]

                if normalized:
                    generated_personas = normalized
                    break
            except Exception as e:
                print(f"Model {model_name} attempt {attempt} notice: {e}")
                continue

        if generated_personas:
            break

        if attempt < 1:
            time.sleep(1)

    if not generated_personas:
        print(f"Synthesizing dynamic custom personas for '{p_name}' ({ind}).")
        generated_personas = _dynamic_fallback_personas(
            p_name, ind, desc, aud, obj, count, geography,
        )

    # Step 3: Validate generated personas using PersonaValidator
    validation_report = persona_validator.validate_personas(generated_personas)
    if not validation_report["valid"]:
        print(f"Persona Validation Notice: {len(validation_report['errors'])} schema warnings detected.")

    # Step 4: Evaluate persona set diversity using DiversityChecker
    diversity_report = diversity_checker.evaluate_diversity(generated_personas)
    print(f"Persona Batch Diversity Score: {diversity_report['diversity_score']}/100. Warnings: {diversity_report['warnings']}")

    return generated_personas
