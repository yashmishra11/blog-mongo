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
  console.warn('\n⚠️  [server] Missing MONGO_URI in environment variables!')
  console.warn('Backend server running in offline/demo mode without MongoDB connection.\n')
}

// Connect to MongoDB asynchronously with auto-retry
const connectDB = async () => {
  if (!mongoUri) {
    console.error('\n⚠️  [server] Missing MONGO_URI in environment variables!')
    console.error('Please configure MONGO_URI in your .env file.\n')
    return
  }

  try {
    await mongoose.connect(mongoUri)
    console.log(' Connected to MongoDB')
  } catch (err) {
    console.error('❌ MongoDB initial connection error:', err)
    console.log(' Retrying MongoDB connection in 5 seconds...')
    setTimeout(connectDB, 5000)
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected')
})

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected')
})

// Start server and begin database connection
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  connectDB()
})

// Graceful shutdown
const handleShutdown = async () => {
  console.log('\nClosing server and database connections...')
  try {
    await mongoose.connection.close()
  } catch {
    // Ignore error on close
  }
  server.close(() => {
    process.exit(0)
  })
}

process.on('SIGINT', handleShutdown)
process.on('SIGTERM', handleShutdown)