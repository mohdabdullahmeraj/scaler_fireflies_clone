from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas
from database import get_db

router = APIRouter(prefix="/meetings/{meeting_id}/highlights", tags=["highlights"])
router_flat = APIRouter(prefix="/highlights", tags=["highlights"])

@router.get("/", response_model=List[schemas.Highlight])
def get_highlights(meeting_id: int, db: Session = Depends(get_db)):
    return db.query(models.Highlight).filter(models.Highlight.meeting_id == meeting_id).all()

@router.post("/", response_model=schemas.Highlight)
def create_highlight(meeting_id: int, highlight: schemas.HighlightCreate, db: Session = Depends(get_db)):
    db_highlight = models.Highlight(**highlight.model_dump(), meeting_id=meeting_id, user_id=1)
    db.add(db_highlight)
    db.commit()
    db.refresh(db_highlight)
    return db_highlight

@router_flat.delete("/{highlight_id}")
def delete_highlight(highlight_id: int, db: Session = Depends(get_db)):
    db_highlight = db.query(models.Highlight).filter(models.Highlight.id == highlight_id).first()
    if not db_highlight:
        raise HTTPException(status_code=404, detail="Highlight not found")
        
    db.delete(db_highlight)
    db.commit()
    return {"ok": True}
