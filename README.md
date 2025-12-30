# Video Generator Prototype

An end-to-end prototype that turns text prompts and optional image references into short videos. The stack combines a FastAPI backend for authentication and workflow orchestration, a Next.js frontend for the user experience, and MySQL for persistence. ComfyUI handles the underlying generation workflow, including prompt injection and metadata extraction.

## Architecture

- **Frontend:** Next.js 14 (App Router) with Tailwind styling and reusable UI components for landing, auth, and generation screens.【F:frontend/app/page.tsx†L1-L98】【F:frontend/app/video-generation/page.tsx†L1-L218】
- **Backend:** FastAPI service exposing user auth and video generation endpoints; integrates with ComfyUI for uploads, prompt execution, and metadata extraction.【F:backend/app/api/v1/endpoints/video.py†L1-L79】【F:backend/app/services/video_service.py†L1-L173】
- **Database:** MySQL accessed through SQLAlchemy ORM models for users and generated videos. Tables are created automatically on startup.【F:backend/app/models/user.py†L1-L46】【F:backend/app/models/video.py†L1-L53】
- **Containerization:** Dockerfiles for backend and frontend plus a `docker-compose.yml` wiring services (frontend, backend, MySQL).【F:docker-compose.yml†L1-L48】

## Features

- User registration and login with hashed passwords and HMAC-signed bearer tokens. Includes a `/users/me` helper to resolve the current user from a stored token.【F:backend/app/api/v1/endpoints/user.py†L1-L86】【F:backend/app/core/security.py†L1-L109】
- Video generation endpoint (`POST /api/v1/videos/generate`) that uploads an optional reference image to ComfyUI, injects prompts into a workflow, waits for results, extracts metadata, and persists the record.【F:backend/app/api/v1/endpoints/video.py†L12-L79】【F:backend/app/services/video_service.py†L44-L173】
- Frontend flows for landing, sign-up, login, and a video generation workspace with prompt inputs, asset upload, and inline playback of generated videos.【F:frontend/app/log-in/page.tsx†L1-L82】【F:frontend/app/sign-up/page.tsx†L1-L90】【F:frontend/app/video-generation/page.tsx†L1-L218】
- Reusable UI primitives (e.g., `Button`, `VideoPlayer`) to keep pages concise and consistent.【F:frontend/components/Button.tsx†L1-L43】【F:frontend/components/VideoPlayer/VideoPlayer.tsx†L1-L122】

## Repository Structure

```
.
├── backend/                 # FastAPI service
│   ├── app/
│   │   ├── api/             # Versioned routers and endpoints
│   │   ├── core/            # Settings and security helpers
│   │   ├── db/              # SQLAlchemy base/session
│   │   ├── models/          # ORM models
│   │   ├── schemas/         # Pydantic schemas
│   │   └── services/        # Business logic (auth, video)
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                # Next.js app
│   ├── app/                 # App Router pages
│   ├── components/          # Shared UI components
│   ├── services/            # API client utilities
│   └── styles/              # Tailwind styles
├── docker-compose.yml       # Orchestration for frontend, backend, MySQL
└── README.md                # You are here
```

## Prerequisites

- Docker and Docker Compose (recommended for the full stack).
- Node.js 18+ and npm (if running the frontend without containers).
- Python 3.11 with pip (if running the backend without containers).
- Access to a ComfyUI instance reachable at `http://host.docker.internal:8188` (default used by the backend).

## Environment Variables

Create a `.env` file in the repository root (used by Docker Compose) with values similar to:

```env
# Backend security
SECRET_KEY=change-me
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database configuration (kept in sync across services)
MYSQL_USER=video_user
MYSQL_PASSWORD=userpassword
MYSQL_DATABASE=video_db
MYSQL_HOST=mysql
MYSQL_PORT=3306
MYSQL_ROOT_PASSWORD=password

# CORS / frontend origins (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000
```

When running services outside Docker, point `MYSQL_HOST` and `MYSQL_PORT` to your local database host/port.

## Running with Docker Compose (recommended)

```bash
# From the repo root
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8000 (FastAPI)
- MySQL: port 3307 on the host (mapped to container 3306)

The backend automatically creates tables on startup via SQLAlchemy metadata.【F:backend/app/main.py†L1-L16】

## Running the Backend Locally (without Docker)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Ensure MySQL is running and accessible using the credentials from `.env`. The service depends on ComfyUI at `http://host.docker.internal:8188`; adjust `COMFY_URL` in `app/services/video_service.py` if needed.【F:backend/app/services/video_service.py†L1-L40】

## Running the Frontend Locally (without Docker)

```bash
cd frontend
npm install
npm run dev
```

By default, API calls target `http://localhost:8000` (set in `services/*Service.ts`). Update those constants if your backend runs elsewhere.【F:frontend/services/user/userService.ts†L23-L67】【F:frontend/services/video/videoService.ts†L24-L74】

## API Quickstart

- **Register:** `POST /api/v1/users/register` with `{ "email", "username", "password" }` → user record.【F:backend/app/api/v1/endpoints/user.py†L15-L43】
- **Login:** `POST /api/v1/users/login` with `{ "email", "password" }` → bearer token.【F:backend/app/api/v1/endpoints/user.py†L46-L71】
- **Current user:** `GET /api/v1/users/me` with `Authorization: Bearer <token>` → authenticated user.【F:backend/app/api/v1/endpoints/user.py†L74-L109】
- **Generate video:** `POST /api/v1/videos/generate` as `multipart/form-data` with `user_id`, `positive_prompt`, optional `negative_prompt`, and optional `image` upload → stored video metadata plus source URL.【F:backend/app/api/v1/endpoints/video.py†L12-L79】

## Frontend Usage Flow

1. **Sign up or log in** to obtain and persist the auth token in `localStorage`.【F:frontend/app/log-in/page.tsx†L9-L66】【F:frontend/services/user/userService.ts†L1-L67】
2. **Open `/video-generation`**, enter prompts, optionally upload an image, and trigger generation. The page polls the backend response and renders the returned video URL. Metadata is displayed in the side panel.【F:frontend/app/video-generation/page.tsx†L55-L218】
3. **Playback controls** are available via the shared `VideoPlayer` component if you choose to integrate it in additional views.【F:frontend/components/VideoPlayer/VideoPlayer.tsx†L1-L122】

## Testing

- Backend: `pytest` (from `backend/`) for Python unit tests when present.
- Frontend: `npm test` or `npm run lint` (from `frontend/`) for JS/TS checks.

## Troubleshooting

- **CORS issues:** Set `ALLOWED_ORIGINS` in `.env` to include your frontend origin(s).【F:backend/app/core/config.py†L10-L74】
- **Database connectivity:** Verify MySQL credentials/ports match `.env` and that the container or local service is reachable.
- **ComfyUI connectivity:** Ensure the ComfyUI API is reachable at the configured host; adjust `COMFY_URL` if running elsewhere.【F:backend/app/services/video_service.py†L1-L40】
