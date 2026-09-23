# Blog-Mongo

A modern full-stack blog platform built with React, TypeScript, Material UI, Express, and MongoDB.

## Tech Stack

- **Frontend:** React 19, TypeScript, Material UI (MUI), Vite
- **Backend:** Node.js, Express, tsx
- **Database:** MongoDB Atlas via Mongoose

## Features

- **Live MongoDB Integration:** Fetch, create, and delete blog posts via REST API.
- **Offline & Demo Fallback:** Automatically falls back gracefully to demo posts when backend is offline or starting up.
- **Category Filtering:** Filter posts by topic (React, TypeScript, MUI, MongoDB, etc.).
- **Interactive UI:**
  - Modern modal dialog with Material UI form validation for publishing articles.
  - "Read More" article modal view.
  - Delete post capability with instant optimistic UI update.
  - Multi-page navigation (Home, Topics/Categories, About) with synchronized header and footer links.
  - Polished Inter typography and custom Material UI theme.

## Running Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your MongoDB connection string:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/blog-mongo?retryWrites=true&w=majority
   PORT=5000
   ```

3. **(Optional) Seed initial posts:**
   ```bash
   npm run seed
   ```

4. **Start the application (Full Stack with one command):**
   ```bash
   npm run dev:all
   ```
   *Or start them in separate terminals if preferred:*
   ```bash
   npm run backend  # Starts Express on http://localhost:5000
   npm run dev      # Starts Vite React dev server on http://localhost:5173
   ```

