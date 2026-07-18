export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface Participant {
  id: number;
  meeting_id: number;
  name: string;
  email: string | null;
  avatar_color: string | null;
  role: string | null;
}

export interface Meeting {
  id: number;
  title: string;
  date: string;
  duration_seconds: number;
  status: 'completed' | 'processing' | 'scheduled';
  meeting_type: 'internal' | 'external' | 'interview' | 'sales';
  audio_url: string | null;
  video_url: string | null;
  user_id: number;
  created_at: string;
  updated_at: string;
  participants: Participant[];
  tags: Tag[];
  action_items?: ActionItem[];
  summary?: Summary;
}

export interface SearchResult {
  meeting_id: int;
  title: string;
  snippet: string;
}

export interface TranscriptSegment {
  id: number;
  meeting_id: number;
  participant_id: number | null;
  speaker_name: string;
  start_time: number;
  end_time: number;
  text: string;
  segment_index: number;
}

export interface Summary {
  id: number;
  meeting_id: number;
  overview: string;
  short_summary: string;
  outline: string; // JSON
  keywords: string; // JSON
  created_at: string;
}

export interface ActionItem {
  id: number;
  meeting_id: number;
  text: string;
  assignee: string | null;
  is_completed: number; // 0 or 1
  due_date: string | null;
  timestamp: number | null;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: number;
  meeting_id: number;
  user_id: number;
  segment_id: number | null;
  text: string;
  timestamp: number | null;
  created_at: string;
}

export interface Highlight {
  id: number;
  meeting_id: number;
  user_id: number;
  segment_id: number | null;
  label: 'important' | 'action' | 'question' | 'positive';
  note: string | null;
  created_at: string;
}

export interface Soundbite {
  id: number;
  meeting_id: number;
  user_id: number;
  title: string;
  start_time: number;
  end_time: number;
  segment_id_start: number | null;
  segment_id_end: number | null;
  created_at: string;
}
