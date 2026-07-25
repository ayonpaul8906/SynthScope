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


def create_personas(db: Session, personas: list[PersonaCreate]) -> list[Persona]:
    """
    Create and save multiple personas to the database.
    """

    db_personas = [Persona(**persona.model_dump()) for persona in personas]

    db.add_all(db_personas)
    db.commit()

    for db_persona in db_personas:
        db.refresh(db_persona)

    return db_personas


def get_all_personas(db: Session) -> list[Persona]:
    """
    Fetch all personas stored in the database.
    """

    return db.query(Persona).all()