from app.database.database import Base, engine

# Import every model here
from app.models.persona import Persona
from app.models.survey import PersonaSurveyResponseRecord, SurveyQuestionRecord
from app.models.product_brief import ProductBriefRecord  # noqa: F401

Base.metadata.create_all(bind=engine)

print("Database initialized successfully.")