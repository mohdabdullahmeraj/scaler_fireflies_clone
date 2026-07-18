from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
import schemas
from database import get_db
from services.search_service import search_meetings

router = APIRouter(prefix="/search", tags=["search"])

@router.get("/", response_model=List[schemas.SearchResult])
def search_all(
    q: str = Query(..., min_length=1),
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    results = search_meetings(db, query=q, limit=limit, offset=offset)
    return results
