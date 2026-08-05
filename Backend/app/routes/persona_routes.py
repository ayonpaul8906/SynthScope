from fastapi import APIRouter, BackgroundTasks, Depends, Header, HTTPException
from typing import List, Optional
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.schemas.persona import (
    ProductRequest,
    PersonaResponse
)

from ..services.persona_generation_service import generate_personas
from ..services.persona_service import get_all_personas, save_generated_personas
from app.services.question_service import generate_survey_questions
from app.repositories.survey_repository import create_survey_questions
from app.repositories.product_brief_repository import save_product_brief
from app.services.survey_service import answer_stored_question_for_all_personas

router = APIRouter(
    prefix="/personas",
    tags=["Personas"]
)


def _generate_responses_in_background(db: Session, stored_questions: list, user_id: Optional[str] = None) -> None:
    """Background task: generate and persist survey responses for each question scoped by user_id."""
    for q_rec in stored_questions:
        try:
            answer_stored_question_for_all_personas(db, q_rec.id, user_id=user_id)
        except Exception as run_err:
            print(f"[BG] Error answering survey question {q_rec.id}: {run_err}")


@router.get(
    "",
    response_model=List[PersonaResponse]
)
def list_personas_route(
    db: Session = Depends(get_db),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id")
):
    """Return all personas currently stored in the database for this specific user."""
    return get_all_personas(db, user_id=x_user_id)


@router.post(
    "/generate",
    response_model=List[PersonaResponse]
)
def generate_persona_route(
    request: ProductRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id")
):
    """
    Generate personas using Gemini AI, save them to PostgreSQL scoped to the user,
    persist the product brief for survey context reuse,
    generate survey questions synchronously,
    then dispatch response generation as a background task.
    Returns immediately after questions are stored.
    """

    personas = generate_personas(**request.model_dump())

    if not personas:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate personas."
        )

    saved_personas = save_generated_personas(db, personas, user_id=x_user_id)

    # Resolve product brief fields
    p_name = request.product_name or request.product or "Untitled Product"
    ind = request.industry or "General"
    desc = request.product_description or ""
    aud = request.target_audience or "General users"
    obj = request.research_objective or "Product validation"
    count = request.persona_count or len(saved_personas)

    # Persist the product brief to the database for survey reuse scoped by user
    try:
        save_product_brief(
            db=db,
            product_name=p_name,
            industry=ind,
            product_description=desc,
            target_audience=aud,
            research_objective=obj,
            persona_count=count,
            user_id=x_user_id,
        )
    except Exception as brief_err:
        print(f"Error saving product brief: {brief_err}")

    # Generate survey questions synchronously (fast)
    stored_questions = []
    try:
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
                user_id=x_user_id,
            )
    except Exception as q_err:
        print(f"Error generating survey questions: {q_err}")

    # Dispatch response generation as a background task so the API returns fast
    if stored_questions:
        background_tasks.add_task(
            _generate_responses_in_background,
            db,
            stored_questions,
            x_user_id,
        )

    return saved_personas