import React, { useState, useEffect } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  CardActions,
  Chip,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  CircularProgress,
  Container,
  Divider,
  Paper,
  InputAdornment
} from '@mui/material'

export type BlogPost = {
  _id: string
  title: string
  description: string
  category: string
  date: string
}

const CATEGORIES = ['All', 'React', 'TypeScript', 'MUI', 'MongoDB', 'Node.js', 'CSS']

const DEFAULT_POSTS: BlogPost[] = [
  {
    _id: 'default-1',
    title: 'Getting Started with React 19',
    description: 'Learn the fundamentals of modern React and build reactive component-driven applications with ease.',
    category: 'React',
    date: 'Feb 12, 2026'
  },
  {
    _id: 'default-2',
    title: 'Mastering TypeScript in 2026',
    description: 'A comprehensive, practical guide for JavaScript developers seeking rock-solid type safety and clean architecture.',
    category: 'TypeScript',
    date: 'Feb 15, 2026'
  },
  {
    _id: 'default-3',
    title: 'Modern UI Design with Material UI',
    description: 'Build polished, accessible, and responsive user interfaces effortlessly with the latest MUI component library.',
    category: 'MUI',
    date: 'Feb 18, 2026'
  },
  {
    _id: 'default-4',
    title: 'Full-Stack Data Modeling with MongoDB',
    description: 'Design flexible schemas and build performant backend APIs using Mongoose and Express.',
    category: 'MongoDB',
    date: 'Feb 20, 2026'
  }
]

// Determine API base URL with environment variable support and Vite dev proxy fallback
const API_URL = (import.meta.env.VITE_API_URL as string) || '/api/posts'

function App() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [page, setPage] = useState<'home' | 'categories' | 'about'>('home')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [backendOffline, setBackendOffline] = useState(false)

  // Dialog & Form states
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [readPostModal, setReadPostModal] = useState<BlogPost | null>(null)
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false)
  const [subscriberEmail, setSubscriberEmail] = useState('')
  const [newPost, setNewPost] = useState({
    title: '',
    description: '',
    category: 'React'
  })

  // Feedback notifications
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'warning' | 'error' }>({
    open: false,
    message: '',
    severity: 'info'
  })

  // Fetch posts safely with fallback to sample data if backend is offline
  const fetchPosts = async () => {
    try {
      setLoading(true)
      // Timeout after 4 seconds so user is never frozen waiting on cold starts
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 4000)

      const res = await fetch(API_URL, { signal: controller.signal })
      clearTimeout(timeoutId)

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`)
      }

      const data = await res.json()
      if (Array.isArray(data)) {
        setPosts(data)
        setBackendOffline(false)
      } else {
        throw new Error('API response is not an array')
      }
    } catch (err) {
      console.warn('Backend unavailable or timed out, using fallback demo data:', err)
      setBackendOffline(true)
      setPosts(DEFAULT_POSTS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPost.title.trim() || !newPost.description.trim() || !newPost.category) {
      setSnackbar({
        open: true,
        message: 'Please fill in all fields before publishing.',
        severity: 'warning'
      })
      return
    }

    setSubmitting(true)
    const postDate = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })

    const payload = {
      title: newPost.title.trim(),
      description: newPost.description.trim(),
      category: newPost.category,
      date: postDate
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 4000)

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      if (res.ok) {
        const saved: BlogPost = await res.json()
        setPosts((prev) => [saved, ...prev])
        setSnackbar({ open: true, message: '🎉 Post published successfully to MongoDB!', severity: 'success' })
      } else {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || 'Failed to save to backend')
      }
    } catch (err: unknown) {
      // Offline fallback: save locally so user can immediately test UI flow
      const localPost: BlogPost = {
        _id: 'local-' + Date.now(),
        ...payload
      }
      setPosts((prev) => [localPost, ...prev])
      const errorMsg = err instanceof Error ? err.message : 'Backend offline'
      setSnackbar({
        open: true,
        message: `Post created locally (${errorMsg}). Connect MongoDB to persist.`,
        severity: 'info'
      })
    } finally {
      setSubmitting(false)
      setShowAddModal(false)
      setNewPost({ title: '', description: '', category: 'React' })
    }
  }

  const handleDelete = async (postId: string, postTitle: string) => {
    // If it's a fallback demo post or locally generated post, delete locally without server error
    if (postId.startsWith('default-') || postId.startsWith('local-')) {
      setPosts((prev) => prev.filter((p) => p._id !== postId))
      setSnackbar({
        open: true,
        message: `Removed "${postTitle}" from preview`,
        severity: 'info'
      })
      return
    }

    try {
      const res = await fetch(`${API_URL}/${postId}`, { method: 'DELETE' })
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p._id !== postId))
        setSnackbar({
          open: true,
          message: `Deleted "${postTitle}" successfully`,
          severity: 'success'
        })
      } else {
        const errData = await res.json().catch(() => ({}))
        setSnackbar({
          open: true,
          message: errData.message || 'Server error while deleting post',
          severity: 'error'
        })
      }
    } catch {
      setSnackbar({
        open: true,
        message: 'Network error: could not connect to server to delete post',
        severity: 'error'
      })
    }
  }

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat)
    setPage('home')
    setTimeout(() => {
      const section = document.getElementById('posts-section')
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' })
      }
    }, 50)
  }

  const handleStartReading = () => {
    setSelectedCategory('All')
    setPage('home')
    setTimeout(() => {
      const section = document.getElementById('posts-section')
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' })
      }
    }, 50)
  }

  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPost) return
    if (!editingPost.title.trim() || !editingPost.description.trim() || !editingPost.category) {
      setSnackbar({
        open: true,
        message: 'Please fill in all fields before saving.',
        severity: 'warning'
      })
      return
    }

    setSubmitting(true)
    if (editingPost._id.startsWith('default-') || editingPost._id.startsWith('local-')) {
      setPosts((prev) => prev.map((p) => (p._id === editingPost._id ? editingPost : p)))
      setSnackbar({
        open: true,
        message: 'Post updated in preview mode.',
        severity: 'info'
      })
      setEditingPost(null)
      setSubmitting(false)
      return
    }

    try {
      const res = await fetch(`${API_URL}/${editingPost._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingPost.title.trim(),
          description: editingPost.description.trim(),
          category: editingPost.category
        })
      })

      if (res.ok) {
        const updated: BlogPost = await res.json()
        setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)))
        setSnackbar({ open: true, message: '✨ Post updated successfully!', severity: 'success' })
        setEditingPost(null)
      } else {
        const errData = await res.json().catch(() => ({}))
        setSnackbar({
          open: true,
          message: errData.message || 'Failed to update post',
          severity: 'error'
        })
      }
    } catch {
      setSnackbar({
        open: true,
        message: 'Network error while updating post',
        severity: 'error'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenSubscribe = () => {
    setSubscribeModalOpen(true)
  }

  const handleSubscribeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!subscriberEmail.trim() || !subscriberEmail.includes('@')) {
      setSnackbar({
        open: true,
        message: 'Please enter a valid email address.',
        severity: 'warning'
      })
      return
    }
    setSubscribeModalOpen(false)
    setSnackbar({
      open: true,
      message: `🎉 Subscribed ${subscriberEmail} to TheBlog newsletter!`,
      severity: 'success'
    })
    setSubscriberEmail('')
  }

  // Filter posts on client by selected category and active search query
  const displayedPosts = posts.filter((p) => {
    const matchesCategory =
      selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase()
    const matchesSearch =
      !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* NAVBAR */}
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #e2e8f0' }}>
        <Toolbar sx={{ justifyContent: 'space-between', maxWidth: 1100, mx: 'auto', width: '100%', px: { xs: 2, sm: 3 } }}>
          <Box
            onClick={() => { setPage('home'); setSelectedCategory('All'); }}
            sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
          >
            <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 16 }}>
              B
            </Box>
            <Typography variant="h6" fontWeight="bold" color="primary.main">
              TheBlog
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            <Button
              variant={page === 'home' ? 'contained' : 'text'}
              size="small"
              onClick={() => { setPage('home'); setSelectedCategory('All'); }}
            >
              Home
            </Button>
            <Button
              variant={page === 'categories' ? 'contained' : 'text'}
              size="small"
              onClick={() => setPage('categories')}
            >
              Categories
            </Button>
            <Button
              variant={page === 'about' ? 'contained' : 'text'}
              size="small"
              onClick={() => setPage('about')}
            >
              About
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={handleOpenSubscribe}
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            >
              Subscribe
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* BACKEND STATUS NOTICE BANNER */}
      {backendOffline && (
        <Alert
          severity="info"
          sx={{
            borderRadius: 0,
            justifyContent: 'center',
            py: 0.5,
            fontSize: '0.875rem',
            borderBottom: '1px solid #e0f2fe'
          }}
          action={
            <Button color="inherit" size="small" onClick={() => fetchPosts()}>
              Retry
            </Button>
          }
        >
          Running in demo mode with sample posts. Start local server with <code>npm run backend</code> to connect live MongoDB.
        </Alert>
      )}

      {/* MAIN CONTENT AREA */}
      <Box sx={{ flexGrow: 1 }}>
        {/* ==================== HOME PAGE ==================== */}
        {page === 'home' && (
          <>
            {/* HERO SECTION */}
            <Box
              sx={{
                textAlign: 'center',
                py: { xs: 8, md: 10 },
                px: 2,
                background: 'linear-gradient(180deg, #f0fdf4 0%, #f8fafc 100%)',
                borderBottom: '1px solid #e2e8f0'
              }}
            >
              <Container maxWidth="md">
                <Chip
                  label="🚀 Welcome to the Developer Hub"
                  size="small"
                  sx={{ mb: 2, bgcolor: 'primary.light', color: 'primary.dark', fontWeight: 600 }}
                />
                <Typography variant="h2" fontWeight="800" color="text.primary" sx={{ fontSize: { xs: '2.4rem', md: '3.5rem' }, mb: 2 }}>
                  Thoughts on tech, code, and building systems
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 620, mx: 'auto', mb: 4, fontWeight: 400 }}>
                  Explore clean architectures, full-stack development with React, TypeScript, Express, and MongoDB.
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Button variant="contained" size="large" onClick={handleStartReading}>
                    Start Reading
                  </Button>
                  <Button variant="outlined" size="large" onClick={() => setShowAddModal(true)}>
                    + Write an Article
                  </Button>
                </Box>
              </Container>
            </Box>

            {/* UNIFIED LATEST POSTS SECTION */}
            <Box id="posts-section" sx={{ maxWidth: 1100, mx: 'auto', px: 3, py: 8 }}>
              {/* Section Header & Actions */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 4 }}>
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="text.primary">
                    {selectedCategory === 'All' ? 'Latest Posts' : `${selectedCategory} Articles`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Showing {displayedPosts.length} article{displayedPosts.length === 1 ? '' : 's'}
                    {searchQuery && ` matching "${searchQuery}"`}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                  <TextField
                    size="small"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ minWidth: { xs: '100%', sm: 260 } }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          </svg>
                        </InputAdornment>
                      ),
                      endAdornment: searchQuery ? (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setSearchQuery('')} aria-label="clear search">
                            <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>✕</Typography>
                          </IconButton>
                        </InputAdornment>
                      ) : null
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={() => setShowAddModal(true)}
                    sx={{ px: 2.5, whiteSpace: 'nowrap' }}
                  >
                    + New Post
                  </Button>
                </Box>
              </Box>

              {/* Category Filter Pills */}
              <Box sx={{ display: 'flex', gap: 1, mb: 4, overflowX: 'auto', pb: 1 }}>
                {CATEGORIES.map((cat) => (
                  <Chip
                    key={cat}
                    label={cat}
                    clickable
                    color={selectedCategory === cat ? 'primary' : 'default'}
                    variant={selectedCategory === cat ? 'filled' : 'outlined'}
                    onClick={() => setSelectedCategory(cat)}
                    sx={{ px: 0.5, fontSize: '0.875rem' }}
                  />
                ))}
              </Box>

              {/* Posts Cards Grid */}
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress />
                </Box>
              ) : displayedPosts.length === 0 ? (
                <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'grey.50' }}>
                  <Typography variant="h6" fontWeight="bold" color="text.secondary" gutterBottom>
                    {searchQuery
                      ? `No articles match "${searchQuery}"`
                      : `No posts found in ${selectedCategory}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {searchQuery
                      ? 'Try searching with different keywords or clearing your search.'
                      : 'Be the first to share an article in this category!'}
                  </Typography>
                  {searchQuery ? (
                    <Button variant="outlined" onClick={() => setSearchQuery('')}>
                      Clear Search
                    </Button>
                  ) : (
                    <Button variant="contained" onClick={() => setShowAddModal(true)}>
                      + Create First Post
                    </Button>
                  )}
                </Paper>
              ) : (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                    gap: 3
                  }}
                >
                  {displayedPosts.map((post) => (
                    <Card
                      key={post._id}
                      elevation={0}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        bgcolor: 'background.paper',
                        borderRadius: 3
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Chip
                            label={post.category}
                            size="small"
                            color="primary"
                            clickable
                            onClick={() => setSelectedCategory(post.category)}
                          />
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Tooltip title="Edit post">
                              <IconButton
                                size="small"
                                onClick={() => setEditingPost(post)}
                                aria-label="edit post"
                                sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'primary.50' } }}
                              >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                                </svg>
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete post">
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(post._id, post.title)}
                                aria-label="delete post"
                                sx={{ color: 'text.secondary', '&:hover': { color: 'error.main', bgcolor: '#fee2e2' } }}
                              >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>

                        <Typography variant="h6" fontWeight="700" gutterBottom sx={{ lineHeight: 1.3 }}>
                          {post.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.6
                          }}
                        >
                          {post.description}
                        </Typography>
                      </CardContent>

                      <CardActions sx={{ justifyContent: 'space-between', px: 3, pb: 3, pt: 0 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="500">
                          {post.date}
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => setReadPostModal(post)}
                        >
                          Read More
                        </Button>
                      </CardActions>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>
          </>
        )}

        {/* ==================== CATEGORIES PAGE ==================== */}
        {page === 'categories' && (
          <Box sx={{ maxWidth: 1100, mx: 'auto', px: 3, py: 8 }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="h3" fontWeight="800" gutterBottom>
                Topics & Categories
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
                Browse articles curated across software architecture, frontend frameworks, and cloud databases.
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                gap: 3
              }}
            >
              {['React', 'TypeScript', 'MUI', 'MongoDB', 'Node.js', 'CSS'].map((cat) => {
                const count = posts.filter((p) => p.category.toLowerCase() === cat.toLowerCase()).length
                return (
                  <Card
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    sx={{
                      textAlign: 'center',
                      py: 4,
                      px: 2,
                      cursor: 'pointer',
                      border: '1px solid #e2e8f0',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'primary.50'
                      }
                    }}
                  >
                    <CardContent>
                      <Typography variant="h5" fontWeight="bold" color="primary.main" gutterBottom>
                        {cat}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Articles and tutorials on {cat}
                      </Typography>
                      <Chip
                        label={`${count} article${count === 1 ? '' : 's'}`}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    </CardContent>
                  </Card>
                )
              })}
            </Box>
          </Box>
        )}

        {/* ==================== ABOUT PAGE ==================== */}
        {page === 'about' && (
          <Box sx={{ maxWidth: 760, mx: 'auto', px: 3, py: 10 }}>
            <Paper elevation={0} sx={{ p: { xs: 4, sm: 6 }, borderRadius: 4, border: '1px solid #e2e8f0' }}>
              <Chip label="About The Project" color="primary" size="small" sx={{ mb: 2 }} />
              <Typography variant="h3" fontWeight="800" color="text.primary" sx={{ mb: 3 }}>
                About TheBlog
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontSize: '1.05rem', lineHeight: 1.8 }}>
                TheBlog is a developer-focused publication dedicated to modern full-stack web engineering.
                We share hands-on articles about React, TypeScript, Material UI, scalable backend design with Express, and cloud database persistence with MongoDB Atlas.
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: '1.05rem', lineHeight: 1.8 }}>
                This application serves as a live end-to-end demonstration of the modern web stack. It highlights best practices for clean API consumption, fault-tolerant offline fallbacks, responsive component design, and reactive state management.
              </Typography>

              <Divider sx={{ my: 4 }} />

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button variant="contained" size="large" onClick={() => { setPage('home'); setSelectedCategory('All'); }}>
                  Read Our Posts
                </Button>
                <Button variant="outlined" size="large" onClick={() => setPage('categories')}>
                  Explore Categories
                </Button>
              </Box>
            </Paper>
          </Box>
        )}
      </Box>

      {/* ==================== ADD POST DIALOG ==================== */}
      <Dialog
        open={showAddModal}
        onClose={() => !submitting && setShowAddModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          Create New Article
        </DialogTitle>
        <form onSubmit={handlePublish}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <TextField
              label="Article Title"
              placeholder="e.g. Understanding React Server Components"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              required
              fullWidth
              autoFocus
            />

            <TextField
              select
              label="Category"
              value={newPost.category}
              onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
              required
              fullWidth
            >
              {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Article Content / Summary"
              placeholder="Write a compelling overview of what you learned..."
              value={newPost.description}
              onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
              required
              multiline
              rows={4}
              fullWidth
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setShowAddModal(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting || !newPost.title.trim() || !newPost.description.trim()}
            >
              {submitting ? 'Publishing...' : 'Publish Post'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ==================== READ POST DIALOG ==================== */}
      <Dialog
        open={Boolean(readPostModal)}
        onClose={() => setReadPostModal(null)}
        maxWidth="sm"
        fullWidth
      >
        {readPostModal && (
          <>
            <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Chip label={readPostModal.category} color="primary" size="small" />
                <Typography variant="caption" color="text.secondary">
                  {readPostModal.date}
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="800">
                {readPostModal.title}
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, fontSize: '1.05rem' }}>
                {readPostModal.description}
              </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5 }}>
              <Button onClick={() => setReadPostModal(null)} variant="outlined">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ==================== EDIT POST DIALOG ==================== */}
      <Dialog
        open={Boolean(editingPost)}
        onClose={() => !submitting && setEditingPost(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          Edit Article
        </DialogTitle>
        {editingPost && (
          <form onSubmit={handleUpdatePost}>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
              <TextField
                label="Article Title"
                value={editingPost.title}
                onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                required
                fullWidth
                autoFocus
              />

              <TextField
                select
                label="Category"
                value={editingPost.category}
                onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                required
                fullWidth
              >
                {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Article Content / Summary"
                value={editingPost.description}
                onChange={(e) => setEditingPost({ ...editingPost, description: e.target.value })}
                required
                multiline
                rows={5}
                fullWidth
              />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={() => setEditingPost(null)} disabled={submitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting || !editingPost.title.trim() || !editingPost.description.trim()}
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogActions>
          </form>
        )}
      </Dialog>

      {/* ==================== SUBSCRIBE DIALOG ==================== */}
      <Dialog
        open={subscribeModalOpen}
        onClose={() => setSubscribeModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 0.5 }}>
          Join TheBlog Newsletter
        </DialogTitle>
        <form onSubmit={handleSubscribeSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Get weekly curated articles on full-stack architecture, React 19, TypeScript, and MongoDB.
            </Typography>
            <TextField
              type="email"
              label="Email Address"
              placeholder="you@domain.com"
              value={subscriberEmail}
              onChange={(e) => setSubscriberEmail(e.target.value)}
              required
              fullWidth
              autoFocus
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setSubscribeModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!subscriberEmail.trim() || !subscriberEmail.includes('@')}
            >
              Subscribe
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ==================== NOTIFICATIONS ==================== */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%', boxShadow: 3 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* ==================== FOOTER ==================== */}
      <Box sx={{ bgcolor: '#0f172a', color: 'white', py: 6, mt: 8 }}>
        <Box sx={{ maxWidth: 1100, mx: 'auto', px: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 4 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box sx={{ width: 24, height: 24, borderRadius: 1, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 14 }}>
                B
              </Box>
              <Typography variant="h6" fontWeight="bold" color="white">
                TheBlog
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mt: 1, color: '#94a3b8', maxWidth: 280, lineHeight: 1.6 }}>
              Thoughts on technology, full-stack architecture, and building systems that scale.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: { xs: 4, sm: 8 } }}>
            <Box>
              <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 1.5, color: '#f8fafc' }}>
                Navigate
              </Typography>
              {(['Home', 'Categories', 'About'] as const).map((item) => (
                <Typography
                  key={item}
                  variant="body2"
                  onClick={() => {
                    if (item === 'Home') { setPage('home'); setSelectedCategory('All'); }
                    if (item === 'Categories') setPage('categories');
                    if (item === 'About') setPage('about');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  sx={{
                    color: '#94a3b8',
                    mb: 1,
                    cursor: 'pointer',
                    transition: 'color 0.15s',
                    '&:hover': { color: '#60a5fa' }
                  }}
                >
                  {item}
                </Typography>
              ))}
            </Box>

            <Box>
              <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 1.5, color: '#f8fafc' }}>
                Topics
              </Typography>
              {['React', 'TypeScript', 'MUI', 'MongoDB'].map((topic) => (
                <Typography
                  key={topic}
                  variant="body2"
                  onClick={() => handleCategorySelect(topic)}
                  sx={{
                    color: '#94a3b8',
                    mb: 1,
                    cursor: 'pointer',
                    transition: 'color 0.15s',
                    '&:hover': { color: '#60a5fa' }
                  }}
                >
                  {topic}
                </Typography>
              ))}
            </Box>
          </Box>
        </Box>

        <Box sx={{ maxWidth: 1100, mx: 'auto', px: 3, borderTop: '1px solid #1e293b', mt: 5, pt: 3, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            © 2026 TheBlog. Built with React, Material UI, Express, and MongoDB Atlas.
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default App
