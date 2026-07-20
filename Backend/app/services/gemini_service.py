import os
import json
import time

from dotenv import load_dotenv
from google import genai

# Load environment variables
load_dotenv()

# Create Gemini Client
client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def generate_persona(product: str):

    prompt = f"""
You are an expert UX researcher and behavioral psychologist.

Generate ONE completely unique, realistic, and internally consistent user persona for the following product.

Product:
{product}

Rules:
- Return ONLY valid JSON.
- Do NOT use markdown.
- Do NOT explain anything.
- Generate a completely different person every time.
- Use lowercase JSON keys.
- Make every value realistic.
- Keep the persona internally consistent.
- Use Indian names only if the location is India.
- Budget must be one of: Low, Medium, High, Premium.
- Technology usage must be one of: Low, Moderate, High, Power User.
- Purchase frequency must be one of: Daily, Weekly, Monthly, Occasionally, Rarely.
- Brand loyalty must be one of: Low, Medium, High.
- Digital literacy must be one of: Beginner, Intermediate, Advanced, Expert.
- Communication style must be one of: Friendly, Formal, Concise, Detailed.
- Decision making must be one of:
  Impulsive,
  Emotional,
  Research-driven,
  Analytical,
  Recommendation-driven.

Return JSON in the following format:

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
"""

    # Retry up to 3 times if server is busy
    for attempt in range(3):

        try:

            response = client.models.generate_content(
                model="models/gemini-3.5-flash",
                contents=prompt
            )

            persona = json.loads(response.text)

            return persona

        except json.JSONDecodeError:

            print("❌ Gemini returned invalid JSON.")

            return None

        except Exception as e:

            print(f"Attempt {attempt + 1} failed.")

            print(e)

            if attempt < 2:

                print("Retrying in 2 seconds...\n")

                time.sleep(2)

            else:

                print("Failed after 3 attempts.")

                return None