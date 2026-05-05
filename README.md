# Team Task Manager - MERN

Full-stack MERN assignment project with separate `frontend` and `backend` folders.

## Stack

- Frontend: React, Vite, Axios, React Hot Toast, Lucide icons
- Backend: Node.js, Express.js
- Database: MongoDB Atlas with Mongoose
- Auth: JWT and bcrypt
- Validation: express-validator and Mongoose

## Single API URL File

Change frontend API base URL in one place:

```text
frontend/src/api/config.js
```

Or set it in `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Backend Setup

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Add MongoDB Atlas details in `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/team_task_manager?retryWrites=true&w=majority
JWT_SECRET=change-this-long-random-secret
CLIENT_URL=http://localhost:5173
```

## Frontend Setup

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Open `http://localhost:5173`.

## Root Commands

```bash
npm run install:all
npm run backend
npm run frontend
```

## Features

- Signup and login with JWT
- Hashed passwords
- Project creation with creator as Admin
- Admin add/remove members
- Admin create, assign, update, delete tasks
- Members view/update only assigned tasks
- Dashboard totals, status counts, per-user count, overdue tasks
- Controller-based backend responses with proper status codes
- Toast success/error messages in React

## Main API Routes

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:projectId`
- `POST /api/projects/:projectId/members`
- `DELETE /api/projects/:projectId/members/:userId`
- `GET /api/tasks`
- `POST /api/tasks`
- `PATCH /api/tasks/:taskId`
- `DELETE /api/tasks/:taskId`
- `GET /api/dashboard`
