import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import app.database.init_db  # noqa: F401

from app.routes.persona_routes import router as persona_router
from app.routes.survey_routes import router as survey_router

app = FastAPI(
    title="Synthetic User Generation Platform API"
)

allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173,http://localhost:8080,http://127.0.0.1:8080,https://b5m51v1v-8080.inc1.devtunnels.ms"
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(persona_router)
app.include_router(survey_router)


@app.get("/")
def root():
    return {
        "message": "Synthetic User Generation Platform API Running"
    }