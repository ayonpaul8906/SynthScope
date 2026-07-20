from fastapi import FastAPI

from app.routes.persona_routes import router as persona_router

app = FastAPI(
    title="Synthetic User Generation Platform API"
)

app.include_router(persona_router)


@app.get("/")
def root():
    return {
        "message": "Synthetic User Generation Platform API Running"
    }