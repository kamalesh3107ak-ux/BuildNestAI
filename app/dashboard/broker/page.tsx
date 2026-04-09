"use client";

import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { Eye, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Listing {
  id: string;
  title: string;
}

export default function BrokerDashboard() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRentals, setTotalRentals] = useState(0);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data } = await supabase
          .from("rental_houses")
          .select("id, title")
          .eq("broker_id", user.id)
          .order("created_at", { ascending: false });

        if (data) {
          setListings(data?.slice(0, 5));
          setTotalRentals(data.length);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
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
        <p className="text-muted-foreground">
          Manage your properties in a simple and efficient way
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Total Rentals */}
        <Card className="glass p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Total Rentals
              </p>
              <p className="text-3xl font-bold">{totalRentals}</p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Home className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        {/* View Listings */}
        <Card
          onClick={() => router.push("/dashboard/broker/rentals")}
          className="glass p-6 hover:scale-[1.02] transition cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Eye className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="font-semibold">View Listings</p>
              <p className="text-sm text-muted-foreground">
                Manage your properties
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Recent Listings */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Recent Listings</h3>
          </div>

          {listings.length > 0 ? (
            <div className="space-y-3">
              {listings.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition"
                >
                  <p className="text-sm font-medium">
                    {item.title || "Untitled Property"}
                  </p>
                  <button
                    onClick={() =>
                      router.push(`/dashboard/broker/rentals/${item.id}`)
                    }
                    className="text-xs text-primary hover:underline"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No listings yet</p>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
