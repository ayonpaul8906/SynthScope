from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.schemas.persona import (
    ProductRequest,
    PersonaResponse
)

from app.services.gemini_service import generate_persona
from app.services.persona_service import save_generated_persona

router = APIRouter(
    prefix="/personas",
    tags=["Personas"]
)


@router.post(
    "/generate",
    response_model=PersonaResponse
)
def generate_persona_route(
    request: ProductRequest,
    db: Session = Depends(get_db)
):
    """
    Generate a persona using Gemini,
    save it into PostgreSQL,
    and return the saved persona.
    """

    persona = generate_persona(request.product)

    if persona is None:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate persona."
        )

    saved_persona = save_generated_persona(
        db,
        persona
    )

    return saved_persona