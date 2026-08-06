from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.persona import Persona
from app.repositories.interview_repository import (
    delete_conversation_history,
    get_all_user_messages_grouped,
    get_messages_for_persona,
    match_hardcoded_question,
    save_interview_message,
)
from app.repositories.product_brief_repository import get_latest_product_brief
from app.schemas.interview import (
    InterviewChatRequest,
    InterviewChatResponse,
    InterviewQuestionDTO,
    InterviewThreadsResponse,
)
from app.services.interview_service import (
    generate_db_hardcoded_reply,
    generate_interview_reply,
    get_personalized_questions_for_persona,
)

router = APIRouter(
    prefix="/interview",
    tags=["Interview"]
)


@router.get("/questions", response_model=List[InterviewQuestionDTO])
def list_questions(
    persona_id: Optional[UUID] = Query(None, description="ID of persona for dynamic question rendering"),
    db: Session = Depends(get_db),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
):
    """
    Returns basic hardcoded probing questions directly from the database,
    personalized using the selected persona's occupation and product brief details.
    """
    persona = None
    if persona_id:
        persona = db.query(Persona).filter(Persona.id == persona_id).first()
        if persona and x_user_id and persona.user_id not in (None, x_user_id):
            persona = None  # Prevent leaking other users' persona details

    rendered = get_personalized_questions_for_persona(db, persona=persona, user_id=x_user_id)
    return rendered


@router.get("/conversations", response_model=InterviewThreadsResponse)
def get_user_conversations(
    db: Session = Depends(get_db),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
):
    """
    Retrieves all interview conversation history scoped to the calling user,
    grouped by persona_id so chats stay persisted across page reloads or logins.
    """
    grouped = get_all_user_messages_grouped(db, user_id=x_user_id)
    return InterviewThreadsResponse(threads=grouped)


@router.delete("/history/{persona_id}")
def clear_conversation_memory(
    persona_id: UUID,
    db: Session = Depends(get_db),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
):
    """
    Clears persisted conversation history for a specific persona under the calling user.
    """
    count = delete_conversation_history(db, persona_id=persona_id, user_id=x_user_id)
    return {"success": True, "deleted_turns": count}


@router.post("/chat", response_model=InterviewChatResponse)
def interview_chat(
    request: InterviewChatRequest,
    db: Session = Depends(get_db),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
):
    """
    Interview Mode: Evaluates incoming messages against hardcoded DB probing questions.
    If matched, generates an immediate answer from database records without invoking LLM.
    If custom, generates an LLM answer fully enriched with persona and product brief memory.
    All turns are persisted in PostgreSQL scoped to the user_id.
    """
    persona = db.query(Persona).filter(Persona.id == request.persona_id).first()
    if not persona:
        raise HTTPException(status_code=404, detail="Persona not found")

    if x_user_id and persona.user_id not in (None, x_user_id):
        raise HTTPException(status_code=404, detail="Persona not found")

    # 1. Fetch user's active product research brief for context personalization
    brief = get_latest_product_brief(db, user_id=x_user_id)

    # 2. Persist incoming user question in database memory
    save_interview_message(
        db=db,
        persona_id=persona.id,
        role="user",
        text=request.message,
        source="user",
        user_id=x_user_id,
    )

    # 3. Check if this is a basic hardcoded probing question (typed or clicked)
    matched_key = match_hardcoded_question(db, request.message)

    if matched_key:
        # DB Hardcoded mode: Return answer directly from DB profile without calling LLM
        reply = generate_db_hardcoded_reply(persona=persona, question_key=matched_key, brief=brief)
        source = "db"
    else:
        # Generative LLM mode: Retrieve true server memory from DB and synthesize response
        db_messages = get_messages_for_persona(db, persona.id, user_id=x_user_id)
        # We pass previous messages excluding the one we just saved above as the history context
        prior_history = db_messages[:-1] if len(db_messages) > 1 else []
        reply = generate_interview_reply(
            persona=persona,
            message=request.message,
            history=prior_history,
            brief=brief,
        )
        source = "llm"

    # 4. Persist AI response in database memory
    save_interview_message(
        db=db,
        persona_id=persona.id,
        role="assistant",
        text=reply,
        source=source,
        user_id=x_user_id,
    )

    return InterviewChatResponse(
        persona_id=persona.id,
        persona_name=persona.name,
        reply=reply,
        source=source,
    )
