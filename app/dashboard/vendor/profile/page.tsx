'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { UserProfile } from '@/lib/types'

export default function VendorProfilePage() {
  const [profile, setProfile] = useState<Partial<UserProfile> | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    bio: '',
    business_name: '',
    business_address: '',
  })
  const supabase = createClient()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (data) {
          setProfile(data)
          setFormData({
            full_name: data.full_name || '',
            phone: data.phone || '',
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            zip_code: data.zip_code || '',
            bio: data.bio || '',
            business_name: data.business_name || '',
            business_address: data.business_address || '',
          })
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [supabase])

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', user.id)

      if (!error) {
        setProfile({ ...profile, ...formData })
        setEditing(false)
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="h-12 bg-secondary animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Profile</h1>
            <p className="text-muted-foreground">Manage your vendor information</p>
          </div>
          {!editing && (
            <Button
              onClick={() => setEditing(true)}
              className="bg-primary hover:bg-primary-dark"
            >
              Edit Profile
            </Button>
          )}
        </div>

        <Card className="glass p-8 space-y-6">
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Full Name</label>
            {editing ? (
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="bg-input border-border"
              />
            ) : (
              <p className="font-medium">{profile?.full_name || 'Not set'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Email</label>
            <p className="font-medium">{profile?.email} (Cannot be changed)</p>
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Business Name</label>
            {editing ? (
              <Input
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                className="bg-input border-border"
              />
            ) : (
              <p className="font-medium">{profile?.business_name || 'Not set'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Business Address</label>
            {editing ? (
              <Input
                value={formData.business_address}
                onChange={(e) => setFormData({ ...formData, business_address: e.target.value })}
                className="bg-input border-border"
              />
            ) : (
              <p className="font-medium">{profile?.business_address || 'Not set'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Phone</label>
            {editing ? (
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-input border-border"
              />
            ) : (
              <p className="font-medium">{profile?.phone || 'Not set'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Personal Address</label>
            {editing ? (
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="bg-input border-border"
              />
            ) : (
              <p className="font-medium">{profile?.address || 'Not set'}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">City</label>
              {editing ? (
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="bg-input border-border"
                />
              ) : (
                <p className="font-medium">{profile?.city || 'Not set'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">State</label>
              {editing ? (
                <Input
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="bg-input border-border"
                />
              ) : (
                <p className="font-medium">{profile?.state || 'Not set'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">ZIP Code</label>
              {editing ? (
                <Input
                  value={formData.zip_code}
                  onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                  className="bg-input border-border"
                />
              ) : (
                <p className="font-medium">{profile?.zip_code || 'Not set'}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Bio</label>
            {editing ? (
              <Input
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="bg-input border-border"
              />
            ) : (
              <p className="font-medium">{profile?.bio || 'Not set'}</p>
            )}
          </div>

          {editing && (
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1 border-border"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary-dark"
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  )
}
