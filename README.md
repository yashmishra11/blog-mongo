# Blog-Mongo

A modern, full-stack blog platform built with **React 19**, **TypeScript**, **Material UI (MUI)**, **Express 5**, and **MongoDB**. Designed with a clean architecture, live MongoDB Atlas integration, optimistic UI updates, and graceful offline fallback capabilities.

---

## 🚀 Features

- **Full CRUD Functionality:**
  - **Create:** Publish new articles via an interactive modal with form validation.
  - **Read:** Browse posts with category tags, publication dates, and a dedicated "Read More" modal.
  - **Update:** Edit existing articles with instant state synchronization.
  - **Delete:** Remove posts with optimistic UI updates and immediate feedback.
- **Search & Category Filtering:**
  - Real-time search across article titles and content.
  - One-click filtering by category tags (*React, TypeScript, MUI, MongoDB, Node.js, CSS*).
- **Resilient & Offline-Ready:**
  - Built-in graceful degradation: automatically serves built-in demo posts if MongoDB or backend server is unavailable.
  - Automatic MongoDB reconnection attempts and health check endpoint (`/api/health`).
- **Interactive UI & Polish:**
  - Polished Material UI components with Inter typography and custom palette.
  - Seamless navigation between **Home**, **Categories / Topics**, and **About** pages.
  - Interactive newsletter subscription dialog.
  - Toast notifications (Snackbars) for successful actions and error states.
- **Graceful Lifecycle & Shutdown:**
  - Backend handles `SIGINT` / `SIGTERM` signals for clean server termination and MongoDB connection teardown.

---

## 🛠 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Material UI (MUI v7), Emotion, Vite 7 |
| **Backend** | Node.js, Express 5, TypeScript (`tsx`), CORS, Dotenv |
| **Database** | MongoDB Atlas via Mongoose 9 |
| **Tooling** | Concurrently, Nodemon, TypeScript compiler (`tsc`) |

---

## 📁 Project Structure

```text
blog-mongo/
├── src/
│   ├── backend/
│   │   ├── models/
│   │   │   └── posts.ts          # Mongoose schema and model definition
│   │   ├── routes/
│   │   │   └── posts.ts          # RESTful endpoints for posts (CRUD)
│   │   ├── seed.ts               # Database seed script with sample articles
│   │   └── server.ts             # Express server setup, MongoDB connection & shutdown hooks
│   ├── App.tsx                   # Main React frontend with full state & UI
│   ├── main.tsx                  # React entry point with MUI ThemeProvider
│   └── style.css                 # Base styles and Google Fonts import
├── .env.example                  # Environment configuration template
├── package.json                  # Scripts and dependencies
├── tsconfig.json                 # TypeScript compiler configuration
└── vite.config.ts                # Vite dev server and backend API proxy
```

---

## 🔌 API Reference

The backend runs on `http://localhost:5000` (or `PORT` defined in `.env`). In development, Vite proxies requests from `/api` to the backend automatically.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service and MongoDB connection health check |
| `GET` | `/api/posts` | Fetch all posts (supports `?category=<category>` query) |
| `GET` | `/api/posts/:id` | Fetch single post by ID |
| `POST` | `/api/posts` | Create a new post (`{ title, description, category, date? }`) |
| `PUT` | `/api/posts/:id` | Update an existing post (`{ title?, description?, category? }`) |
| `DELETE` | `/api/posts/:id` | Delete a post by ID |

---

## 🏁 Getting Started

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm** or **yarn**
- **MongoDB** (MongoDB Atlas connection string or local MongoDB instance)

### 2. Installation
Clone the repository and install all dependencies:
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Configure your environment variables in `.env`:
```env
# MongoDB Atlas connection string (or local mongodb://localhost:27017/blog-mongo)
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/blog-mongo?retryWrites=true&w=majority

# Backend port (default 5000)
PORT=5000

# Optional: Custom frontend API URL (defaults to /api/posts via Vite proxy)
# VITE_API_URL=http://localhost:5000/api/posts
```

> **Note:** If `MONGO_URI` is omitted or disconnected, the backend logs a warning and the frontend automatically switches to demo mode with fallback sample articles.

### 4. (Optional) Seed the Database
Populate your MongoDB database with sample articles:
```bash
npm run seed
```

---

## 💻 Running the Application

### Option A: Run Full Stack (Recommended)
Runs both the backend and frontend concurrently in one command:
```bash
npm run dev:all
```
- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

### Option B: Run in Separate Terminals
1. **Terminal 1 (Backend):**
   ```bash
   npm run backend
   ```
2. **Terminal 2 (Frontend):**
   ```bash
   npm run dev
   ```

---

## 🛑 Stopping & Closing the Project

- **Stopping the servers:** Press `Ctrl + C` in the running terminal. The backend will cleanly close the active HTTP server and terminate the MongoDB connection gracefully.
- **Closing the workspace:** When processes are stopped and git changes are committed, the IDE or terminal can be safely closed at any time without risk of orphaned background tasks or data corruption.

---

## 📜 Available NPM Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `npm run dev:all` | `concurrently ...` | Runs backend and frontend together with colored output |
| `npm run dev` | `vite` | Starts the Vite React frontend dev server (`:5173`) |
| `npm run backend` | `nodemon --exec tsx src/backend/server.ts` | Starts Express backend with auto-reload (`:5000`) |
| `npm run seed` | `tsx src/backend/seed.ts` | Seeds MongoDB database with initial sample posts |
| `npm run build` | `tsc && vite build` | Typechecks and bundles frontend for production |
| `npm run preview` | `vite preview` | Previews production build locally |
