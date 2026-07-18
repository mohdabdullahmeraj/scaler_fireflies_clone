import json
from typing import Dict, Any

def generate_mock_summary(transcript_text: str) -> Dict[str, Any]:
    """
    Generates a mock summary for a given transcript text.
    In the future, this can be swapped with an OpenAI/Gemini API call.
    """
    # Simple word count to make it slightly dynamic
    word_count = len(transcript_text.split())
    
    overview = f"This was a productive meeting covering various topics. We discussed key issues and made decisions on how to move forward. The discussion spanned over {word_count} words and involved active participation."
    
    short_summary = "Productive discussion on key topics and next steps."
    
    outline = [
        {"title": "Introduction and Agenda", "timestamp": 0, "description": "Setting the stage for the meeting."},
        {"title": "Main Discussion", "timestamp": min(120, word_count/2), "description": "Deep dive into the primary topics."},
        {"title": "Action Items & Conclusion", "timestamp": min(600, word_count), "description": "Reviewing what needs to be done next."}
    ]
    
    keywords = ["planning", "roadmap", "action", "next steps"]
    
    return {
        "overview": overview,
        "short_summary": short_summary,
        "outline": json.dumps(outline),
        "keywords": json.dumps(keywords)
    }
