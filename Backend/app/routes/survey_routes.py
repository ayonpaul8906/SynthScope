from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.repositories.survey_repository import (
    get_survey_question,
    get_survey_responses_for_question,
    list_survey_questions,
    create_survey_questions,
)
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


@router.get("/categories", response_model=ProductCategoriesResponse)
def list_product_categories():
    return ProductCategoriesResponse(categories=PRODUCT_CATEGORIES)


def _generate_and_store_questions(request: QuestionGenerateRequest, db: Session):
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
    )


@router.post("/generate-questions", response_model=list[StoredSurveyQuestion])
def generate_questions(request: QuestionGenerateRequest, db: Session = Depends(get_db)):
    return _generate_and_store_questions(request, db)


@router.post("/auto", response_model=list[StoredSurveyQuestion])
def auto_survey(request: AutoSurveyRequest, db: Session = Depends(get_db)):
    return _generate_and_store_questions(request, db)


@router.get("/questions", response_model=list[StoredSurveyQuestion])
def get_questions(db: Session = Depends(get_db)):
    return list_survey_questions(db)


@router.post("/run-all", response_model=list[StoredPersonaSurveyResponse])
def run_all_surveys(db: Session = Depends(get_db)):
    """
    Run survey across all stored questions in the database for all personas.
    If no questions exist, generate initial questions first.
    """
    questions = list_survey_questions(db)
    if not questions:
        # Generate initial questions if none exist
        req = QuestionGenerateRequest(
            product_name="SynthScope Product",
            industry="Technology",
            product_description="Synthetic User Generation & Testing Platform",
            target_audience="Product Managers & Researchers",
            research_objective="Evaluate platform utility and pricing sensitivity",
            question_count=4,
        )
        questions = _generate_and_store_questions(req, db)

    all_responses = []
    for q in questions:
        try:
            resps = answer_stored_question_for_all_personas(db, q.id)
            all_responses.extend(resps)
        except Exception as e:
            print(f"Error answering survey question {q.id}: {e}")

    return all_responses


@router.post("/questions/add-custom", response_model=CustomQuestionResponse)
def add_custom_question(
    request: AddCustomQuestionRequest,
    db: Session = Depends(get_db),
):
    """
    Add a new custom question to the database, run the survey across all personas,
    persist responses, and return the question with stored responses.
    """
    p_name = request.product_name or "SynthScope Product"
    ind = request.industry or "Technology"
    desc = request.product_description or "AI product validation platform"
    aud = request.target_audience or "General users"
    obj = request.research_objective or "User feedback"

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
    )

    if not created_questions:
        raise HTTPException(status_code=500, detail="Failed to create custom question.")

    question_rec = created_questions[0]
    responses = answer_stored_question_for_all_personas(db, question_rec.id)

    return CustomQuestionResponse(
        question=question_rec,
        responses=responses
    )


@router.post("/questions/{question_id}/survey", response_model=list[StoredPersonaSurveyResponse])
def survey_question(
    question_id: UUID,
    db: Session = Depends(get_db),
):
    question = get_survey_question(db, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    try:
        return answer_stored_question_for_all_personas(db, question_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.get("/questions/{question_id}/responses", response_model=list[StoredPersonaSurveyResponse])
def get_question_responses(
    question_id: UUID,
    db: Session = Depends(get_db),
):
    question = get_survey_question(db, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    return get_survey_responses_for_question(db, question_id)

