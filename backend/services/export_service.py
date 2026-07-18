from sqlalchemy.orm import Session
import models
import json

def export_meeting(db: Session, meeting_id: int, format: str, content: str) -> str:
    """
    Exports a meeting in the specified format (txt, md) and content (transcript, summary, full).
    Returns the exported string. In a real app, PDF generation might return bytes.
    """
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        return ""
        
    result = []
    
    if format == 'md':
        result.append(f"# {meeting.title}")
        result.append(f"**Date**: {meeting.date}")
        result.append(f"**Duration**: {meeting.duration_seconds // 60} minutes")
        result.append("\n---")
        
        if content in ['summary', 'full'] and meeting.summary:
            result.append("\n## AI Summary")
            result.append(meeting.summary.overview)
            
            result.append("\n### Action Items")
            for action in meeting.action_items:
                checkbox = "[x]" if action.is_completed else "[ ]"
                assignee = f" (@{action.assignee})" if action.assignee else ""
                result.append(f"- {checkbox} {action.text}{assignee}")
            
            result.append("\n---")
            
        if content in ['transcript', 'full']:
            result.append("\n## Transcript")
            for segment in meeting.transcript_segments:
                time_str = _format_time(segment.start_time)
                result.append(f"**{segment.speaker_name}** [{time_str}]")
                result.append(f"> {segment.text}\n")
                
    else: # txt
        result.append(f"Title: {meeting.title}")
        result.append(f"Date: {meeting.date}")
        result.append("-" * 40)
        
        if content in ['summary', 'full'] and meeting.summary:
            result.append("\nSUMMARY:")
            result.append(meeting.summary.overview)
            
            result.append("\nACTION ITEMS:")
            for action in meeting.action_items:
                status = "[DONE]" if action.is_completed else "[TODO]"
                assignee = f" (@{action.assignee})" if action.assignee else ""
                result.append(f"{status} {action.text}{assignee}")
                
            result.append("\n" + "-" * 40)
            
        if content in ['transcript', 'full']:
            result.append("\nTRANSCRIPT:")
            for segment in meeting.transcript_segments:
                time_str = _format_time(segment.start_time)
                result.append(f"{segment.speaker_name} [{time_str}]: {segment.text}")

    return "\n".join(result)
    
def _format_time(seconds: float) -> str:
    m, s = divmod(int(seconds), 60)
    h, m = divmod(m, 60)
    if h > 0:
        return f"{h:02d}:{m:02d}:{s:02d}"
    return f"{m:02d}:{s:02d}"
