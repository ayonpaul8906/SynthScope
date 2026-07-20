from sqlalchemy.orm import Session

from app.repositories.persona_repository import create_persona
from app.schemas.persona import PersonaCreate


def save_generated_persona(
    db: Session,
    persona_data: dict
):
    """
    Convert Gemini JSON into a validated schema
    and save it into PostgreSQL.
    """

    persona = PersonaCreate(**persona_data)

    return create_persona(db, persona)