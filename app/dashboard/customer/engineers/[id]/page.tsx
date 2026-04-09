"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Briefcase,
  Clock,
  Mail,
  MapPin,
  Phone,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface EngineerPost {
  id: string;
  engineer_id: string;
  title: string;
  description: string;
  work_type: string;
  experience_required: string;
  location: string;
  images: string[];
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  project_duration: string;
  budget_range: string;
  skills: string[];
  status: string;
  views: number;
  created_at: string;
  engineer?: {
    full_name: string;
    specialization: string;
    experience_years: number;
  };
}

export default function CustomerEngineerDetailPage() {
  const params = useParams();
  const postId = params.id as string;
  const [post, setPost] = useState<EngineerPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await supabase
          .from("engineer_posts")
          .select(
            `
            *,
            engineer:profiles!engineer_id(full_name, specialization, experience_years)
          `,
          )
          .eq("id", postId)
          .single();

        setPost(data);

        // Check if saved
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: wishlistItem } = await supabase
            .from("wishlist_items")
            .select("id")
            .eq("user_id", user.id)
            .eq("engineer_post_id", postId)
            .single();

          setIsSaved(!!wishlistItem);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, supabase]);

  const toggleSave = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (isSaved) {
      await supabase
        .from("wishlist_items")
        .delete()
        .eq("user_id", user.id)
        .eq("engineer_post_id", postId);
      setIsSaved(false);
    } else {
      await supabase
        .from("wishlist_items")
        .insert({ user_id: user.id, engineer_post_id: postId });
      setIsSaved(true);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <Card className="h-96 bg-secondary animate-pulse" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-8">
        <Card className="glass p-8 text-center">
          <p className="text-muted-foreground">Engineer post not found</p>
          <Link href="/dashboard/customer/engineers">
            <Button className="mt-4">Back to Engineers</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link href="/dashboard/customer/engineers">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Engineers
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image */}
          <div className="lg:col-span-2">
            <Card className="glass p-8 h-80 flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
              <Briefcase className="w-32 h-32 text-primary/50" />
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <Card className="glass p-6">
              <h3 className="font-bold mb-4">Engineer Details</h3>
              <div className="space-y-3">
                {post.engineer?.full_name && (
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="font-medium">{post.engineer.full_name}</p>
                  </div>
                )}
                {post.engineer?.specialization && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Specialization
                    </p>
                    <p className="font-medium">
                      {post.engineer.specialization}
                    </p>
                  </div>
                )}
                {post.engineer?.experience_years && (
                  <div>
                    <p className="text-xs text-muted-foreground">Experience</p>
                    <p className="font-medium">
                      {post.engineer.experience_years} years
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
              <div className="flex flex-wrap gap-3 items-center">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Wrench className="w-4 h-4" />
                  {post.work_type}
                </span>
                {post.location && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {post.location}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card className="glass p-4 text-center">
                <Clock className="w-6 h-6 text-accent mx-auto mb-2" />
                <p className="font-bold">
                  {post.project_duration || "Flexible"}
                </p>
                <p className="text-xs text-muted-foreground">Duration</p>
              </Card>
              <Card className="glass p-4 text-center">
                <Briefcase className="w-6 h-6 text-accent mx-auto mb-2" />
                <p className="font-bold">{post.experience_required || "Any"}</p>
                <p className="text-xs text-muted-foreground">Experience</p>
              </Card>
              <Card className="glass p-4 text-center">
                <p className="text-lg font-bold text-accent">
                  {post.budget_range || "Negotiable"}
                </p>
                <p className="text-xs text-muted-foreground">Budget</p>
              </Card>
            </div>

            <Card className="glass p-6">
              <h3 className="font-bold mb-3">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {post.description || "No description provided"}
              </p>
            </Card>

            {post.skills && post.skills.length > 0 && (
              <Card className="glass p-6">
                <h3 className="font-bold mb-3">Skills & Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {post.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Contact Card */}
          <div className="space-y-6">
            <Card className="glass p-6">
              <h3 className="font-bold mb-4">Contact Information</h3>
              <div className="space-y-4">
                {post.contact_name && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Contact Name
                    </p>
                    <p className="font-medium">{post.contact_name}</p>
                  </div>
                )}
                <div className="border-t border-border pt-4">
                  <p className="flex items-center gap-2 mb-3">
                    <Phone className="w-4 h-4 text-accent" />
                    <span className="font-medium">{post.contact_phone}</span>
                  </p>
                  {post.contact_email && (
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-accent" />
                      <span className="font-medium break-all">
                        {post.contact_email}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </Card>

            <Card className="glass p-6">
              <h3 className="font-bold mb-3">Work Type</h3>
              <p className="text-lg">{post.work_type}</p>
            </Card>

            <Card className="glass p-6">
              <h3 className="font-bold mb-3">Posted On</h3>
              <p className="text-muted-foreground">
                {new Date(post.created_at).toLocaleDateString()}
              </p>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
