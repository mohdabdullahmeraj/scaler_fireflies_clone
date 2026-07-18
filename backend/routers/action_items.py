from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas
from database import get_db
from services.summary_generator import generate_mock_summary
from services.search_service import rebuild_search_index

# Flat routes for single-item operations
router_flat = APIRouter(prefix="/action-items", tags=["action_items"])
# Meeting-scoped routes
router = APIRouter(prefix="/meetings/{meeting_id}/action-items", tags=["action_items"])

@router.get("/", response_model=list[schemas.ActionItem])
def get_action_items(meeting_id: int, db: Session = Depends(get_db)):
    return db.query(models.ActionItem).filter(models.ActionItem.meeting_id == meeting_id).all()

@router.post("/", response_model=schemas.ActionItem)
def create_action_item(meeting_id: int, item: schemas.ActionItemCreate, db: Session = Depends(get_db)):
    db_item = models.ActionItem(**item.model_dump(), meeting_id=meeting_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router_flat.patch("/{item_id}", response_model=schemas.ActionItem)
def update_action_item(item_id: int, item: schemas.ActionItemUpdate, db: Session = Depends(get_db)):
    db_item = db.query(models.ActionItem).filter(models.ActionItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Action item not found")
        
    update_data = item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
        
    db.commit()
    db.refresh(db_item)
    return db_item

@router_flat.patch("/{item_id}/toggle", response_model=schemas.ActionItem)
def toggle_action_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(models.ActionItem).filter(models.ActionItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Action item not found")
        
    db_item.is_completed = 0 if db_item.is_completed else 1
    db.commit()
    db.refresh(db_item)
    return db_item

@router_flat.delete("/{item_id}")
def delete_action_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(models.ActionItem).filter(models.ActionItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Action item not found")
        
    db.delete(db_item)
    db.commit()
    return {"ok": True}
