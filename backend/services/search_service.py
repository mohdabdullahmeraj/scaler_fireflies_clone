from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List

def rebuild_search_index(db: Session):
    # Clear existing index
    db.execute(text("DELETE FROM search_index"))
    
    # Rebuild from scratch
    # In SQLite FTS5, contentless tables don't store data, just index it,
    # but we will store content in search_index to make snippet extraction easier.
    # The schema is: meeting_id UNINDEXED, title, transcript_text, summary_text
    
    meetings = db.execute(text("SELECT id, title FROM meetings")).fetchall()
    
    for meeting in meetings:
        meeting_id = meeting.id
        title = meeting.title
        
        # Get transcript text
        segments = db.execute(
            text("SELECT text FROM transcript_segments WHERE meeting_id = :meeting_id ORDER BY segment_index"),
            {"meeting_id": meeting_id}
        ).fetchall()
        transcript_text = " ".join([seg.text for seg in segments if seg.text])
        
        # Get summary text
        summary = db.execute(
            text("SELECT overview FROM summaries WHERE meeting_id = :meeting_id"),
            {"meeting_id": meeting_id}
        ).fetchone()
        summary_text = summary.overview if summary else ""
        
        # Insert into search_index
        db.execute(
            text("""
                INSERT INTO search_index (meeting_id, title, transcript_text, summary_text)
                VALUES (:meeting_id, :title, :transcript_text, :summary_text)
            """),
            {
                "meeting_id": meeting_id,
                "title": title,
                "transcript_text": transcript_text,
                "summary_text": summary_text
            }
        )
    
    db.commit()

def search_meetings(db: Session, query: str, limit: int = 20, offset: int = 0):
    # FTS5 search using MATCH
    # Use snippet() to get context around matches
    sql = """
        SELECT 
            meeting_id,
            title,
            snippet(search_index, -1, '<b>', '</b>', '...', 10) as snippet
        FROM search_index 
        WHERE search_index MATCH :query
        ORDER BY rank
        LIMIT :limit OFFSET :offset
    """
    
    # For Porter stemming, simple queries work well.
    # We might need to wrap the query in quotes or handle special chars in a real app,
    # but for simple text this is fine.
    
    # A bit of query sanitization for FTS5 (remove quotes)
    safe_query = query.replace('"', '').replace("'", "")
    # Add * to the end of each word for prefix matching
    words = safe_query.split()
    match_query = " OR ".join([f"{w}*" for w in words]) if words else ""
    
    if not match_query:
        return []
        
    results = db.execute(text(sql), {"query": match_query, "limit": limit, "offset": offset}).fetchall()
    
    return [
        {"meeting_id": r.meeting_id, "title": r.title, "snippet": r.snippet}
        for r in results
    ]
