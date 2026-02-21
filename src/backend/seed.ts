import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Post from '../backend/models/posts'

dotenv.config()

const posts = [
  {
    title: "Getting Started with React",
    description: "Learn the fundamentals of React and build your first component based application from scratch.",
    category: "React",
    date: "Feb 12, 2026"
  },
  {
    title: "Mastering TypeScript",
    description: "A practical guide to TypeScript for JavaScript developers who want stronger typed code.",
    category: "TypeScript",
    date: "Feb 15, 2026"
  },
  {
    title: "UI Design with Material UI",
    description: "How to build clean, professional interfaces quickly using MUI components in React.",
    category: "MUI",
    date: "Feb 18, 2026"
  }
]

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(async () => {
    console.log('Connected to MongoDB')
    await Post.deleteMany()
    await Post.insertMany(posts)
    console.log('Posts seeded successfully!')
    process.exit()
  })
  .catch((err) => {
    console.error('Error:', err)
    process.exit(1)
  })