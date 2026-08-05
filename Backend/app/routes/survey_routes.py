from typing import Optional
from uuid import UUID
from fastapi import APIRouter, BackgroundTasks, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.repositories.survey_repository import (
    get_survey_question,
    get_survey_responses_for_question,
    list_survey_questions,
    create_survey_questions,
)
from app.repositories.product_brief_repository import get_latest_product_brief
from app.schemas.survey import (
    QuestionGenerateRequest,
    QuestionGenerateResponse,
    AutoSurveyRequest,
    AutoSurveyResponse,
    StoredSurveyQuestion,
    StoredPersonaSurveyResponse,
    PRODUCT_CATEGORIES,
    ProductCategoriesResponse,
    AddCustomQuestionRequest,
    CustomQuestionResponse,
    GeneratedQuestion,
)
from app.services.question_service import generate_survey_questions
from app.services.survey_service import (
    answer_stored_question_for_all_personas,
)

router = APIRouter(
    prefix="/survey",
    tags=["Survey"]
)


def _get_brief_defaults(db: Session, user_id: Optional[str] = None) -> dict:
    """Retrieve product brief context from DB for this user, or return safe generic defaults."""
    brief = get_latest_product_brief(db, user_id=user_id)
    if brief:
        return {
            "product_name": brief.product_name,
            "industry": brief.industry,
            "product_description": brief.product_description,
            "target_audience": brief.target_audience,
            "research_objective": brief.research_objective,
        }
    return {
        "product_name": "SynthScope Product",
        "industry": "Technology",
        "product_description": "Synthetic User Generation & Testing Platform",
        "target_audience": "Product Managers & Researchers",
        "research_objective": "Evaluate platform utility and pricing sensitivity",
    }


@router.get("/categories", response_model=ProductCategoriesResponse)
def list_product_categories():
    return ProductCategoriesResponse(categories=PRODUCT_CATEGORIES)


def _generate_and_store_questions(request: QuestionGenerateRequest, db: Session, user_id: Optional[str] = None):
    generated = generate_survey_questions(
        product_name=request.product_name,
        industry=request.industry,
        product_description=request.product_description,
        target_audience=request.target_audience,
        research_objective=request.research_objective,
        question_count=request.question_count,
    )

    return create_survey_questions(
        db=db,
        product_name=request.product_name,
        industry=request.industry,
        product_description=request.product_description,
        target_audience=request.target_audience,
        research_objective=request.research_objective,
        generated_questions=generated.questions,
        user_id=user_id,
    )


@router.post("/generate-questions", response_model=list[StoredSurveyQuestion])
def generate_questions(
    request: QuestionGenerateRequest,
    db: Session = Depends(get_db),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
):
    return _generate_and_store_questions(request, db, user_id=x_user_id)


@router.post("/auto", response_model=list[StoredSurveyQuestion])
def auto_survey(
    request: AutoSurveyRequest,
    db: Session = Depends(get_db),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
):
    return _generate_and_store_questions(request, db, user_id=x_user_id)


@router.get("/questions", response_model=list[StoredSurveyQuestion])
def get_questions(
    db: Session = Depends(get_db),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
):
    return list_survey_questions(db, user_id=x_user_id)


@router.post("/run-all", response_model=list[StoredPersonaSurveyResponse])
def run_all_surveys(
    db: Session = Depends(get_db),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
):
    """
    Run survey across all stored questions for all personas belonging to this user.
    """
    questions = list_survey_questions(db, user_id=x_user_id)
    if not questions:
        defaults = _get_brief_defaults(db, user_id=x_user_id)
        req = QuestionGenerateRequest(
            **defaults,
            question_count=4,
        )
        questions = _generate_and_store_questions(req, db, user_id=x_user_id)

    all_responses = []
    for q in questions:
        try:
            resps = answer_stored_question_for_all_personas(db, q.id, user_id=x_user_id)
            all_responses.extend(resps)
        except Exception as e:
            print(f"Error answering survey question {q.id}: {e}")

    return all_responses


@router.post("/run-pipeline", response_model=list[StoredSurveyQuestion])
def run_survey_pipeline(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
):
    """
    Pipeline-style survey run scoped by user_id:
    1. Generates and returns questions immediately (fast).
    2. Dispatches response generation as a background task.
    """
    questions = list_survey_questions(db, user_id=x_user_id)

    # If no questions yet, generate them from the stored product brief for this user
    if not questions:
        defaults = _get_brief_defaults(db, user_id=x_user_id)
        req = QuestionGenerateRequest(
            **defaults,
            question_count=4,
        )
        questions = _generate_and_store_questions(req, db, user_id=x_user_id)

    def _run_responses_background():
        for q in questions:
            try:
                existing = get_survey_responses_for_question(db, q.id, user_id=x_user_id)
                if not existing:
                    answer_stored_question_for_all_personas(db, q.id, user_id=x_user_id)
            except Exception as e:
                print(f"[pipeline] Error answering question {q.id}: {e}")

    background_tasks.add_task(_run_responses_background)
    return questions


@router.post("/questions/add-custom", response_model=CustomQuestionResponse)
def add_custom_question(
    request: AddCustomQuestionRequest,
    db: Session = Depends(get_db),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
):
    defaults = _get_brief_defaults(db, user_id=x_user_id)

    p_name = request.product_name if (request.product_name and request.product_name != "SynthScope Product") else defaults["product_name"]
    ind = request.industry if (request.industry and request.industry != "Technology") else defaults["industry"]
    desc = request.product_description if (request.product_description and request.product_description != "AI product validation") else defaults["product_description"]
    aud = request.target_audience if (request.target_audience and request.target_audience != "General users") else defaults["target_audience"]
    obj = request.research_objective if (request.research_objective and request.research_objective != "User feedback") else defaults["research_objective"]

    gen_q = GeneratedQuestion(
        question=request.question_text,
        product_category=ind,
        question_type="open_ended"
    )

    created_questions = create_survey_questions(
        db=db,
        product_name=p_name,
        industry=ind,
        product_description=desc,
        target_audience=aud,
        research_objective=obj,
        generated_questions=[gen_q],
        user_id=x_user_id,
    )

    if not created_questions:
        raise HTTPException(status_code=500, detail="Failed to create custom question.")

    question_rec = created_questions[0]
    responses = answer_stored_question_for_all_personas(db, question_rec.id, user_id=x_user_id)

    return CustomQuestionResponse(
        question=question_rec,
        responses=responses
    )


@router.post("/questions/{question_id}/survey", response_model=list[StoredPersonaSurveyResponse])
def survey_question(
    question_id: UUID,
    db: Session = Depends(get_db),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
):
    question = get_survey_question(db, question_id, user_id=x_user_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    try:
        return answer_stored_question_for_all_personas(db, question_id, user_id=x_user_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.get("/questions/{question_id}/responses", response_model=list[StoredPersonaSurveyResponse])
def get_question_responses(
    question_id: UUID,
    db: Session = Depends(get_db),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
):
    question = get_survey_question(db, question_id, user_id=x_user_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    return get_survey_responses_for_question(db, question_id, user_id=x_user_id)
