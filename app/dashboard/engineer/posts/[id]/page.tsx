'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { ArrowLeft, Briefcase, Edit, Trash2, MapPin, Phone, Mail, Clock, Wrench } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import EngineerPostModal from '@/components/engineer/engineer-post-modal'

interface EngineerPost {
  id: string
  engineer_id: string
  title: string
  description: string
  work_type: string
  experience_required: string
  location: string
  images: string[]
  contact_name: string
  contact_phone: string
  contact_email: string
  project_duration: string
  budget_range: string
  skills: string[]
  status: string
  views: number
  created_at: string
  updated_at: string
}

export default function EngineerPostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string
  const [post, setPost] = useState<EngineerPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const supabase = createClient()

  const fetchPost = async () => {
    try {
      const { data } = await supabase
        .from('engineer_posts')
        .select('*')
        .eq('id', postId)
        .single()

      setPost(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPost()
  }, [postId])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return

    const { error } = await supabase
      .from('engineer_posts')
      .delete()
      .eq('id', postId)

    if (!error) {
      router.push('/dashboard/engineer/posts')
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <Card className="h-96 bg-secondary animate-pulse" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="p-8">
        <Card className="glass p-8 text-center">
          <p className="text-muted-foreground">Post not found</p>
          <Link href="/dashboard/engineer/posts">
            <Button className="mt-4">Back to Posts</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link href="/dashboard/engineer/posts">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Posts
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image */}
          <div className="lg:col-span-1">
            <Card className="glass p-8 h-80 flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
              <Briefcase className="w-24 h-24 text-primary/50" />
            </Card>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  {post.work_type}
                </p>
                <span className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  post.status === 'active' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {post.status}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowModal(true)}
                  variant="outline"
                  className="border-border"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="glass p-4">
                <p className="text-xs text-muted-foreground mb-1">Experience</p>
                <p className="font-bold">{post.experience_required || 'Not specified'}</p>
              </Card>
              <Card className="glass p-4">
                <p className="text-xs text-muted-foreground mb-1">Duration</p>
                <p className="font-bold">{post.project_duration || 'Flexible'}</p>
              </Card>
              <Card className="glass p-4">
                <p className="text-xs text-muted-foreground mb-1">Budget Range</p>
                <p className="font-bold">{post.budget_range || 'Negotiable'}</p>
              </Card>
              <Card className="glass p-4">
                <p className="text-xs text-muted-foreground mb-1">Views</p>
                <p className="font-bold">{post.views || 0}</p>
              </Card>
            </div>

            <Card className="glass p-6">
              <h3 className="font-bold mb-3">Description</h3>
              <p className="text-muted-foreground leading-relaxed">{post.description || 'No description provided'}</p>
            </Card>

            {post.location && (
              <Card className="glass p-6">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-accent" />
                  Location
                </h3>
                <p className="text-muted-foreground">{post.location}</p>
              </Card>
            )}

            {post.skills && post.skills.length > 0 && (
              <Card className="glass p-6">
                <h3 className="font-bold mb-3">Skills & Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {post.skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            <Card className="glass p-6">
              <h3 className="font-bold mb-4">Contact Information</h3>
              <div className="space-y-3">
                {post.contact_name && (
                  <p className="text-muted-foreground">Name: {post.contact_name}</p>
                )}
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-accent" />
                  {post.contact_phone}
                </p>
                {post.contact_email && (
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-accent" />
                    {post.contact_email}
                  </p>
                )}
              </div>
            </Card>

            <Card className="glass p-6">
              <h3 className="font-bold mb-3">Post Info</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p>{new Date(post.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Updated</p>
                  <p>{new Date(post.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </motion.div>

      <EngineerPostModal
        open={showModal}
        onOpenChange={setShowModal}
        post={post as any}
        onSave={() => {
          fetchPost()
          setShowModal(false)
        }}
      />
    </div>
  )
}
