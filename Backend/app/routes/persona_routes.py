from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.schemas.persona import (
    ProductRequest,
    PersonaResponse
)

from ..services.gemini_service import generate_personas
from ..services.persona_service import get_all_personas, save_generated_personas
from app.services.question_service import generate_survey_questions
from app.repositories.survey_repository import create_survey_questions
from app.services.survey_service import answer_stored_question_for_all_personas

router = APIRouter(
    prefix="/personas",
    tags=["Personas"]
)


@router.get(
    "",
    response_model=List[PersonaResponse]
)
def list_personas_route(
    db: Session = Depends(get_db)
):
    """
    Return all personas currently stored in the database.
    """

    return get_all_personas(db)


@router.post(
    "/generate",
    response_model=List[PersonaResponse]
)
def generate_persona_route(
    request: ProductRequest,
    db: Session = Depends(get_db)
):
    """
    Generate personas using Gemini,
    save them into PostgreSQL,
    generate initial survey questions & responses,
    and return the saved personas.
    """

    personas = generate_personas(**request.model_dump())

    if not personas:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate personas."
        )

    saved_personas = save_generated_personas(
        db,
        personas
    )

    # Automatically generate 4 survey questions & responses for these personas
    try:
        p_name = request.product_name or request.product or "SynthScope Product"
        ind = request.industry or "Technology"
        desc = request.product_description or "AI product validation platform"
        aud = request.target_audience or "Product Teams"
        obj = request.research_objective or "Product user satisfaction and feature validation"

        generated_q = generate_survey_questions(
            product_name=p_name,
            industry=ind,
            product_description=desc,
            target_audience=aud,
            research_objective=obj,
            question_count=4,
        )

        if generated_q and getattr(generated_q, "questions", None):
            stored_questions = create_survey_questions(
                db=db,
                product_name=p_name,
                industry=ind,
                product_description=desc,
                target_audience=aud,
                research_objective=obj,
                generated_questions=generated_q.questions,
            )
            for q_rec in stored_questions:
                try:
                    answer_stored_question_for_all_personas(db, q_rec.id)
                except Exception as run_err:
                    print(f"Error answering survey question {q_rec.id}: {run_err}")
    except Exception as e:
        print(f"Error generating initial survey questions: {e}")

    return saved_personas