"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { EngineerPost } from "@/lib/types";
import { useEffect, useState } from "react";

interface EngineerPostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: EngineerPost | null;
  onSave: () => void;
}

export default function EngineerPostModal({
  open,
  onOpenChange,
  post,
  onSave,
}: EngineerPostModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    work_type: "",
    experience_required: "",
    location: "",
    contact_phone: "",
    project_duration: "",
  });
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        description: post.description,
        work_type: post.work_type,
        experience_required: post.experience_required,
        location: post.location,
        contact_phone: post.contact_phone,
        project_duration: post.project_duration,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        work_type: "",
        experience_required: "",
        location: "",
        contact_phone: "",
        project_duration: "",
      });
    }
  }, [post, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      if (post) {
        const { error } = await supabase
          .from("engineer_posts")
          .update(formData)
          .eq("id", post.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("engineer_posts").insert({
          ...formData,
          engineer_id: user.id,
          images: [],
        });

        if (error) throw error;
      }

      onSave();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{post ? "Edit Post" : "Create New Post"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="bg-input border-border"
            required
          />

          <Input
            placeholder="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="bg-input border-border"
            required
          />

          <Input
            placeholder="Work Type (e.g., RCC, Steel, Plumbing)"
            value={formData.work_type}
            onChange={(e) =>
              setFormData({ ...formData, work_type: e.target.value })
            }
            className="bg-input border-border"
            required
          />

          <Input
            placeholder="Experience (e.g., 5 years)"
            value={formData.experience_required}
            onChange={(e) =>
              setFormData({ ...formData, experience_required: e.target.value })
            }
            className="bg-input border-border"
            required
          />

          <Input
            placeholder="Location"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            className="bg-input border-border"
            required
          />

          <Input
            placeholder="Contact Details (Phone/Email)"
            value={formData.contact_phone}
            onChange={(e) =>
              setFormData({ ...formData, contact_phone: e.target.value })
            }
            className="bg-input border-border"
            required
          />

          <Input
            placeholder="Project Duration"
            value={formData.project_duration}
            onChange={(e) =>
              setFormData({ ...formData, project_duration: e.target.value })
            }
            className="bg-input border-border"
            required
          />

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-border"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary-dark"
            >
              {loading ? "Saving..." : "Save Post"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
