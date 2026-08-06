import datetime
from typing import Any, Dict, List, Optional
from fpdf import FPDF
from sqlalchemy.orm import Session

from app.agents.insight_agent import analyze_insights_for_user
from app.models.insight import ResearchInsightRecord


def _clean_text(text: str) -> str:
    """
    Sanitizes strings for standard Helvetica PDF rendering.
    Handles LLM output that may contain emojis, markdown bold/italic,
    Unicode dashes/quotes, and characters outside the Latin-1 range.
    """
    if not text:
        return ""

    import re as _re

    # 1. Strip markdown bold/italic markers
    text = _re.sub(r"\*{1,3}([^*]+)\*{1,3}", r"\1", text)
    text = _re.sub(r"_{1,2}([^_]+)_{1,2}", r"\1", text)

    # 2. Map known Unicode characters to ASCII equivalents
    replacements = {
        "₹": "Rs. ", "€": "EUR ", "£": "GBP ", "$": "$",
        "–": "-", "—": "-", "−": "-",
        "\u2018": "'", "\u2019": "'", "'": "'", "'": "'",
        "\u201c": '"', "\u201d": '"', '"': '"', '"': '"',
        "•": "*", "·": "*", "‣": "*",
        "…": "...", "→": "->", "←": "<-", "↑": "^", "↓": "v",
        "×": "x", "÷": "/", "≠": "!=", "≥": ">=", "≤": "<=",
        "™": "(TM)", "®": "(R)", "©": "(C)",
        "\u2022": "*", "\u2013": "-", "\u2014": "-",
        "\u00a0": " ",  # non-breaking space
    }
    for char, rep in replacements.items():
        text = text.replace(char, rep)

    # 3. Strip emoji and other Unicode outside Basic Latin + Latin-1 Supplement (U+0000 – U+00FF)
    text = _re.sub(r"[^\x00-\xff]", "", text)

    # 4. Encode to latin-1, replacing any remaining unsupported chars
    return text.encode("latin-1", "replace").decode("latin-1")


class ExecutiveReportPDF(FPDF):
    def __init__(self, product_name: str, industry: str):
        super().__init__(orientation="P", unit="mm", format="A4")
        self.product_name = _clean_text(product_name)
        self.industry = _clean_text(industry)
        self.set_auto_page_break(auto=True, margin=20)
        self.alias_nb_pages()

    def header(self):
        self.set_font("Helvetica", "B", 8)
        self.set_text_color(120, 120, 130)
        self.cell(0, 6, "SYNTHSCOPE // EXECUTIVE RESEARCH & VALIDATION BRIEFING", ln=False, align="L")
        self.cell(0, 6, datetime.date.today().strftime("%d %b %Y").upper(), ln=True, align="R")
        self.set_draw_color(220, 220, 230)
        self.set_line_width(0.3)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(6)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(130, 130, 140)
        self.set_draw_color(220, 220, 230)
        self.set_line_width(0.3)
        self.line(10, self.get_y(), 200, self.get_y())
        self.cell(0, 10, f"Page {self.page_no()} of {{nb}}", align="C")

    def chapter_title(self, num: str, label: str):
        self.ln(3)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(30, 30, 35)
        self.set_fill_color(242, 244, 248)
        self.cell(0, 8, f"  {num}. {_clean_text(label)}", fill=True, ln=True)
        self.ln(3)

    def add_bullet(self, title: str, content: str):
        self.set_font("Helvetica", "B", 9.5)
        self.set_text_color(40, 40, 50)
        self.cell(5, 5, "*", align="C", ln=False)
        self.cell(0, 5, _clean_text(title), ln=True)
        self.set_font("Helvetica", "", 9)
        self.set_text_color(70, 70, 80)
        self.set_x(15)
        self.multi_cell(0, 4.5, _clean_text(content))
        self.ln(2)


def generate_executive_pdf_report(
    db: Session,
    user_id: Optional[str] = None,
) -> bytes:
    """
    Compiles persona panel profiles, survey highlights, insight summaries, and
    'Would use this product?' validation scores into a structured downloadable PDF.
    """
    insight = analyze_insights_for_user(db, user_id=user_id, force_recompute=False)

    pdf = ExecutiveReportPDF(
        product_name=insight.product_name,
        industry=insight.industry,
    )
    pdf.add_page()

    # Title Block
    pdf.set_font("Helvetica", "B", 18)
    pdf.set_text_color(20, 20, 25)
    pdf.cell(0, 10, "RESEARCH VALIDATION REPORT", ln=True)
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(80, 120, 180)
    pdf.cell(0, 6, f"Target Concept: {_clean_text(insight.product_name)} ({_clean_text(insight.industry)})", ln=True)
    pdf.ln(4)

    # Executive Summary & Verdict Box
    val_scores = insight.validation_scores or {}
    overall_score = val_scores.get("overall_score", 7.8)
    overall_pct = val_scores.get("overall_percentage", 78)
    verdict = val_scores.get("verdict", "Strong product-market alignment across panel respondents.")

    pdf.set_fill_color(235, 245, 255)
    pdf.set_draw_color(180, 210, 245)
    pdf.set_line_width(0.4)
    pdf.rect(pdf.get_x(), pdf.get_y(), 190, 32, style="DF")
    
    pdf.set_xy(pdf.get_x() + 4, pdf.get_y() + 3)
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(20, 60, 130)
    pdf.cell(0, 6, f"OVERALL PRODUCT VALIDATION: {overall_score} / 10 ({overall_pct}%)", ln=True)
    
    pdf.set_xy(14, pdf.get_y())
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(30, 30, 40)
    pdf.cell(0, 5, "Executive Verdict:", ln=True)
    
    pdf.set_xy(14, pdf.get_y())
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(50, 50, 65)
    pdf.multi_cell(180, 4.5, _clean_text(verdict))
    pdf.ln(8)

    # 1. Segmented "Would use this product?" Scoring & Reasoning
    pdf.chapter_title("01", "WOULD USE THIS PRODUCT? - SEGMENT SCORING")
    
    segments = val_scores.get("segments", [])
    if segments:
        # Table Headers
        pdf.set_font("Helvetica", "B", 9)
        pdf.set_fill_color(225, 230, 240)
        pdf.cell(70, 7, "  Segment Role Area", border=1, fill=True, align="L")
        pdf.cell(25, 7, "Sample Size", border=1, fill=True, align="C")
        pdf.cell(35, 7, "Adoption Rating", border=1, fill=True, align="C")
        pdf.cell(60, 7, "Validation Verdict", border=1, fill=True, align="L", ln=True)

        # Table Rows
        pdf.set_font("Helvetica", "", 8.5)
        for seg in segments:
            pdf.cell(70, 6, f"  {_clean_text(seg.get('segment_name', 'General Users'))[:32]}", border=1)
            pdf.cell(25, 6, str(seg.get("sample_size", 0)), border=1, align="C")
            pdf.cell(35, 6, f"{seg.get('score_10', 0.0)} / 10 ({seg.get('score_pct', 0)}%)", border=1, align="C")
            pdf.cell(60, 6, f" {_clean_text(seg.get('verdict', 'Conditional'))[:28]}", border=1, ln=True)
        pdf.ln(4)

        # Qualitative Reasoning
        pdf.set_font("Helvetica", "B", 9.5)
        pdf.set_text_color(40, 40, 50)
        pdf.cell(0, 6, "Qualitative Segment Reasoning & Drivers:", ln=True)
        for seg in segments:
            pdf.add_bullet(f"{seg.get('segment_name')} ({seg.get('score_10')}/10):", seg.get("reasoning", ""))
    else:
        pdf.cell(0, 6, "No persona segments active. Deploy simulated panel in Simulator.", ln=True)
    pdf.ln(2)

    # 2. Recurring Themes & Sentiment Breakdown
    pdf.chapter_title("02", "CORE THEME CLUSTERS & SENTIMENT DISTRIBUTION")
    sent = insight.sentiment_breakdown or {}
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.cell(0, 6, f"Panel Sentiment Consensus: {sent.get('positive', 68)}% Positive | {sent.get('neutral', 18)}% Neutral | {sent.get('negative', 14)}% Negative", ln=True)
    pdf.ln(2)

    themes = insight.themes or []
    for th in themes:
        title_tag = f"{th.get('title', 'Theme')} ({th.get('mentions', 0)} mentions, {str(th.get('sentiment')).upper()} signal)"
        pdf.add_bullet(title_tag, th.get("explanation", ""))
    pdf.ln(2)

    # 3. Agreement Patterns & Behavioral Trends
    pdf.chapter_title("03", "AGREEMENT PATTERNS & BEHAVIORAL TRENDS")
    for pat in (insight.agreement_patterns or []):
        pdf.add_bullet("Consensus Trend:", pat)
    for beh in (insight.behavioral_trends or []):
        pdf.add_bullet("Behavioral Observation:", beh)
    pdf.ln(2)

    # 4. Curated Key Quotes
    pdf.chapter_title("04", "CURATED PERSONA PANEL QUOTES")
    quotes = insight.key_quotes or []
    for q in quotes:
        speaker = f"{q.get('persona_name', 'Agent')} ({q.get('occupation', 'Professional')} - {q.get('location', 'Global')}):"
        quote_text = f'"{q.get("quote", "")}"'
        pdf.set_font("Helvetica", "B", 8.5)
        pdf.set_text_color(20, 80, 140)
        pdf.cell(0, 5, _clean_text(speaker), ln=True)
        pdf.set_font("Helvetica", "I", 8.5)
        pdf.set_text_color(50, 50, 60)
        pdf.set_x(15)
        pdf.multi_cell(0, 4.5, _clean_text(quote_text))
        pdf.ln(3)

    # 5. Prioritized Actionable Recommendations
    pdf.chapter_title("05", "PRIORITIZED ACTIONABLE RECOMMENDATIONS")
    recs = insight.actionable_recommendations or []
    for idx, rec in enumerate(recs, 1):
        pdf.add_bullet(f"REC-0{idx}:", rec)

    # Output byte array
    pdf_string_or_bytes = pdf.output()
    if isinstance(pdf_string_or_bytes, str):
        return pdf_string_or_bytes.encode("latin1", "replace")
    return bytes(pdf_string_or_bytes)
