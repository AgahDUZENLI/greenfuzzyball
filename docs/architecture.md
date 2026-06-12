# 3. Architecture Diagram

![[CoachPilot-Architecture.png]]

### Overview
CoachPilot is a self-hosted full-stack web application running on a
home server. All services run as Docker containers managed by Docker
Compose, making the setup fully reproducible and portable.

### Stack
| Layer          | Technology       | Role                                |
| -------------- | ---------------- | ----------------------------------- |
| Frontend       | React            | Web UI served by Nginx              |
| Reverse proxy  | Nginx            | Serves React, forwards API requests |
| Backend        | FastAPI (Python) | REST API, business logic, JWT auth  |
| Database       | PostgreSQL       | Persistent data storage             |
| Infrastructure | Docker Compose   | Container orchestration             |
| Server         | Arch Linux       | Self-hosted home server             |

### How a request flows
1. User opens the app in a browser or mobile device
2. Request hits Nginx over HTTPS
3. Nginx serves the React frontend for UI requests
4. API requests are forwarded to FastAPI
5. FastAPI authenticates the request via JWT
6. FastAPI queries PostgreSQL and returns the response
7. React renders the data

### Docker Compose services
```yaml
services:
  nginx:      # Reverse proxy + static file server
  fastapi:    # Python API backend
  postgres:   # Database with persistent volume
```

### Phase 2 — Mobile
The FastAPI backend is designed to serve both web and mobile clients
from day one. When the React Native or Flutter mobile app is built,
it connects to the same REST API with no backend changes needed.