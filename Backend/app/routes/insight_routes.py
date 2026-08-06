from typing import Optional
from fastapi import APIRouter, Depends, Header, Response
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.agents.insight_agent import analyze_insights_for_user
from app.services.report_service import generate_executive_pdf_report
from app.schemas.insight import InsightDashboardResponse

router = APIRouter(
    prefix="/insights",
    tags=["Insights & Reporting"]
)


@router.get("/dashboard", response_model=InsightDashboardResponse)
def get_insights_dashboard(
    db: Session = Depends(get_db),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
):
    """
    Returns comprehensive analytical metrics, recurring themes, agreement patterns,
    and segmented 'Would use this product?' validation scores for the user's research panel.
    """
    insight = analyze_insights_for_user(db, user_id=x_user_id, force_recompute=False)
    return insight


@router.post("/analyze", response_model=InsightDashboardResponse)
def trigger_insight_extraction(
    db: Session = Depends(get_db),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
):
    """
    Force triggers a fresh execution of the autonomous Insight Extraction Agent,
    re-evaluating all survey responses, dialogue turns, and scoring from scratch.
    """
    insight = analyze_insights_for_user(db, user_id=x_user_id, force_recompute=True)
    return insight


@router.get("/report", response_model=InsightDashboardResponse)
def get_executive_report_briefing(
    db: Session = Depends(get_db),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
):
    """
    Retrieves executive summary briefing data, validation verdicts, and actionable steps
    for display in the Frontend report viewer.
    """
    insight = analyze_insights_for_user(db, user_id=x_user_id, force_recompute=False)
    return insight


@router.get("/report/pdf")
def download_executive_pdf_report(
    db: Session = Depends(get_db),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
):
    """
    Compiles persona panel responses, theme clusters, validation scoring, and
    executive recommendations into a structured, downloadable PDF binary file.
    """
    pdf_bytes = generate_executive_pdf_report(db, user_id=x_user_id)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": 'attachment; filename="SynthScope_Executive_Research_Report.pdf"',
        },
    )
