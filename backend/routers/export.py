from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from database import get_db
from services.export_service import export_meeting
import models

router = APIRouter(prefix="/meetings/{meeting_id}/export", tags=["export"])

@router.get("/")
def export_meeting_data(
    meeting_id: int,
    format: str = Query("txt", regex="^(txt|md)$"),
    content: str = Query("full", regex="^(transcript|summary|full)$"),
    db: Session = Depends(get_db)
):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
        
    exported_content = export_meeting(db, meeting_id, format, content)
    
    filename = f"{meeting.title.replace(' ', '_')}.{format}"
    
    return Response(
        content=exported_content,
        media_type="text/plain",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
