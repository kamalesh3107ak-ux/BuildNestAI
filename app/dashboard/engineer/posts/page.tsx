'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { EngineerPost } from '@/lib/types'
import Link from 'next/link'
import EngineerPostModal from '@/components/engineer/engineer-post-modal'
import { Briefcase } from 'lucide-react'

export default function EngineerPostsPage() {
  const [posts, setPosts] = useState<EngineerPost[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPost, setEditingPost] = useState<EngineerPost | null>(null)
  const supabase = createClient()

  const fetchPosts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('engineer_posts')
        .select('*')
        .eq('engineer_id', user.id)
        .order('created_at', { ascending: false })

      setPosts(data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [supabase])

  const handleDelete = async (postId: string) => {
    if (!confirm('Delete this post?')) return

    const { error } = await supabase
      .from('engineer_posts')
      .delete()
      .eq('id', postId)

    if (!error) {
      setPosts(posts.filter(p => p.id !== postId))
    }
  }

  const handleSave = async () => {
    await fetchPosts()
    setShowModal(false)
    setEditingPost(null)
  }

  const filteredPosts = posts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.work_type.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="p-8">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="h-20 bg-secondary animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-start">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-2">Your Work Posts</h1>
          <p className="text-muted-foreground">Showcase your expertise and completed projects</p>
        </motion.div>
        <Button
          onClick={() => {
            setEditingPost(null)
            setShowModal(true)
          }}
          className="bg-primary hover:bg-primary-dark h-10 px-6"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Post
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-input border-border"
        />
      </div>

      {filteredPosts.length === 0 ? (
        <Card className="glass p-12 text-center">
          <p className="text-muted-foreground">No posts yet. Create your first one!</p>
        </Card>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {filteredPosts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Link href={`/dashboard/engineer/posts/${post.id}`}>
                <Card className="glass hover:border-accent/50 transition-all cursor-pointer h-full overflow-hidden group">
                  <div className="h-40 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-accent/30 transition-all">
                    <Briefcase className="w-12 h-12 text-primary/50 group-hover:text-accent/70 transition-all" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">{post.title}</h3>
                    <div className="space-y-1 mb-4 text-sm text-muted-foreground">
                      <p>📍 {post.location}</p>
                      <p>🏗️ {post.work_type}</p>
                      <p>⏱️ {post.project_duration}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={(e) => {
                          e.preventDefault()
                          setEditingPost(post)
                          setShowModal(true)
                        }}
                        size="sm"
                        variant="outline"
                        className="flex-1 border-border"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.preventDefault()
                          handleDelete(post.id)
                        }}
                        size="sm"
                        variant="outline"
                        className="flex-1 border-destructive text-destructive"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      <EngineerPostModal
        open={showModal}
        onOpenChange={setShowModal}
        post={editingPost}
        onSave={handleSave}
      />
    </div>
  )
}
