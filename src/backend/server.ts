import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import postRoutes from './routes/posts'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  })
})

// Routes
app.use('/api/posts', postRoutes)

const mongoUri = process.env.MONGO_URI

if (!mongoUri) {
  console.error('\n⚠️  [server] Missing MONGO_URI in environment variables!')
  console.error('Please configure MONGO_URI in your .env file.\n')
  process.exit(1)
}

// Connect to MongoDB then start server
mongoose
  .connect(mongoUri)
  .then(() => {
    console.log(' Connected to MongoDB')
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err)
  })