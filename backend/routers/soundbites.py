from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas
from database import get_db

router = APIRouter(prefix="/meetings/{meeting_id}/soundbites", tags=["soundbites"])
router_flat = APIRouter(prefix="/soundbites", tags=["soundbites"])

@router.get("/", response_model=List[schemas.Soundbite])
def get_soundbites(meeting_id: int, db: Session = Depends(get_db)):
    return db.query(models.Soundbite).filter(models.Soundbite.meeting_id == meeting_id).all()

@router.post("/", response_model=schemas.Soundbite)
def create_soundbite(meeting_id: int, soundbite: schemas.SoundbiteCreate, db: Session = Depends(get_db)):
    # user_id=1 as default
    db_sb = models.Soundbite(**soundbite.model_dump(), meeting_id=meeting_id, user_id=1)
    db.add(db_sb)
    db.commit()
    db.refresh(db_sb)
    return db_sb

@router_flat.patch("/{soundbite_id}", response_model=schemas.Soundbite)
def update_soundbite(soundbite_id: int, soundbite: schemas.SoundbiteUpdate, db: Session = Depends(get_db)):
    db_sb = db.query(models.Soundbite).filter(models.Soundbite.id == soundbite_id).first()
    if not db_sb:
        raise HTTPException(status_code=404, detail="Soundbite not found")
        
    update_data = soundbite.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_sb, key, value)
        
    db.commit()
    db.refresh(db_sb)
    return db_sb

@router_flat.delete("/{soundbite_id}")
def delete_soundbite(soundbite_id: int, db: Session = Depends(get_db)):
    db_sb = db.query(models.Soundbite).filter(models.Soundbite.id == soundbite_id).first()
    if not db_sb:
        raise HTTPException(status_code=404, detail="Soundbite not found")
        
    db.delete(db_sb)
    db.commit()
    return {"ok": True}
