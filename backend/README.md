# Backend API (Express)

Simple Express server providing basic demo endpoints.

## Tech Stack
- Node.js (ES Modules)
- Express 5
- Middleware: cors, morgan, dotenv

## Environment
Create a `.env` file (already added) to override defaults:
```
PORT=3001
```
Default port: 3001

## Scripts
| Script | Description |
|--------|-------------|
| `npm start` | Run server once |
| `npm run dev` | Run server with watch / auto-restart (Node --watch) |

## Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | API root, lists endpoints |
| GET | `/hello` | Returns greeting + timestamp |
| GET | `/health` | Health check |

### Example Response `/hello`
```json
{
  "message": "Hello from Wendor Backend!",
  "timestamp": "2025-11-11T10:00:00.000Z"
}
```

## Run Locally
```bash
cd backend
npm install   # (first time only)
npm start
# or for auto reload
npm run dev
```
Then visit: http://localhost:3001/hello

## Folder Structure
```
backend/
  server.js
  package.json
  .env
  README.md
```

## Future Ideas
- Add validation & error handler middleware
- Add versioned API prefix `/api/v1`
- Integrate with VMC mock service
