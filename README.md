# Blog-Mongo

A full-stack blog homepage built as a learning project.

## Tech Stack

- **Frontend:** React, TypeScript, Material UI, Vite
- **Backend:** Node.js, Express, tsx
- **Database:** MongoDB Atlas via Mongoose

## Features

- Fetch blog posts from MongoDB
- Add new posts from the frontend
- Multi-page navigation (Home, Categories, About)
- Responsive layout

## Running Locally

1. Clone the repo
2. Run `npm install`
3. Create a `.env` file in the root with your MongoDB URI:
```
   MONGO_URI=your_connection_string_here
   PORT=5000
```
4. Start the backend: `npm run backend`
5. Start the frontend: `npm run dev`
