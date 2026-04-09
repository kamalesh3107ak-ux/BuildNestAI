"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { EngineerPost } from "@/lib/types";
import { motion } from "framer-motion";
import { Briefcase, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CustomerEngineersPage() {
  const [posts, setPosts] = useState<EngineerPost[]>([]);
  const [search, setSearch] = useState("");
  const [workType, setWorkType] = useState("");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        let query = supabase
          .from("engineer_posts")
          .select("*")
          .eq("status", "active");

        if (workType) {
          query = query.eq("work_type", workType);
        }

        const { data } = await query;

        if (data) {
          const filtered = data.filter(
            (p: any) =>
              p.title.toLowerCase().includes(search.toLowerCase()) ||
              p.work_type.toLowerCase().includes(search.toLowerCase()),
          );
          setPosts(filtered);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [search, workType, supabase]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="h-48 bg-secondary animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const workTypes = [
    "All",
    "RCC",
    "Steel",
    "Plumbing",
    "Electrical",
    "Landscaping",
  ];

  return (
    <div className="p-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">Professional Engineers</h1>
        <p className="text-muted-foreground">
          Connect with experienced engineers for your projects
        </p>
      </motion.div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search engineers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-input border-border"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {workTypes.map((type) => (
            <Button
              key={type}
              onClick={() => setWorkType(type === "All" ? "" : type)}
              variant={
                workType === (type === "All" ? "" : type)
                  ? "default"
                  : "outline"
              }
              className={
                workType === (type === "All" ? "" : type)
                  ? "bg-primary hover:bg-primary-dark"
                  : "border-border"
              }
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      {posts.length === 0 ? (
        <Card className="glass p-12 text-center">
          <p className="text-muted-foreground">No engineers available</p>
        </Card>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Link href={`/dashboard/customer/engineers/${post.id}`}>
                <Card className="glass hover:border-accent/50 transition-all cursor-pointer overflow-hidden group">
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-accent/30 transition-all">
                    <Briefcase className="w-16 h-16 text-primary/50 group-hover:text-accent/70 transition-all" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl mb-2">{post.title}</h3>
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {post.description}
                    </p>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-muted-foreground">
                        📍 {post.location}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        🏗️ {post.work_type}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ⏱️ Exp: {post.experience_required}
                      </p>
                    </div>
                    <div className="bg-secondary/50 p-3 rounded-lg mb-4">
                      <p className="text-xs text-muted-foreground mb-1">
                        Contact
                      </p>
                      <p className="text-sm font-medium">
                        {post.contact_phone}
                      </p>
                    </div>
                    <Button className="w-full bg-accent hover:bg-accent-dark">
                      Connect with Engineer
                    </Button>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
