import os
import json
import re
import time

from dotenv import load_dotenv
from google import genai

from app.schemas.survey import GeneratedQuestion, QuestionGenerateResponse

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

QUESTION_GEMINI_MODELS = [
    m.strip() for m in os.getenv(
        "SURVEY_GEMINI_MODELS",
        "models/gemini-3.5-flash,models/gemini-2.5-flash,models/gemini-1.5-flash"
    ).split(",") if m.strip()
]


def _parse_json(text: str) -> dict:
    if not text:
        raise json.JSONDecodeError("Empty response", "", 0)
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
        return json.loads(text[start:end + 1])
    raise json.JSONDecodeError("No JSON found", text, 0)


def generate_survey_questions(
    product_name: str,
    industry: str,
    product_description: str,
    target_audience: str,
    research_objective: str,
    question_count: int = 5
) -> QuestionGenerateResponse:
    prompt = f"""You are an expert UX researcher and survey designer.

Generate exactly {question_count} unique, insightful survey questions for the following product brief.

Product Name: {product_name}
Industry: {industry}
Product Description: {product_description}
Target Audience: {target_audience}
Research Objective: {research_objective}

Rules:
- Generate exactly {question_count} questions, no more, no less.
- KEEP QUESTIONS SHORT AND CONCISE (maximum 8 to 12 words per question). Avoid long preambles or compound sentences.
- Mix question types: open_ended, multiple_choice, rating, yes_no
- Questions must be specific to the product brief above.
- Avoid generic questions. Be concrete, direct, and actionable.
- Return ONLY valid JSON, no markdown.

Return JSON in this exact format:
{{
  "questions": [
    {{
      "question": "your question text here",
      "question_type": "open_ended"
    }}
  ]
}}"""

    for attempt in range(3):
        for model_name in QUESTION_GEMINI_MODELS:
            try:
                result = client.models.generate_content(
                    model=model_name,
                    contents=prompt
                )
                data = _parse_json(getattr(result, "text", ""))

                questions_raw = data.get("questions", [])
                if not isinstance(questions_raw, list):
                    questions_raw = []

                questions = []
                for q in questions_raw:
                    questions.append(GeneratedQuestion(
                        question=q.get("question", ""),
                        product_category=industry,
                        question_type=q.get("question_type", "open_ended"),
                    ))

                if not questions:
                    continue

                questions = questions[:question_count]

                return QuestionGenerateResponse(
                    product_name=product_name,
                    industry=industry,
                    product_description=product_description,
                    target_audience=target_audience,
                    research_objective=research_objective,
                    questions=questions,
                )
            except Exception:
                continue

        if attempt < 2:
            time.sleep(2)

    fallback = [
        GeneratedQuestion(
            question=f"How often would you use this product in a typical week?",
            product_category=industry,
            question_type="multiple_choice",
        ),
        GeneratedQuestion(
            question=f"What is the biggest problem you want this product to solve?",
            product_category=industry,
            question_type="open_ended",
        ),
        GeneratedQuestion(
            question=f"How likely are you to recommend this product to someone like you?",
            product_category=industry,
            question_type="rating",
        ),
        GeneratedQuestion(
            question=f"Which feature would matter most to you in this product?",
            product_category=industry,
            question_type="multiple_choice",
        ),
        GeneratedQuestion(
            question=f"What would make you stop using this product?",
            product_category=industry,
            question_type="open_ended",
        ),
    ]
    return QuestionGenerateResponse(
        product_name=product_name,
        industry=industry,
        product_description=product_description,
        target_audience=target_audience,
        research_objective=research_objective,
        questions=fallback[:question_count],
    )
