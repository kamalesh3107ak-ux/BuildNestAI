"use client";

import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { Briefcase, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Post {
  id: string;
  title: string;
}

export default function EngineerDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPosts, setTotalPosts] = useState(0);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data } = await supabase
          .from("engineer_posts")
          .select("id, title")
          .eq("engineer_id", user.id)
          .order("created_at", { ascending: false });

        if (data) {
          setPosts(data.slice(0, 5)); // ✅ recent 5
          setTotalPosts(data.length); // ✅ total count
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [supabase]);

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <Card className="h-24 bg-secondary animate-pulse" />
        <Card className="h-40 bg-secondary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Manage your posts and activity</p>
      </motion.div>

      {/* Stats + Actions */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Total Posts */}
        <Card className="glass p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Posts</p>
              <p className="text-3xl font-bold">{totalPosts}</p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        {/* View Posts */}
        <Card
          onClick={() => router.push("/dashboard/engineer/posts")}
          className="glass p-6 hover:scale-[1.02] transition cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Eye className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="font-semibold">View Posts</p>
              <p className="text-sm text-muted-foreground">Manage your posts</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Recent Posts */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Recent Posts</h3>
          </div>

          {posts.length > 0 ? (
            <div className="space-y-3">
              {posts.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition"
                >
                  <p className="text-sm font-medium">
                    {item.title || "Untitled Post"}
                  </p>
                  <button
                    onClick={() =>
                      router.push(`/dashboard/engineer/posts/${item.id}`)
                    }
                    className="text-xs text-primary hover:underline"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No posts yet</p>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
