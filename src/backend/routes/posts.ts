import express, { type Request, type Response } from 'express'
import mongoose from 'mongoose'
import Post from '../models/posts'

const router = express.Router()

// GET all posts (optional query ?category=React)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category } = req.query
    const filter =
      category && typeof category === 'string' && category.toLowerCase() !== 'all'
        ? { category }
        : {}
    const posts = await Post.find(filter).sort({ createdAt: -1, _id: -1 })
    res.json(posts)
  } catch (err) {
    console.error('Error fetching posts:', err)
    res.status(500).json({ message: 'Server error while fetching posts' })
  }
})

// GET single post by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post ID format' })
    }

    const post = await Post.findById(id)
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }
    res.json(post)
  } catch (err) {
    console.error('Error fetching post:', err)
    res.status(500).json({ message: 'Server error while fetching post' })
  }
})

// POST a new post
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, category, date } = req.body

    if (
      typeof title !== 'string' ||
      !title.trim() ||
      typeof description !== 'string' ||
      !description.trim() ||
      typeof category !== 'string' ||
      !category.trim()
    ) {
      return res.status(400).json({
        message: 'Title, description, and category are required non-empty fields'
      })
    }

    const postDate = date || new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })

    const newPost = new Post({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      date: postDate
    })

    const saved = await newPost.save()
    res.status(201).json(saved)
  } catch (err) {
    console.error('Error creating post:', err)
    res.status(400).json({ message: 'Error creating post' })
  }
})

// DELETE a post by ID
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post ID format' })
    }

    const deleted = await Post.findByIdAndDelete(id)
    if (!deleted) {
      return res.status(404).json({ message: 'Post not found' })
    }
    res.json({ message: 'Post deleted successfully', id })
  } catch (err) {
    console.error('Error deleting post:', err)
    res.status(500).json({ message: 'Server error while deleting post' })
  }
})

export default router