from sqlalchemy.orm import Session

from app.models.persona import Persona
from app.schemas.persona import PersonaCreate


def create_persona(db: Session, persona: PersonaCreate) -> Persona:
    """
    Create and save a new persona to the database.
    """

    db_persona = Persona(**persona.model_dump())

    db.add(db_persona)
    db.commit()
    db.refresh(db_persona)

    return db_persona