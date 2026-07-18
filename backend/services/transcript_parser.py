import json
from typing import List, Dict

def parse_transcript_file(file_contents: str, filename: str) -> List[Dict]:
    """
    Parses an uploaded transcript file (.txt, .vtt, .json) into a standardized format.
    Returns a list of dicts: {"speaker": str, "start": float, "end": float, "text": str}
    """
    ext = filename.split('.')[-1].lower()
    
    if ext == 'json':
        try:
            data = json.loads(file_contents)
            # Expecting array of objects
            parsed = []
            for item in data:
                parsed.append({
                    "speaker": item.get("speaker", "Unknown"),
                    "start": float(item.get("start", 0.0)),
                    "end": float(item.get("end", 0.0)),
                    "text": item.get("text", "")
                })
            return parsed
        except Exception:
            pass # Fallback to empty
            
    elif ext == 'vtt':
        return parse_vtt(file_contents)
        
    else: # txt or unknown
        return parse_txt(file_contents)
        
    return []

def parse_vtt(contents: str) -> List[Dict]:
    # Very basic VTT parser
    lines = contents.strip().split('\n')
    parsed = []
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if '-->' in line:
            # Parse timestamps
            # e.g. 00:00:00.000 --> 00:00:05.000
            parts = line.split('-->')
            if len(parts) == 2:
                start_time = _vtt_time_to_seconds(parts[0].strip())
                end_time = _vtt_time_to_seconds(parts[1].strip())
                
                # Next line is usually the text. Sometimes it has speaker format <v Speaker Name> text
                i += 1
                text_line = ""
                speaker = "Unknown"
                if i < len(lines) and lines[i].strip():
                    text_line = lines[i].strip()
                    if text_line.startswith('<v '):
                        speaker_end = text_line.find('>')
                        if speaker_end != -1:
                            speaker = text_line[3:speaker_end].strip()
                            text_line = text_line[speaker_end+1:].strip()
                
                parsed.append({
                    "speaker": speaker,
                    "start": start_time,
                    "end": end_time,
                    "text": text_line
                })
        i += 1
    
    return parsed

def parse_txt(contents: str) -> List[Dict]:
    # Very basic TXT parser (Speaker: Text format)
    lines = contents.strip().split('\n')
    parsed = []
    current_time = 0.0
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        speaker = "Unknown"
        text = line
        
        # Check for Speaker: format
        if ':' in line:
            parts = line.split(':', 1)
            # If the part before colon is short, it's likely a speaker name
            if len(parts[0]) < 25 and not parts[0].replace(':', '').isdigit():
                speaker = parts[0].strip()
                text = parts[1].strip()
                
        # Estimate duration based on word count (approx 150 words per minute -> 2.5 words/sec)
        word_count = len(text.split())
        duration = max(word_count / 2.5, 2.0) # minimum 2 seconds
        
        parsed.append({
            "speaker": speaker,
            "start": current_time,
            "end": current_time + duration,
            "text": text
        })
        
        current_time += duration + 0.5 # gap between segments
        
    return parsed

def _vtt_time_to_seconds(time_str: str) -> float:
    # 00:00:00.000 or 00:00.000
    try:
        parts = time_str.split(':')
        seconds = 0.0
        if len(parts) == 3: # HH:MM:SS.ms
            seconds += int(parts[0]) * 3600
            seconds += int(parts[1]) * 60
            seconds += float(parts[2])
        elif len(parts) == 2: # MM:SS.ms
            seconds += int(parts[0]) * 60
            seconds += float(parts[1])
        return seconds
    except:
        return 0.0
