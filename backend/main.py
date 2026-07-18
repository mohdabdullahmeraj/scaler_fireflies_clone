from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import models
from database import engine, SessionLocal
from models import init_db

# Import routers
from routers import meetings, transcripts, summaries, action_items, tags, soundbites, comments, highlights, search, export, users

import os
import seed

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and init FTS5
    db_path = "./fireflies.db"
    needs_seeding = not os.path.exists(db_path)
    
    init_db()
    
    if needs_seeding:
        print("Database not found. Auto-seeding for deployment...")
        seed.seed_database()
        
    yield
    # Shutdown
    pass

app = FastAPI(title="Fireflies Clone API", lifespan=lifespan)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(meetings.router, prefix="/api/v1")
app.include_router(transcripts.router, prefix="/api/v1")
app.include_router(summaries.router, prefix="/api/v1")
app.include_router(action_items.router, prefix="/api/v1")
app.include_router(action_items.router_flat, prefix="/api/v1")
app.include_router(tags.router, prefix="/api/v1")
app.include_router(tags.meeting_router, prefix="/api/v1")
app.include_router(soundbites.router, prefix="/api/v1")
app.include_router(soundbites.router_flat, prefix="/api/v1")
app.include_router(comments.router, prefix="/api/v1")
app.include_router(comments.router_flat, prefix="/api/v1")
app.include_router(highlights.router, prefix="/api/v1")
app.include_router(highlights.router_flat, prefix="/api/v1")
app.include_router(search.router, prefix="/api/v1")
app.include_router(export.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Welcome to Fireflies Clone API"}
