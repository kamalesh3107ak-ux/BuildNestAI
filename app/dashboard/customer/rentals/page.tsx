"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { RentalHouse } from "@/lib/types";
import { motion } from "framer-motion";
import { Home, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CustomerRentalsPage() {
  const [rentals, setRentals] = useState<RentalHouse[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        let query = supabase
          .from("rental_houses")
          .select("*")
          .eq("status", "active");

        const { data } = await query;

        if (data) {
          const filtered = data.filter(
            (r: any) =>
              r.title.toLowerCase().includes(search.toLowerCase()) ||
              r.location.toLowerCase().includes(search.toLowerCase()),
          );
          setRentals(filtered);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRentals();
  }, [search, supabase]);

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

  return (
    <div className="p-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">Rental Properties</h1>
        <p className="text-muted-foreground">Find your perfect rental home</p>
      </motion.div>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by location or title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-input border-border"
        />
      </div>

      {rentals.length === 0 ? (
        <Card className="glass p-12 text-center">
          <p className="text-muted-foreground">No rentals available</p>
        </Card>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {rentals.map((rental) => (
            <motion.div
              key={rental.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Link href={`/dashboard/customer/rentals/${rental.id}`}>
                <Card className="glass hover:border-accent/50 transition-all cursor-pointer overflow-hidden group">
                  {rental.images.length > 0 ? (
                    <img
                      src={rental.images[0]}
                      alt="Rental"
                      className="h-40 object-cover rounded-lg cursor-pointer"
                    />
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-accent/30 transition-all">
                      <Home className="w-16 h-16 text-primary/50 group-hover:text-accent/70 transition-all" />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="font-bold text-xl mb-2">{rental.title}</h3>
                    <div className="space-y-2 mb-4">
                      <p className="text-muted-foreground">
                        📍 {rental.location}
                      </p>
                      <p className="text-muted-foreground">
                        🏠 {rental.bedrooms} rooms • {rental.area_sqft} sqft
                      </p>
                      <p className="text-muted-foreground">
                        📅 {rental.availability_date}
                      </p>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Monthly Rent
                        </p>
                        <p className="text-2xl font-bold text-accent">
                          ₹{rental.rent.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Deposit</p>
                        <p className="text-lg font-bold">
                          ₹{rental.deposit.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="bg-secondary/50 p-3 rounded-lg mb-4">
                      <p className="text-xs text-muted-foreground mb-1">
                        Broker Contact
                      </p>
                      <p className="text-sm font-medium">
                        {rental.contact_phone}
                      </p>
                    </div>
                    <Button className="w-full bg-primary hover:bg-primary-dark">
                      Contact Broker
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
