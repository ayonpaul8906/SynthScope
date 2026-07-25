from app.database.database import Base, engine

# Import every model here
from app.models.persona import Persona
from app.models.survey import PersonaSurveyResponseRecord, SurveyQuestionRecord

Base.metadata.create_all(bind=engine)

print("Database initialized successfully.")