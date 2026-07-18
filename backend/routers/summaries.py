from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas
from database import get_db
from services.summary_generator import generate_mock_summary
from services.search_service import rebuild_search_index

router = APIRouter(prefix="/meetings/{meeting_id}/summary", tags=["summaries"])

@router.get("/", response_model=schemas.Summary)
def get_summary(meeting_id: int, db: Session = Depends(get_db)):
    summary = db.query(models.Summary).filter(models.Summary.meeting_id == meeting_id).first()
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found")
    return summary

@router.post("/generate", response_model=schemas.Summary)
def generate_summary(meeting_id: int, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
        
    # Get transcript text
    segments = db.query(models.TranscriptSegment)\
        .filter(models.TranscriptSegment.meeting_id == meeting_id)\
        .order_by(models.TranscriptSegment.segment_index)\
        .all()
        
    transcript_text = " ".join([seg.text for seg in segments if seg.text])
    
    # Generate mock summary
    summary_data = generate_mock_summary(transcript_text)
    
    # Delete existing if any
    db.query(models.Summary).filter(models.Summary.meeting_id == meeting_id).delete()
    
    db_summary = models.Summary(
        meeting_id=meeting_id,
        overview=summary_data['overview'],
        short_summary=summary_data['short_summary'],
        outline=summary_data['outline'],
        keywords=summary_data['keywords']
    )
    db.add(db_summary)
    db.commit()
    db.refresh(db_summary)
    
    # Rebuild index since summary changed
    rebuild_search_index(db)
    
    return db_summary

@router.put("/", response_model=schemas.Summary)
def update_summary(meeting_id: int, summary: schemas.SummaryCreate, db: Session = Depends(get_db)):
    db_summary = db.query(models.Summary).filter(models.Summary.meeting_id == meeting_id).first()
    
    if db_summary:
        for key, value in summary.model_dump().items():
            setattr(db_summary, key, value)
    else:
        db_summary = models.Summary(**summary.model_dump(), meeting_id=meeting_id)
        db.add(db_summary)
        
    db.commit()
    db.refresh(db_summary)
    
    rebuild_search_index(db)
    
    return db_summary
