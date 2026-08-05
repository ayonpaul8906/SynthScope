import os
import json
import re
from typing import Any, Dict, List

from dotenv import load_dotenv
from google import genai

load_dotenv()

ANALYSIS_GEMINI_MODELS = [
    model.strip()
    for model in os.getenv(
        "PERSONA_GEMINI_MODELS",
        "models/gemini-3.5-flash,models/gemini-3.5-flash-lite",
    ).split(",")
    if model.strip()
]


class ProductAnalysisAgent:
    """
    AI Agent responsible for deep product context analysis before persona synthesis.
    Infers user segments, behavioral characteristics, motivations, pain points,
    demographic distributions, and diversity guidelines.
    """

    def __init__(self, client: genai.Client | None = None) -> None:
        if client is not None:
            self.client = client
        else:
            api_key = os.getenv("GEMINI_API_KEY")
            self.client = genai.Client(api_key=api_key) if api_key else None

    def _parse_json(self, text: str) -> Dict[str, Any]:
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

        raise json.JSONDecodeError("No JSON found", text, 0)

    def _get_fallback_analysis(
        self,
        product_name: str,
        industry: str,
        target_audience: str,
        research_objective: str,
    ) -> Dict[str, Any]:
        return {
            "product_category": industry or "General Technology",
            "expected_user_segments": [
                f"Primary {target_audience} Users",
                "Secondary Stakeholders & Managers",
                "Early Adopters & Power Users",
            ],
            "behavioral_characteristics": [
                "Efficiency-focused workflow orientation",
                "Data-driven decision making",
                "High reliance on digital collaboration tools",
            ],
            "likely_motivations": [
                f"Achieve research goal: {research_objective}",
                "Streamline daily tasks and eliminate friction",
                "Improve team output quality and speed",
            ],
            "likely_pain_points": [
                "Complex onboarding processes",
                "Fragmented software tools",
                "Lack of integration and actionable insights",
            ],
            "demographic_distribution": {
                "age_ranges": ["22-32 (40%)", "33-45 (45%)", "46+ (15%)"],
                "gender_balance": "Balanced representation across genders",
                "key_geographies": ["North America", "Europe", "Asia-Pacific"],
            },
            "persona_diversity_recommendations": [
                "Ensure representation across junior, mid-level, and executive roles.",
                "Include tech-savvy early adopters alongside risk-averse pragmatic users.",
                "Vary team sizes and organizational constraints across personas.",
            ],
        }

    def analyze_product(
        self,
        product_name: str,
        industry: str,
        product_description: str,
        target_audience: str,
        research_objective: str,
        persona_count: int = 10,
    ) -> Dict[str, Any]:
        """
        Analyzes product brief inputs using Gemini to infer richer contextual details
        that guide persona generation.
        """
        if not self.client:
            return self._get_fallback_analysis(
                product_name, industry, target_audience, research_objective
            )

        prompt = f"""You are a senior UX Researcher and Product Strategy Director.

Analyze the following product brief and provide a rich behavioral and contextual breakdown to guide synthetic user persona generation.

Product Brief:
Product Name: {product_name}
Industry: {industry}
Product Description: {product_description}
Target Audience: {target_audience}
Research Objective: {research_objective}
Target Persona Count: {persona_count}

Rules:
- Return ONLY valid JSON, no markdown code blocks.
- Be concrete, professional, and specific to the given product.
- Return JSON matching this exact structure:
{{
  "product_category": "",
  "expected_user_segments": ["segment 1", "segment 2", "segment 3"],
  "behavioral_characteristics": ["characteristic 1", "characteristic 2"],
  "likely_motivations": ["motivation 1", "motivation 2"],
  "likely_pain_points": ["pain point 1", "pain point 2"],
  "demographic_distribution": {{
    "age_ranges": ["range 1", "range 2"],
    "gender_balance": "",
    "key_geographies": ["geo 1", "geo 2"]
  }},
  "persona_diversity_recommendations": ["recommendation 1", "recommendation 2"]
}}"""

        for model_name in ANALYSIS_GEMINI_MODELS:
            try:
                response = self.client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                )
                parsed = self._parse_json(getattr(response, "text", ""))
                if isinstance(parsed, dict) and "product_category" in parsed:
                    return parsed
            except Exception:
                continue

        return self._get_fallback_analysis(
            product_name, industry, target_audience, research_objective
        )
