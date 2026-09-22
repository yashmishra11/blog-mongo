import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Post from './models/posts'

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

const mongoUri = process.env.MONGO_URI
if (!mongoUri) {
  console.error('\n⚠️  [seed] Missing MONGO_URI in environment variables!')
  console.error('Please configure MONGO_URI in your .env file.\n')
  process.exit(1)
}

mongoose
  .connect(mongoUri)
  .then(async () => {
    console.log(' Connected to MongoDB')
    await Post.deleteMany({})
    await Post.insertMany(posts)
    console.log('✨ Posts seeded successfully!')
    process.exit(0)
  })
  .catch((err) => {
    console.error('❌ Error during seeding:', err)
    process.exit(1)
  })