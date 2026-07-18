from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas
from database import get_db

router = APIRouter(prefix="/meetings/{meeting_id}/comments", tags=["comments"])
router_flat = APIRouter(prefix="/comments", tags=["comments"])

@router.get("/", response_model=List[schemas.Comment])
def get_comments(meeting_id: int, db: Session = Depends(get_db)):
    return db.query(models.Comment).filter(models.Comment.meeting_id == meeting_id).all()

@router.post("/", response_model=schemas.Comment)
def create_comment(meeting_id: int, comment: schemas.CommentCreate, db: Session = Depends(get_db)):
    db_comment = models.Comment(**comment.model_dump(), meeting_id=meeting_id, user_id=1)
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

@router_flat.patch("/{comment_id}", response_model=schemas.Comment)
def update_comment(comment_id: int, comment: schemas.CommentUpdate, db: Session = Depends(get_db)):
    db_comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not db_comment:
        raise HTTPException(status_code=404, detail="Comment not found")
        
    db_comment.text = comment.text
    db.commit()
    db.refresh(db_comment)
    return db_comment

@router_flat.delete("/{comment_id}")
def delete_comment(comment_id: int, db: Session = Depends(get_db)):
    db_comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not db_comment:
        raise HTTPException(status_code=404, detail="Comment not found")
        
    db.delete(db_comment)
    db.commit()
    return {"ok": True}
