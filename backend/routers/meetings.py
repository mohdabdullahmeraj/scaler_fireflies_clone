from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from datetime import datetime

import models, schemas
from database import get_db

router = APIRouter(prefix="/meetings", tags=["meetings"])

@router.get("/", response_model=List[schemas.Meeting])
def get_meetings(
    db: Session = Depends(get_db),
    search: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    hosted_by: List[str] = Query(None),
    participants: List[str] = Query(None),
    tag: Optional[str] = None,
    status: Optional[str] = None,
    meeting_type: Optional[str] = Query(None, alias="type"),
    duration_min: Optional[int] = None,
    duration_max: Optional[int] = None,
    captured_from: List[str] = Query(None),
    privacy: List[str] = Query(None),
    shared_with: Optional[str] = None,
    sort: Optional[str] = "recent",
    skip: int = 0,
    limit: int = 20
):
    query = db.query(models.Meeting)
    
    # If full text search is requested, we use FTS5 via the search_service logic
    # or handle simple title matching here for brevity if it's just title
    if search:
        # FTS5 search logic could be integrated here, but for now we do LIKE on title
        # In a real app we'd join search_index
        from services.search_service import search_meetings
        search_results = search_meetings(db, search, limit=100)
        meeting_ids = [r["meeting_id"] for r in search_results]
        query = query.filter(models.Meeting.id.in_(meeting_ids))

    if date_from:
        query = query.filter(models.Meeting.date >= date_from)
    if date_to:
        query = query.filter(models.Meeting.date <= date_to)
    if status:
        query = query.filter(models.Meeting.status == status)
    if meeting_type:
        query = query.filter(models.Meeting.meeting_type == meeting_type)
        
    if hosted_by:
        query = query.join(models.Participant, models.Participant.meeting_id == models.Meeting.id).filter(
            models.Participant.email.in_(hosted_by),
            models.Participant.role == "host"
        )
        
    if participants:
        # Avoid duplicate joins if hosted_by already joined. SQLAlchemy handles this if we alias or are careful, 
        # but since we might filter by both, it's safer to use an EXISTS subquery or any()
        query = query.filter(models.Meeting.participants.any(models.Participant.email.in_(participants)))
        
    if shared_with:
        # 'Shared with me' logic: user is a participant but NOT a host.
        # So there must exist a participant record with this email AND role != 'host'
        query = query.filter(
            models.Meeting.participants.any(
                (models.Participant.email == shared_with) & (models.Participant.role != "host")
            )
        )

    if duration_min is not None:
        query = query.filter(models.Meeting.duration_seconds >= duration_min)
    if duration_max is not None:
        query = query.filter(models.Meeting.duration_seconds <= duration_max)
        
    if captured_from:
        query = query.filter(models.Meeting.captured_from.in_(captured_from))
        
    if privacy:
        query = query.filter(models.Meeting.privacy.in_(privacy))
        
    if tag:
        query = query.join(models.Meeting.tags).filter(models.Tag.name == tag)

    if sort == "recent":
        query = query.order_by(models.Meeting.date.desc())
    elif sort == "oldest":
        query = query.order_by(models.Meeting.date.asc())
    elif sort == "title":
        query = query.order_by(models.Meeting.title.asc())
    elif sort == "duration":
        query = query.order_by(models.Meeting.duration_seconds.desc())
        
    meetings = query.offset(skip).limit(limit).all()
    return meetings

@router.get("/{meeting_id}", response_model=schemas.Meeting)
def get_meeting(meeting_id: int, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting

@router.get("/{meeting_id}/transcript", response_model=List[schemas.TranscriptSegment])
def get_meeting_transcript(meeting_id: int, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
        
    segments = db.query(models.TranscriptSegment).filter(
        models.TranscriptSegment.meeting_id == meeting_id
    ).order_by(models.TranscriptSegment.segment_index.asc()).all()
    
    return segments

@router.post("/", response_model=schemas.Meeting)
def create_meeting(meeting: schemas.MeetingCreate, db: Session = Depends(get_db)):
    # Default user for now
    db_meeting = models.Meeting(**meeting.model_dump(), user_id=1)
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)
    
    # Trigger search index rebuild or update
    from services.search_service import rebuild_search_index
    rebuild_search_index(db)
    
    return db_meeting

@router.patch("/{meeting_id}", response_model=schemas.Meeting)
def update_meeting(meeting_id: int, meeting: schemas.MeetingUpdate, db: Session = Depends(get_db)):
    db_meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not db_meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
        
    update_data = meeting.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_meeting, key, value)
        
    db.commit()
    db.refresh(db_meeting)
    
    # Rebuild search index to reflect title changes
    if "title" in update_data:
        from services.search_service import rebuild_search_index
        rebuild_search_index(db)
        
    return db_meeting

@router.delete("/{meeting_id}")
def delete_meeting(meeting_id: int, db: Session = Depends(get_db)):
    db_meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not db_meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
        
    # Thanks to ON DELETE CASCADE on our FKs, this deletes segments, summaries, etc.
    db.delete(db_meeting)
    db.commit()
    
    from services.search_service import rebuild_search_index
    rebuild_search_index(db)
    
    return {"ok": True}
