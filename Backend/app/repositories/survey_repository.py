from uuid import UUID

from sqlalchemy.orm import Session

from app.models.survey import PersonaSurveyResponseRecord, SurveyQuestionRecord


def create_survey_questions(
    db: Session,
    product_name: str,
    industry: str,
    product_description: str,
    target_audience: str,
    research_objective: str,
    generated_questions,
) -> list[SurveyQuestionRecord]:
    records: list[SurveyQuestionRecord] = []

    for index, generated_question in enumerate(generated_questions, start=1):
        records.append(
            SurveyQuestionRecord(
                product_name=product_name,
                industry=industry,
                product_description=product_description,
                target_audience=target_audience,
                research_objective=research_objective,
                question_text=getattr(generated_question, "question", ""),
                question_type=getattr(generated_question, "question_type", "open_ended"),
                question_order=index,
            )
        )

    db.add_all(records)
    db.commit()

    for record in records:
        db.refresh(record)

    return records


def list_survey_questions(db: Session) -> list[SurveyQuestionRecord]:
    return db.query(SurveyQuestionRecord).order_by(SurveyQuestionRecord.created_at.asc()).all()


def get_survey_question(db: Session, question_id: UUID) -> SurveyQuestionRecord | None:
    return db.query(SurveyQuestionRecord).filter(SurveyQuestionRecord.id == question_id).first()


def get_survey_responses_for_question(
    db: Session,
    question_id: UUID,
) -> list[PersonaSurveyResponseRecord]:
    return (
        db.query(PersonaSurveyResponseRecord)
        .filter(PersonaSurveyResponseRecord.question_id == question_id)
        .order_by(PersonaSurveyResponseRecord.created_at.asc())
        .all()
    )


def create_survey_responses(
    db: Session,
    question_id: UUID,
    persona_responses,
) -> list[PersonaSurveyResponseRecord]:
    records: list[PersonaSurveyResponseRecord] = []

    for persona_response in persona_responses:
        records.append(
            PersonaSurveyResponseRecord(
                question_id=question_id,
                persona_id=persona_response.persona_id,
                response_text=persona_response.response,
                sentiment=persona_response.sentiment,
            )
        )

    db.add_all(records)
    db.commit()

    for record in records:
        db.refresh(record)

    return records