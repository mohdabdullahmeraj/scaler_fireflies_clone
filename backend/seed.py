import os
import json
from datetime import datetime, timedelta
from database import engine, SessionLocal, Base
from models import init_db
import models
from services.search_service import rebuild_search_index
import random

# Sample tags
TAGS = [
    {"name": "Engineering", "color": "#16c76c"},
    {"name": "Product", "color": "#6c16c7"},
    {"name": "Sales", "color": "#c76c16"},
    {"name": "Design", "color": "#c716c7"},
    {"name": "Research", "color": "#16c7c7"},
    {"name": "Client", "color": "#c71616"},
]

CAPTURED_FROM_OPTIONS = ["Meeting Notetaker", "Chrome Extension", "Mobile App", "Desktop App", "Uploads", "Voice Agent"]
PRIVACY_OPTIONS = ["Anyone with Link", "Teammates & Participants", "Only Teammates", "Only Participants", "Only Participants in Team", "Only Host"]

# Sample speakers for transcripts
def generate_transcript(participants: list, duration: int, title: str) -> list:
    segments = []
    current_time = 0.0
    index = 0
    
    if "Roadmap Planning" in title:
        sentences = [
            "We need to finalize the Q3 roadmap today.",
            "I think pushing the EU expansion to October makes sense.",
            "What about the budget for the new engineering hires?",
            "Let's make sure we prioritize platform stability.",
            "Are there any risks we haven't considered?"
        ]
    elif "Onboarding" in title:
        sentences = [
            "Welcome to the platform! Let me show you around.",
            "You can upload participants using an Excel file.",
            "Here is where you can customize the certificate design.",
            "Does the SSO integration make sense so far?",
            "Let's create a test event to see how it works."
        ]
    elif "Standup" in title:
        sentences = [
            "I finished the React 18 migration yesterday.",
            "Currently blocked by the database scaling issues.",
            "I'll be working on the API endpoints today.",
            "Can someone review my PR for the dashboard?",
            "No other blockers from my side."
        ]
    elif "Sales Demo" in title:
        sentences = [
            "Our enterprise plan includes custom reporting.",
            "You'll also get role-based access control.",
            "How does the $12k/year pricing sound to you?",
            "We can send the contract by the end of the day.",
            "Let me show you the analytics dashboard."
        ]
    elif "UX Research" in title:
        sentences = [
            "Could you walk me through how you add a task?",
            "I found the settings menu a bit hard to locate.",
            "I really like the new design, it's very clean.",
            "Would you prefer a dark mode option?",
            "The notifications are a bit too frequent for me."
        ]
    else:
        sentences = [
            "Let's review the progress from last sprint.",
            "Communication was much better this time.",
            "We need to improve our task estimation.",
            "I'll take ownership of that action item.",
            "Good work everyone, let's keep the momentum going."
        ]

    while current_time < duration:
        speaker = random.choice(participants)
        num_sentences = random.randint(1, 3)
        segment_text = " ".join(random.choices(sentences, k=num_sentences))
        duration_segment = len(segment_text.split()) / 2.5
        
        segments.append({
            "speaker_name": speaker.name,
            "participant_id": speaker.id,
            "start_time": current_time,
            "end_time": min(current_time + duration_segment, float(duration)),
            "text": segment_text.strip(),
            "segment_index": index
        })
        current_time += duration_segment + random.uniform(0.5, 2.0)
        index += 1
    return segments

def seed_database():
    print("Dropping all existing tables to apply new schema...")
    Base.metadata.drop_all(bind=engine)
    
    print("Initializing Database...")
    init_db()
    
    db = SessionLocal()

    print("Seeding default user...")
    default_user = models.User(name="Mohd. Abdullah", email="abdullah@example.com", avatar_url="", role="admin")
    db.add(default_user)
    db.commit()
    db.refresh(default_user)
    
    print("Seeding tags...")
    db_tags = []
    for tag_data in TAGS:
        tag = models.Tag(**tag_data)
        db.add(tag)
        db_tags.append(tag)
    db.commit()
    
    # 6 Meetings
    meetings_data = [
        {"title": "Q3 Product Roadmap Planning", "duration_seconds": 45*60, "type": "internal", "status": "completed", "date_offset": 0, "tags": ["Product", "Engineering"]},
        {"title": "Client Onboarding — Acme Corp", "duration_seconds": 12*60, "type": "external", "status": "completed", "date_offset": 1, "tags": ["Client"]},
        {"title": "Weekly Engineering Standup", "duration_seconds": 18*60, "type": "internal", "status": "completed", "date_offset": 2, "tags": ["Engineering"]},
        {"title": "Sales Demo — Enterprise Plan", "duration_seconds": 75*60, "type": "sales", "status": "completed", "date_offset": 3, "tags": ["Sales"]},
        {"title": "UX Research Interview — Mobile App", "duration_seconds": 40*60, "type": "interview", "status": "completed", "date_offset": 4, "tags": ["Research", "Design"]},
        {"title": "Sprint Retrospective — Team Alpha", "duration_seconds": 105*60, "type": "internal", "status": "processing", "date_offset": 5, "tags": ["Engineering", "Product"]},
    ]
    
    print("Seeding meetings and relationships...")
    now = datetime.utcnow()
    
    for idx, m_data in enumerate(meetings_data):
        meeting = models.Meeting(
            title=m_data["title"],
            date=now - timedelta(days=m_data["date_offset"]),
            duration_seconds=m_data["duration_seconds"],
            status=m_data["status"],
            meeting_type=m_data["type"],
            user_id=default_user.id,
            captured_from=random.choice(CAPTURED_FROM_OPTIONS),
            privacy=random.choice(PRIVACY_OPTIONS)
        )
        db.add(meeting)
        db.commit()
        db.refresh(meeting)
        
        # Tags
        for tag_name in m_data["tags"]:
            tag = next((t for t in db_tags if t.name == tag_name), None)
            if tag:
                meeting.tags.append(tag)
        
        # Participants
        num_participants = random.randint(3, 5)
        participants = []
        
        # Let's add Mohd Abdullah to half the meetings as host, and a quarter as participant
        # the rest he's not in.
        has_abdullah = False
        abdullah_role = "participant"
        if idx % 2 == 0:
            has_abdullah = True
            abdullah_role = "host"
        elif idx % 3 == 0:
            has_abdullah = True
            abdullah_role = "participant"
            
        host_assigned = False
        if has_abdullah:
            p = models.Participant(
                meeting_id=meeting.id,
                name="Mohd. Abdullah",
                email="abdullah@example.com",
                role=abdullah_role
            )
            db.add(p)
            participants.append(p)
            if abdullah_role == "host":
                host_assigned = True
            num_participants -= 1
            
        for i in range(num_participants):
            role = "participant"
            if not host_assigned and i == 0:
                role = "host"
                host_assigned = True
                
            p = models.Participant(
                meeting_id=meeting.id,
                name=f"Participant {idx}-{i+1}",
                email=f"p{idx}_{i+1}@example.com",
                role=role
            )
            db.add(p)
            participants.append(p)
        db.commit()
        
        # Transcripts
        if meeting.status == "completed":
            segs = generate_transcript(participants, meeting.duration_seconds, meeting.title)
            db_segments = []
            for seg in segs:
                db_seg = models.TranscriptSegment(**seg, meeting_id=meeting.id)
                db.add(db_seg)
                db_segments.append(db_seg)
            db.commit()
            
        # Summary (for all meetings)
        def get_outline(title, duration):
            if "Roadmap Planning" in title:
                return [
                    {"title": "Q3 Goals Review", "timestamp": duration // 6, "points": ["Discussed revenue targets", "Product expansion to EU"]},
                    {"title": "Resource Allocation", "timestamp": duration // 3, "points": ["Hiring 3 new engineers", "Re-allocating marketing budget"]},
                    {"title": "Timeline & Milestones", "timestamp": (duration * 2) // 3, "points": ["Beta release in August", "GA by October"]}
                ]
            elif "Onboarding" in title:
                return [
                    {"title": "Platform Setup", "timestamp": duration // 6, "points": ["Login issues fixed; add profile pic", "Link social handles for cert tagging"]},
                    {"title": "Event Management", "timestamp": duration // 3, "points": ["Create demo event with start/end date", "Upload participants via Excel with mandatory contact info"]},
                    {"title": "Certificate Design", "timestamp": (duration * 2) // 3, "points": ["Customize templates by deleting default text", "Add variables and multiple authorized signatures"]}
                ]
            elif "Standup" in title:
                return [
                    {"title": "Frontend Updates", "timestamp": duration // 6, "points": ["React 18 migration complete", "Fixed bugs in navigation"]},
                    {"title": "Backend Updates", "timestamp": duration // 3, "points": ["Database scaling issues", "API endpoints optimization"]},
                    {"title": "Blockers", "timestamp": (duration * 2) // 3, "points": ["Waiting on design for new dashboard", "Need approval for AWS budget"]}
                ]
            elif "Sales Demo" in title:
                return [
                    {"title": "Client Requirements", "timestamp": duration // 6, "points": ["Need SSO integration", "Custom reporting needed"]},
                    {"title": "Product Walkthrough", "timestamp": duration // 3, "points": ["Showed dashboard features", "Demonstrated role-based access"]},
                    {"title": "Pricing & Next Steps", "timestamp": (duration * 2) // 3, "points": ["Quoted $12k/year for Enterprise", "Sending contract by EOD"]}
                ]
            elif "UX Research" in title:
                return [
                    {"title": "User Background", "timestamp": duration // 6, "points": ["Heavy mobile user", "Uses app for task tracking"]},
                    {"title": "Usability Testing", "timestamp": duration // 3, "points": ["Struggled to find settings menu", "Found add task button intuitive"]},
                    {"title": "Feedback Summary", "timestamp": (duration * 2) // 3, "points": ["Wants dark mode", "Notifications are too frequent"]}
                ]
            else:
                return [
                    {"title": "Sprint Review", "timestamp": duration // 6, "points": ["Completed 85% of story points", "Carried over 2 tasks"]},
                    {"title": "What went well", "timestamp": duration // 3, "points": ["Good communication", "Fast code reviews"]},
                    {"title": "What to improve", "timestamp": (duration * 2) // 3, "points": ["Better estimation", "More automated testing"]}
                ]

        def get_overview(title):
            if "Roadmap Planning" in title:
                return "This meeting focused on the Q3 product roadmap and strategic goals. We discussed upcoming milestones for the new feature releases, allocated budget for the engineering team, and reviewed potential risks. The timeline for the EU expansion was finalized with a target launch in October. Overall, the team is aligned on prioritizing the core platform stability before scaling."
            elif "Onboarding" in title:
                return "We walked the client through the initial platform setup and covered the fundamentals of event management. Key topics included importing participant data, customizing certificate templates, and configuring automated email workflows. The client asked several questions regarding SSO integration which will be followed up by the technical team. By the end of the session, the client successfully created their first test event."
            elif "Standup" in title:
                return "The engineering team gathered for the weekly standup to discuss progress and blockers. Frontend reported completion of the React 18 migration, while backend highlighted some ongoing database scaling issues under heavy load. We identified a need to request additional AWS budget for the upcoming stress tests. The team agreed to pair program on the remaining dashboard bugs this afternoon."
            elif "Sales Demo" in title:
                return "This was a product demonstration for a prospective enterprise client focusing on our advanced reporting features. The client expressed strong interest in role-based access control and custom analytics dashboards. We discussed the pricing tiers and proposed the Enterprise plan at $12k/year to accommodate their large user base. Next steps involve sending the formal contract and security documentation for their IT review."
            elif "UX Research" in title:
                return "We conducted a usability testing session with a power user of our mobile app. The user navigated through the new task creation flow and provided feedback on the interface design. While they found the core functionality intuitive, they struggled slightly with discovering the advanced settings menu. The session concluded with the user requesting a dark mode option and more granular notification controls."
            else:
                return "This meeting covered general team updates and project status reviews. We went over recent accomplishments, identified areas for improvement, and set action items for the upcoming week. The discussion highlighted the importance of clear communication and maintaining a high velocity. Team members shared their individual progress and aligned on the next immediate goals."

        summary_outline = get_outline(meeting.title, meeting.duration_seconds)
        
        summary = models.Summary(
            meeting_id=meeting.id,
            overview=get_overview(meeting.title),
            short_summary=f"Brief summary of {meeting.title}.",
            outline=json.dumps(summary_outline),
            keywords=json.dumps(["important", "meeting", "update"])
        )
        db.add(summary)
            
        if meeting.status == "completed":
            # Action Items
            if "Roadmap Planning" in meeting.title:
                tasks = ["Hire 3 engineers", "Finalize Q3 budget", "Approve EU expansion plan"]
            elif "Onboarding" in meeting.title:
                tasks = ["Send SSO documentation", "Setup test event", "Upload participant list"]
            elif "Standup" in meeting.title:
                tasks = ["Review dashboard PR", "Request AWS budget increase", "Fix database scaling bug"]
            elif "Sales Demo" in meeting.title:
                tasks = ["Send enterprise contract", "Schedule technical deep dive", "Share security compliance doc"]
            elif "UX Research" in meeting.title:
                tasks = ["Create ticket for Dark Mode", "Redesign settings menu", "Adjust notification frequency"]
            else:
                tasks = ["Update sprint board", "Schedule retrospective", "Improve test coverage"]
                
            selected_tasks = random.sample(tasks, k=random.randint(2, min(3, len(tasks))))
            for task_text in selected_tasks:
                ai = models.ActionItem(
                    meeting_id=meeting.id,
                    text=task_text,
                    assignee=random.choice(participants).name,
                    is_completed=random.choice([0, 1])
                )
                db.add(ai)
                
            # Highlights & Comments
            if len(db_segments) > 0:
                for i in range(random.randint(1, 3)):
                    target_seg = random.choice(db_segments)
                    hl = models.Highlight(
                        meeting_id=meeting.id,
                        user_id=default_user.id,
                        segment_id=target_seg.id,
                        label=random.choice(["important", "action", "question", "positive"]),
                        note="Good point"
                    )
                    db.add(hl)
                    
                    target_seg2 = random.choice(db_segments)
                    comment = models.Comment(
                        meeting_id=meeting.id,
                        user_id=default_user.id,
                        segment_id=target_seg2.id,
                        text="This is a really important discussion."
                    )
                    db.add(comment)
                
            # Soundbites
            sb = models.Soundbite(
                meeting_id=meeting.id,
                title="Key Moment",
                start_time=10.0,
                end_time=30.0,
                user_id=default_user.id
            )
            db.add(sb)
            
        db.commit()
        
    print("Rebuilding FTS5 Search Index...")
    rebuild_search_index(db)
    
    print("Seeding complete!")
    db.close()

if __name__ == "__main__":
    seed_database()
