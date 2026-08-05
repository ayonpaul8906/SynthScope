from typing import Optional
from sqlalchemy.orm import Session

from app.models.persona import Persona
from app.schemas.persona import PersonaCreate


def create_persona(db: Session, persona: PersonaCreate, user_id: Optional[str] = None) -> Persona:
    """
    Create and save a new persona to the database scoped by user_id.
    """
    data = persona.model_dump()
    data["user_id"] = user_id
    db_persona = Persona(**data)

    db.add(db_persona)
    db.commit()
    db.refresh(db_persona)

    return db_persona


def create_personas(db: Session, personas: list[PersonaCreate], user_id: Optional[str] = None) -> list[Persona]:
    """
    Create and save multiple personas to the database scoped by user_id.
    """
    db_personas = []
    for persona in personas:
        data = persona.model_dump()
        data["user_id"] = user_id
        db_personas.append(Persona(**data))

    db.add_all(db_personas)
    db.commit()

    for db_persona in db_personas:
        db.refresh(db_persona)

    return db_personas


def get_all_personas(db: Session, user_id: Optional[str] = None) -> list[Persona]:
    """
    Fetch all personas stored in the database scoped by user_id.
    """
    query = db.query(Persona)
    if user_id:
        query = query.filter(Persona.user_id == user_id)
    else:
        # For legacy rows or non-auth requests, return rows with None user_id
        query = query.filter(Persona.user_id == None)
    return query.order_by(Persona.created_at.desc()).all()