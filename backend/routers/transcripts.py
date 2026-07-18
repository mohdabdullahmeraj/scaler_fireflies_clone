from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
import models, schemas
from database import get_db
from services.transcript_parser import parse_transcript_file
from services.search_service import rebuild_search_index

router = APIRouter(prefix="/meetings/{meeting_id}/transcript", tags=["transcripts"])

@router.get("/", response_model=List[schemas.TranscriptSegment])
def get_transcript(meeting_id: int, db: Session = Depends(get_db)):
    segments = db.query(models.TranscriptSegment)\
        .filter(models.TranscriptSegment.meeting_id == meeting_id)\
        .order_by(models.TranscriptSegment.segment_index)\
        .all()
    return segments

@router.post("/", response_model=List[schemas.TranscriptSegment])
async def upload_transcript(
    meeting_id: int, 
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
        
    # Delete existing transcript segments
    db.query(models.TranscriptSegment).filter(models.TranscriptSegment.meeting_id == meeting_id).delete()
    
    # Read file and parse
    content = await file.read()
    text_content = content.decode('utf-8')
    
    parsed_segments = parse_transcript_file(text_content, file.filename)
    
    db_segments = []
    for idx, seg in enumerate(parsed_segments):
        # We could create/link participants here based on name, but we'll leave participant_id empty 
        # and just use speaker_name for simplicity
        db_seg = models.TranscriptSegment(
            meeting_id=meeting_id,
            speaker_name=seg['speaker'],
            start_time=seg['start'],
            end_time=seg['end'],
            text=seg['text'],
            segment_index=idx
        )
        db.add(db_seg)
        db_segments.append(db_seg)
        
    db.commit()
    
    # Rebuild search index
    rebuild_search_index(db)
    
    return db_segments

@router.get("/search")
def search_transcript(meeting_id: int, q: str, db: Session = Depends(get_db)):
    # Very simple client-side-like search for a specific transcript
    segments = db.query(models.TranscriptSegment)\
        .filter(models.TranscriptSegment.meeting_id == meeting_id)\
        .filter(models.TranscriptSegment.text.ilike(f"%{q}%"))\
        .order_by(models.TranscriptSegment.segment_index)\
        .all()
        
    # We could highlight the text here or leave it to the frontend
    return segments
