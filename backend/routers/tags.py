from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas
from database import get_db
from typing import List

router = APIRouter(tags=["tags"])
meeting_router = APIRouter(prefix="/meetings/{meeting_id}/tags", tags=["tags"])

@router.get("/tags", response_model=List[schemas.Tag])
def get_tags(db: Session = Depends(get_db)):
    return db.query(models.Tag).all()

@router.post("/tags", response_model=schemas.Tag)
def create_tag(tag: schemas.TagCreate, db: Session = Depends(get_db)):
    db_tag = db.query(models.Tag).filter(models.Tag.name == tag.name).first()
    if db_tag:
        return db_tag # already exists
        
    db_tag = models.Tag(**tag.model_dump())
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag

@meeting_router.post("/", response_model=schemas.Meeting)
def add_tag_to_meeting(meeting_id: int, tag: schemas.TagCreate, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
        
    db_tag = db.query(models.Tag).filter(models.Tag.name == tag.name).first()
    if not db_tag:
        db_tag = models.Tag(**tag.model_dump())
        db.add(db_tag)
        
    if db_tag not in meeting.tags:
        meeting.tags.append(db_tag)
        db.commit()
        
    db.refresh(meeting)
    return meeting

@router.delete("/tags/{tag_id}/meetings/{meeting_id}")
def remove_tag_from_meeting(tag_id: int, meeting_id: int, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
        
    tag = db.query(models.Tag).filter(models.Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
        
    if tag in meeting.tags:
        meeting.tags.remove(tag)
        db.commit()
        
    return {"ok": True}
