from app.database.database import Base, engine

# Import every model here
from app.models.persona import Persona

Base.metadata.create_all(bind=engine)

print("Database initialized successfully.")