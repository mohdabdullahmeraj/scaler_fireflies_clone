from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, Table, text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base, engine

# Many-to-many junction table for meetings and tags
meeting_tags = Table(
    'meeting_tags',
    Base.metadata,
    Column('meeting_id', Integer, ForeignKey('meetings.id', ondelete='CASCADE'), primary_key=True),
    Column('tag_id', Integer, ForeignKey('tags.id', ondelete='CASCADE'), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    avatar_url = Column(String)
    role = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    meetings = relationship("Meeting", back_populates="owner")
    comments = relationship("Comment", back_populates="user")
    highlights = relationship("Highlight", back_populates="user")
    soundbites = relationship("Soundbite", back_populates="user")

class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    date = Column(DateTime, index=True)
    duration_seconds = Column(Integer)
    status = Column(String, index=True) # completed | processing | scheduled
    meeting_type = Column(String, index=True) # internal | external | interview | sales
    captured_from = Column(String, default="Meeting Notetaker")
    privacy = Column(String, default="Only Participants")
    audio_url = Column(String, nullable=True)
    video_url = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="meetings")
    participants = relationship("Participant", back_populates="meeting", cascade="all, delete-orphan", passive_deletes=True)
    transcript_segments = relationship("TranscriptSegment", back_populates="meeting", cascade="all, delete-orphan", passive_deletes=True)
    summary = relationship("Summary", back_populates="meeting", uselist=False, cascade="all, delete-orphan", passive_deletes=True)
    action_items = relationship("ActionItem", back_populates="meeting", cascade="all, delete-orphan", passive_deletes=True)
    comments = relationship("Comment", back_populates="meeting", cascade="all, delete-orphan", passive_deletes=True)
    highlights = relationship("Highlight", back_populates="meeting", cascade="all, delete-orphan", passive_deletes=True)
    soundbites = relationship("Soundbite", back_populates="meeting", cascade="all, delete-orphan", passive_deletes=True)
    tags = relationship("Tag", secondary=meeting_tags, back_populates="meetings", passive_deletes=True)

class Participant(Base):
    __tablename__ = "participants"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id", ondelete="CASCADE"), index=True)
    name = Column(String)
    email = Column(String, nullable=True)
    avatar_color = Column(String)
    role = Column(String)

    meeting = relationship("Meeting", back_populates="participants")
    transcript_segments = relationship("TranscriptSegment", back_populates="participant")

class TranscriptSegment(Base):
    __tablename__ = "transcript_segments"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id", ondelete="CASCADE"), index=True)
    participant_id = Column(Integer, ForeignKey("participants.id", ondelete="SET NULL"), nullable=True, index=True)
    speaker_name = Column(String)
    start_time = Column(Float, index=True) # Adding index as we might filter/sort by this
    end_time = Column(Float)
    text = Column(Text)
    segment_index = Column(Integer)

    meeting = relationship("Meeting", back_populates="transcript_segments")
    participant = relationship("Participant", back_populates="transcript_segments")
    comments = relationship("Comment", back_populates="segment")
    highlights = relationship("Highlight", back_populates="segment")
    # For soundbites, relationships are handled differently

class Summary(Base):
    __tablename__ = "summaries"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id", ondelete="CASCADE"), unique=True, index=True)
    overview = Column(Text)
    short_summary = Column(Text)
    outline = Column(Text) # JSON string
    keywords = Column(Text) # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)

    meeting = relationship("Meeting", back_populates="summary")

class ActionItem(Base):
    __tablename__ = "action_items"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id", ondelete="CASCADE"), index=True)
    text = Column(Text)
    assignee = Column(String, nullable=True)
    is_completed = Column(Integer, default=0)
    due_date = Column(DateTime, nullable=True)
    timestamp = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    meeting = relationship("Meeting", back_populates="action_items")

class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    color = Column(String)

    meetings = relationship("Meeting", secondary=meeting_tags, back_populates="tags")

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id", ondelete="CASCADE"), index=True)
    segment_id = Column(Integer, ForeignKey("transcript_segments.id", ondelete="SET NULL"), nullable=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    text = Column(Text)
    timestamp = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    meeting = relationship("Meeting", back_populates="comments")
    segment = relationship("TranscriptSegment", back_populates="comments")
    user = relationship("User", back_populates="comments")

class Highlight(Base):
    __tablename__ = "highlights"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id", ondelete="CASCADE"), index=True)
    segment_id = Column(Integer, ForeignKey("transcript_segments.id", ondelete="SET NULL"), nullable=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    label = Column(String) # important | action | question | positive
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    meeting = relationship("Meeting", back_populates="highlights")
    segment = relationship("TranscriptSegment", back_populates="highlights")
    user = relationship("User", back_populates="highlights")

class Soundbite(Base):
    __tablename__ = "soundbites"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id", ondelete="CASCADE"), index=True)
    title = Column(String)
    start_time = Column(Float)
    end_time = Column(Float)
    segment_id_start = Column(Integer, ForeignKey("transcript_segments.id", ondelete="SET NULL"), nullable=True)
    segment_id_end = Column(Integer, ForeignKey("transcript_segments.id", ondelete="SET NULL"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    meeting = relationship("Meeting", back_populates="soundbites")
    user = relationship("User", back_populates="soundbites")
    
    start_segment = relationship("TranscriptSegment", foreign_keys=[segment_id_start])
    end_segment = relationship("TranscriptSegment", foreign_keys=[segment_id_end])

def init_db():
    Base.metadata.create_all(bind=engine)
    # Create FTS5 virtual table
    with engine.connect() as conn:
        conn.execute(text(
            """
            CREATE VIRTUAL TABLE IF NOT EXISTS search_index USING fts5(
                meeting_id UNINDEXED,
                title,
                transcript_text,
                summary_text,
                tokenize='porter unicode61'
            )
            """
        ))
        conn.commit()
