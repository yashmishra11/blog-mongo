import { AppBar, Toolbar, Typography, Button, Box, Card, CardContent, Grid, CardActions, Chip } from '@mui/material'
import React from 'react'
import { useEffect, useState } from 'react'

type BlogPost = {
  _id: string
  title: string
  description: string
  category: string
  date: string
}

function App() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState<'home' | 'categories' | 'about'>('home')
  const [showForm, setShowForm] = useState(false)
  const [newPost, setNewPost] = useState({ title: '', description: '', category: '', date: '' })

  const handleSubmit = async () => {
  const postWithDate = { ...newPost, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
  
  const res = await fetch('https://blog-mongo-58k7.onrender.com/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postWithDate)
  })
  const saved = await res.json()
  setPosts([...posts, saved])
  setShowForm(false)
  setNewPost({ title: '', description: '', category: '', date: '' })
}


  useEffect(() => {
    fetch('https://blog-mongo-58k7.onrender.com/api/posts')
      .then((res) => res.json())
      .then((data) => {
        setPosts(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error fetching posts:', err)
        setLoading(false)
      })
  }, [])

  if (loading) return <Typography sx={{ p: 4 }}>Loading posts...</Typography>

  return (
    
    <Box>

      {/* NAVBAR */}
      <AppBar position="static" elevation={1} sx={{ bgcolor: 'white' }}>
        <Toolbar sx={{ justifyContent: 'space-between', maxWidth: 1100, mx: 'auto', width: '100%' }}>
          <Typography variant="h6" fontWeight="bold" color="primary">
            TheBlog
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="text" onClick={() => setPage('home')}>Home</Button>
            <Button variant="text" onClick={() => setPage('categories')}>Categories</Button>
            <Button variant="text" onClick={() => setPage('about')}>About</Button>
            <Button variant="contained">Subscribe</Button>
          </Box>
        </Toolbar>
      </AppBar>

      {page === 'home' && (
        <>
          <Box sx={{ textAlign: 'center', py: 10, px: 2, bgcolor: 'grey.50' }}>
            <Typography variant="h2" fontWeight="bold" color="text.primary">
              Welcome to TheBlog
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mt: 2, maxWidth: 500, mx: 'auto' }}>
              Thoughts on technology, design, and building things that matter.
            </Typography>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button variant="contained" size="large">Start Reading</Button>
            </Box>
          </Box>

          <Box sx={{ maxWidth: 1100, mx: 'auto', px: 3, py: 8 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 4 }}>
              Latest Posts
            </Typography>
            <Grid container spacing={3}>
              {posts.map((post) => (
                <Grid {...({ item: true, xs: 12, md: 4, key: post._id } as any)}>
                  <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Chip label={post.category} size="small" color="primary" sx={{ mb: 2 }} />
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {post.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {post.description}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        {post.date}
                      </Typography>
                      <Button size="small" variant="outlined">Read More</Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Box sx={{ maxWidth: 1100, mx: 'auto', px: 3, py: 8 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h5" fontWeight="bold">Latest Posts</Typography>
              <Button variant="contained" onClick={() => setShowForm(!showForm)}>
                {showForm ? 'Cancel' : '+ New Post'}
              </Button>
            </Box>

            {/* ADD POST FORM */}
            {showForm && (
              <Box sx={{ bgcolor: 'grey.50', p: 3, borderRadius: 2, mb: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <input
                  placeholder="Title"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '16px' }}
                />
                <input
                  placeholder="Category (e.g. React)"
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                  style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '16px' }}
                />
                <textarea
                  placeholder="Description"
                  value={newPost.description}
                  onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                  rows={3}
                  style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '16px', resize: 'vertical' }}
                />
                <Button variant="contained" onClick={handleSubmit} disabled={!newPost.title || !newPost.description || !newPost.category}>
                  Publish Post
                </Button>
              </Box>
            )}

            {/* CARDS */}
            <Grid container spacing={3}>
            </Grid>
          </Box>

        </>
      )}

      {page === 'categories' && (
        <Box sx={{ maxWidth: 1100, mx: 'auto', px: 3, py: 8 }}>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>Categories</Typography>
          <Grid container spacing={3}>
            {['React', 'TypeScript', 'MUI', 'MongoDB', 'Node.js', 'CSS'].map((cat) => (
              <Grid {...({ item: true, xs: 12, md: 4, key: cat } as any)}>
                <Card elevation={2} sx={{ textAlign: 'center', py: 4, cursor: 'pointer', '&:hover': { bgcolor: 'primary.main', color: 'white' } }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold">{cat}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Explore {cat} articles
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {page === 'about' && (
        <Box sx={{ maxWidth: 700, mx: 'auto', px: 3, py: 10, textAlign: 'center' }}>
          <Typography variant="h3" fontWeight="bold" sx={{ mb: 3 }}>About TheBlog</Typography>
          <Typography variant="body1" color="white" sx={{ mb: 3, lineHeight: 2 }}>
            TheBlog is a space for developers, designers, and curious minds to explore modern web technologies. 
            We write about React, TypeScript, databases, UI design, and everything in between.
          </Typography>
          <Typography variant="body1" color="white" sx={{ lineHeight: 2 }}>
            Built with React, Material UI, Express, and MongoDB — this blog itself is a demonstration 
            of the stack we write about.
          </Typography>
          <Button variant="contained" size="large" sx={{ mt: 4 }}>Read Our Posts</Button>
        </Box>
      )}

      {/* FOOTER */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 6, mt: 8 }}>
        <Box sx={{ maxWidth: 1100, mx: 'auto', px: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 4 }}>
          <Box>
            <Typography variant="h6" fontWeight="bold" color="primary">TheBlog</Typography>
            <Typography variant="body2" sx={{ mt: 1, color: 'grey.400', maxWidth: 250 }}>
              Thoughts on technology, design, and building things that matter.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 6 }}>
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>Navigate</Typography>
              {['Home', 'Categories', 'About'].map((link) => (
                <Typography key={link} variant="body2" sx={{ color: 'grey.400', mb: 0.5, cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  {link}
                </Typography>
              ))}
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>Topics</Typography>
              {['React', 'TypeScript', 'MUI'].map((topic) => (
                <Typography key={topic} variant="body2" sx={{ color: 'grey.400', mb: 0.5, cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  {topic}
                </Typography>
              ))}
            </Box>
          </Box>
        </Box>
        <Box sx={{ borderTop: '1px solid', borderColor: 'grey.800', mt: 4, pt: 3, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'grey.500' }}>
            © 2026 TheBlog. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default App
