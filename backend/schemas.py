from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any
from datetime import datetime

# --- Tags ---
class TagBase(BaseModel):
    name: str
    color: Optional[str] = "#6c16c7"

class TagCreate(TagBase):
    pass

class Tag(TagBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

# --- Participants ---
class ParticipantBase(BaseModel):
    name: str
    email: Optional[str] = None
    avatar_color: Optional[str] = None
    role: Optional[str] = "participant"

class ParticipantCreate(ParticipantBase):
    pass

class Participant(ParticipantBase):
    id: int
    meeting_id: int

    model_config = ConfigDict(from_attributes=True)

# --- Transcript Segments ---
class TranscriptSegmentBase(BaseModel):
    speaker_name: str
    start_time: float
    end_time: float
    text: str
    segment_index: int

class TranscriptSegmentCreate(TranscriptSegmentBase):
    participant_id: Optional[int] = None

class TranscriptSegment(TranscriptSegmentBase):
    id: int
    meeting_id: int
    participant_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

# --- Action Items ---
class ActionItemBase(BaseModel):
    text: str
    assignee: Optional[str] = None
    due_date: Optional[datetime] = None
    timestamp: Optional[float] = None

class ActionItemCreate(ActionItemBase):
    pass

class ActionItemUpdate(BaseModel):
    text: Optional[str] = None
    assignee: Optional[str] = None
    is_completed: Optional[int] = None
    due_date: Optional[datetime] = None

class ActionItem(ActionItemBase):
    id: int
    meeting_id: int
    is_completed: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Summaries ---
class SummaryBase(BaseModel):
    overview: str
    short_summary: str
    outline: str # json string representation of list of dicts
    keywords: str # json string representation of list of strings

class SummaryCreate(SummaryBase):
    pass

class Summary(SummaryBase):
    id: int
    meeting_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Comments ---
class CommentBase(BaseModel):
    text: str
    segment_id: Optional[int] = None
    timestamp: Optional[float] = None

class CommentCreate(CommentBase):
    pass

class CommentUpdate(BaseModel):
    text: str

class Comment(CommentBase):
    id: int
    meeting_id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Highlights ---
class HighlightBase(BaseModel):
    segment_id: int
    label: str # important | action | question | positive
    note: Optional[str] = None

class HighlightCreate(HighlightBase):
    pass

class Highlight(HighlightBase):
    id: int
    meeting_id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Soundbites ---
class SoundbiteBase(BaseModel):
    title: str
    start_time: float
    end_time: float
    segment_id_start: Optional[int] = None
    segment_id_end: Optional[int] = None

class SoundbiteCreate(SoundbiteBase):
    pass

class SoundbiteUpdate(BaseModel):
    title: Optional[str] = None
    start_time: Optional[float] = None
    end_time: Optional[float] = None

class Soundbite(SoundbiteBase):
    id: int
    meeting_id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Users ---
class UserBase(BaseModel):
    name: str
    email: str
    avatar_url: Optional[str] = None
    role: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    avatar_url: Optional[str] = None

class User(UserBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Meetings ---
class MeetingBase(BaseModel):
    title: str
    date: datetime
    duration_seconds: int
    status: Optional[str] = "completed"
    meeting_type: Optional[str] = "internal"
    captured_from: Optional[str] = "Meeting Notetaker"
    privacy: Optional[str] = "Only Participants"
    audio_url: Optional[str] = None
    video_url: Optional[str] = None

class MeetingCreate(MeetingBase):
    pass

class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    meeting_type: Optional[str] = None

class Meeting(MeetingBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    participants: List[Participant] = []
    tags: List[Tag] = []
    action_items: List[ActionItem] = []
    summary: Optional[Summary] = None

    model_config = ConfigDict(from_attributes=True)

# --- Search ---
class SearchResult(BaseModel):
    meeting_id: int
    title: str
    snippet: str # The highlighted text match
