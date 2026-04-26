from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.recommendations import router as recommendations_router

app = FastAPI(title="StaySense Backend", version="0.1.0")

frontend_origins = os.getenv("FRONTEND_ORIGINS", "http://localhost:3000")
allowed_origins = [origin.strip() for origin in frontend_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(recommendations_router, prefix="/api")
