import express, { type Request, type Response } from 'express'
import Post from '../models/posts'

const router = express.Router()

// GET all posts
router.get('/', async (_req: Request, res: Response) => {
  try {
    const posts = await Post.find()
    res.json(posts)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// POST a new post
router.post('/', async (req: Request, res: Response) => {
  try {
    const newPost = new Post(req.body)
    const saved = await newPost.save()
    res.status(201).json(saved)
  } catch (err) {
    res.status(400).json({ message: 'Error creating post' })
  }
})

export default router