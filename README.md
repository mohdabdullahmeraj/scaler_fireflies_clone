# Fireflies.ai Clone

A full-stack, meticulously designed web application that mimics the core functionalities and aesthetics of [Fireflies.ai](https://fireflies.ai/). This project was built with a focus on delivering a premium user experience, robust architecture, and clean code principles.

It enables users to manage meetings, interact with rich transcripts, generate AI-like summaries, track action items, and perform global full-text searches.

---

## Live Deployment Links
- **Frontend (App):** [https://fireflies-frontend.onrender.com/](https://fireflies-frontend.onrender.com/)
- **Backend (API):** [https://fireflies-backend-etqu.onrender.com/](https://fireflies-backend-etqu.onrender.com/)

---

## Key Features & Functionality
*This section highlights the core functionality requirements of the evaluation.*

- **Interactive Meeting Transcripts**: A dynamic, scrollable transcript view where users can click to navigate audio, add highlights, and leave timestamped comments (Soundbites).
- **AI Summary & Notes Panel**: A dedicated section for Meeting Overviews, Outlines, Action Items, and AI Skills (mimicking AskFred).
- **Global Full-Text Search**: Instantly search across all meeting titles and transcript segments using an optimized SQLite FTS5 index.
- **Task Management**: Track action items extracted from meetings, toggle their completion status, and view them on a dedicated Tasks dashboard.
- **Premium UI/UX (Dark Mode Ready)**: A beautiful, responsive 4-pane layout that perfectly matches the original app. Complete with micro-animations, glassmorphism, and a seamless Light/Dark mode toggle.

---

## Architecture & Tech Stack
*Designed for performance, scalability, and maintainability.*

### **Frontend (Next.js & React)**
- **Framework:** Next.js (App Router) with React 18
- **Language:** TypeScript for type safety
- **Styling:** Tailwind CSS (Vanilla CSS for global tokens) with `next-themes` for robust Dark Mode support.
- **State Management & Data Fetching:** `@tanstack/react-query` for caching, background synchronization, and optimistic UI updates.
- **Icons & UI:** `lucide-react`

### **Backend (FastAPI & Python)**
- **Framework:** FastAPI for high-performance, asynchronous REST APIs.
- **Database:** SQLite (lightweight, zero-config).
- **ORM:** SQLAlchemy for robust, Pythonic database interactions.
- **Search Engine:** SQLite FTS5 (Full-Text Search) for rapid text querying.

---

## Evaluation Criteria Highlights

Here is how this project directly addresses the evaluation criteria:

### 1. Functionality
All core features are implemented. The interactive transcript maps segments to timestamps, and the summary views dynamically update. The global search functions seamlessly, retrieving context-aware snippets from anywhere in the database.

### 2. UI/UX
The UI closely mirrors Fireflies.ai's aesthetic. We implemented a fixed "4-pane layout" for the Meeting Details page, preventing global scroll and keeping interactions focused. It includes customized scrollbars, a responsive audio player, sticky headers, hover states, and a fully realized Dark Mode.

### 3. Database Design
The schema is highly relational and normalized:
- **`Meeting`** is the central entity.
- **`TranscriptSegment`**, **`Summary`**, **`ActionItem`**, **`Highlight`**, **`Comment`**, and **`Soundbite`** all maintain `ON DELETE CASCADE` foreign keys back to `Meeting`.
- **Many-to-Many Relationships**: `Meeting` and `Tag` are linked via a junction table `meeting_tags`.
- **FTS5 Integration**: A dedicated virtual table (`meeting_search`) uses triggers to automatically sync inserts, updates, and deletes from the core tables, ensuring search is always up to date without complex application logic.

### 4. Backend / API Design
The API follows RESTful conventions with clean, predictable routes.
- Modularized routing (`routers/meetings.py`, `routers/action_items.py`, etc.).
- Pydantic schemas (`schemas.py`) strictly validate incoming requests and outgoing responses.
- Database sessions are managed via FastAPI dependency injection (`get_db`).

### 5. Code Quality & Modularity
- **Separation of Concerns:** The frontend is deeply componentized. Large views are broken down into `NotesPanel.tsx`, `TranscriptPanel.tsx`, `MeetingHeader.tsx`, and `AudioPlayer.tsx`.
- **Reusable Components:** Shared logic (like the API client `apiClient.ts` or UI modals) is extracted for reuse.
- **Clean Code:** Variables are descriptively named, TypeScript interfaces (`types/index.ts`) enforce strict typing across the frontend, and files are kept small and focused.

---

## Database Schema Overview

```text
User 
 ├── id, name, email, role

Meeting 
 ├── id, title, date, duration_seconds, status, type
 ├── user_id (FK -> User)
 │
 ├── Participants (One-to-Many)
 │    └── id, name, email, role
 │
 ├── TranscriptSegments (One-to-Many)
 │    └── id, speaker_name, start_time, end_time, text
 │
 ├── ActionItems (One-to-Many)
 │    └── id, text, assignee, is_completed
 │
 ├── Summaries (One-to-One)
 │    └── id, overview, short_summary, outline, keywords
 │
 ├── Comments / Highlights / Soundbites (One-to-Many)
 │
 └── Tags (Many-to-Many via meeting_tags junction table)
```

---

## API Overview

### Meetings
- `GET /meetings/` - List all meetings (Supports filters: `status`, `date_from`, `date_to`)
- `GET /meetings/{id}` - Get full meeting details (includes nested relations)
- `PATCH /meetings/{id}` - Update meeting metadata
- `DELETE /meetings/{id}` - Delete meeting (cascades to all related data)

### Interactions & Notes
- `POST /meetings/{id}/action-items/` - Add an action item
- `PATCH /action-items/{id}/toggle` - Toggle task completion
- `DELETE /action-items/{id}` - Delete a task
- `POST /meetings/{id}/comments/` - Add a timestamped comment
- `POST /meetings/{id}/soundbites/` - Add a soundbite/clip

### Search
- `GET /search?q={query}` - Returns full-text search results with HTML-highlighted snippets spanning titles and transcript segments.

---

## Setup & Installation Guide

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.9 or higher)

### 1. Backend Setup

Open a terminal and navigate to the backend directory:
```bash
cd backend
```

Create and activate a virtual Python environment:
```bash
# Windows:
python -m venv venv
venv\Scripts\activate

# Mac/Linux:
python3 -m venv venv
source venv/bin/activate
```

Install the dependencies:
```bash
pip install fastapi uvicorn sqlalchemy pydantic
```

**Seed the Database:**
This will initialize SQLite, create the schema (including FTS triggers), and populate it with rich, contextual mock data.
```bash
python seed.py
```

Start the FastAPI server:
```bash
uvicorn main:app --reload --port 8000
```
*The API is now running at `http://localhost:8000` (Swagger docs at `http://localhost:8000/docs`).*

### 2. Frontend Setup

Open a new terminal window and navigate to the frontend directory:
```bash
cd frontend
```

Install NPM dependencies:
```bash
npm install
```

Start the Next.js development server:
```bash
npm run dev
```
*The application is now running at `http://localhost:3000`.*
