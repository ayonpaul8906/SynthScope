from typing import Dict, List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.interview import InterviewQuestionRecord, InterviewMessageRecord


DEFAULT_INTERVIEW_QUESTIONS = [
    {
        "key": "routine",
        "template": "As a {occupation}, walk me through your daily work routine.",
        "category": "workflow",
    },
    {
        "key": "frustrations",
        "template": "What are your biggest frustrations with current tools in {industry}?",
        "category": "pain_points",
    },
    {
        "key": "features",
        "template": "What specific features would convince you to adopt {product_name}?",
        "category": "features",
    },
    {
        "key": "pricing",
        "template": "Given your budget of {budget}, how do you evaluate pricing and ROI for new software?",
        "category": "pricing",
    },
    {
        "key": "tech_stack",
        "template": "What tools and devices make up your everyday tech stack?",
        "category": "technology",
    },
]


def ensure_default_interview_questions(db: Session) -> None:
    """Seeds standard probing questions into the database if the table is empty."""
    count = db.query(InterviewQuestionRecord).count()
    if count == 0:
        records = [
            InterviewQuestionRecord(
                question_key=q["key"],
                question_template=q["template"],
                category=q["category"],
            )
            for q in DEFAULT_INTERVIEW_QUESTIONS
        ]
        db.add_all(records)
        db.commit()


def list_interview_questions(db: Session) -> List[InterviewQuestionRecord]:
    """Returns all stored hardcoded question templates from the database."""
    ensure_default_interview_questions(db)
    return db.query(InterviewQuestionRecord).order_by(InterviewQuestionRecord.created_at.asc()).all()


def match_hardcoded_question(
    db: Session,
    message: str,
    rendered_questions: Optional[List[str]] = None,
) -> Optional[str]:
    """
    Checks if an incoming user message matches a hardcoded basic question.
    Returns the question_key (e.g. 'routine', 'frustrations') if matched, else None.
    """
    msg_clean = message.strip().lower().rstrip("?.!")
    if not msg_clean:
        return None

    # 1. Check direct match against any rendered templates passed from the caller
    if rendered_questions:
        for rq in rendered_questions:
            if msg_clean == rq.strip().lower().rstrip("?.!"):
                pass # We will match by signatures below to return the correct key

    # 2. Match against stored database template strings or standard question signatures
    questions = list_interview_questions(db)
    for q in questions:
        key = q.question_key
        raw_template_clean = q.question_template.lower().rstrip("?.!")
        if msg_clean == raw_template_clean:
            return key

        # Signature matching for robustness when users click or type variations of basic questions
        if key == "routine" and any(k in msg_clean for k in ["daily", "routine", "day in the life"]) and any(k in msg_clean for k in ["walk me", "typical", "work", "through", "what does"]):
            return "routine"
        if key == "frustrations" and any(k in msg_clean for k in ["frustrat", "pain point", "biggest challenge", "headache"]):
            return "frustrations"
        if key == "features" and any(k in msg_clean for k in ["specific feature", "convince you", "adopt", "make you adopt", "like to see", "new solution"]):
            return "features"
        if key == "pricing" and any(k in msg_clean for k in ["evaluate pricing", "roi", "budget", "cost", "pay for", "pricing and roi"]):
            return "pricing"
        if key == "tech_stack" and any(k in msg_clean for k in ["tech stack", "everyday tech", "devices make up", "favourite apps", "tools and devices"]):
            return "tech_stack"
        
        # Additional fallback check for standard legacy frontend questions
        if msg_clean in [
            "walk me through your daily work routine",
            "what is your biggest frustration with current tools",
            "what specific features would make you adopt a new solution",
            "how do you evaluate pricing and roi for software",
        ]:
            if "routine" in msg_clean: return "routine"
            if "frustrat" in msg_clean: return "frustrations"
            if "feature" in msg_clean: return "features"
            if "pricing" in msg_clean or "roi" in msg_clean: return "pricing"

    return None


def save_interview_message(
    db: Session,
    persona_id: UUID,
    role: str,
    text: str,
    source: str = "llm",
    user_id: Optional[str] = None,
) -> InterviewMessageRecord:
    """Saves a conversation turn to the database, scoped to the user."""
    record = InterviewMessageRecord(
        user_id=user_id,
        persona_id=persona_id,
        role=role,
        text=text,
        source=source,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_messages_for_persona(
    db: Session,
    persona_id: UUID,
    user_id: Optional[str] = None,
) -> List[InterviewMessageRecord]:
    """Retrieves conversation history for a specific persona and user."""
    query = db.query(InterviewMessageRecord).filter(InterviewMessageRecord.persona_id == persona_id)
    if user_id:
        query = query.filter(InterviewMessageRecord.user_id == user_id)
    else:
        query = query.filter(InterviewMessageRecord.user_id.is_(None))
    return query.order_by(InterviewMessageRecord.created_at.asc()).all()


def get_all_user_messages_grouped(
    db: Session,
    user_id: Optional[str] = None,
) -> Dict[str, List[InterviewMessageRecord]]:
    """
    Retrieves all interview messages for the given user, grouped by persona_id.
    Ensures user isolation so conversations only appear for the owning user.
    """
    query = db.query(InterviewMessageRecord)
    if user_id:
        query = query.filter(InterviewMessageRecord.user_id == user_id)
    else:
        query = query.filter(InterviewMessageRecord.user_id.is_(None))
    all_msgs = query.order_by(InterviewMessageRecord.created_at.asc()).all()

    grouped: Dict[str, List[InterviewMessageRecord]] = {}
    for m in all_msgs:
        p_id_str = str(m.persona_id)
        if p_id_str not in grouped:
            grouped[p_id_str] = []
        grouped[p_id_str].append(m)
    return grouped


def delete_conversation_history(
    db: Session,
    persona_id: UUID,
    user_id: Optional[str] = None,
) -> int:
    """Deletes stored dialogue turns for a specific persona under the current user."""
    query = db.query(InterviewMessageRecord).filter(InterviewMessageRecord.persona_id == persona_id)
    if user_id:
        query = query.filter(InterviewMessageRecord.user_id == user_id)
    else:
        query = query.filter(InterviewMessageRecord.user_id.is_(None))
    deleted_count = query.delete(synchronize_session=False)
    db.commit()
    return deleted_count
