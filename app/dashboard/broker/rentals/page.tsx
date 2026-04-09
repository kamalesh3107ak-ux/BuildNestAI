"use client";

import RentalModal from "@/components/rentals/rental-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { RentalHouse } from "@/lib/types";
import { motion } from "framer-motion";
import { Edit, Home, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function BrokerRentalsPage() {
  const [rentals, setRentals] = useState<RentalHouse[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRental, setEditingRental] = useState<RentalHouse | null>(null);
  const supabase = createClient();

  const fetchRentals = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("rental_houses")
        .select("*")
        .eq("broker_id", user.id)
        .order("created_at", { ascending: false });

      setRentals(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, [supabase]);

  const handleDelete = async (rentalId: string) => {
    if (!confirm("Delete this rental listing?")) return;

    const { error } = await supabase
      .from("rental_houses")
      .delete()
      .eq("id", rentalId);

    if (!error) {
      setRentals(rentals.filter((r) => r.id !== rentalId));
    }
  };

  const handleSave = async () => {
    await fetchRentals();
    setShowModal(false);
    setEditingRental(null);
  };

  const filteredRentals = rentals.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.location.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="p-8">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="h-20 bg-secondary animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-start">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-2">Rental Properties</h1>
          <p className="text-muted-foreground">
            Manage your rental house listings
          </p>
        </motion.div>
        <Button
          onClick={() => {
            setEditingRental(null);
            setShowModal(true);
          }}
          className="bg-primary hover:bg-primary-dark h-10 px-6"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Rental
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search rentals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-input border-border"
        />
      </div>

      {filteredRentals.length === 0 ? (
        <Card className="glass p-12 text-center">
          <p className="text-muted-foreground">
            No rentals yet. Create your first listing!
          </p>
        </Card>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {filteredRentals.map((rental) => (
            <motion.div
              key={rental.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Link href={`/dashboard/broker/rentals/${rental.id}`}>
                <Card className="glass hover:border-accent/50 transition-all cursor-pointer h-full overflow-hidden group">
                  {rental.images.length > 0 ? (
                    <img
                      src={rental.images[0]}
                      alt="Rental"
                      className="h-40 object-cover rounded-lg cursor-pointer"
                    />
                  ) : (
                    <div className="h-40 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-accent/30 transition-all">
                      <Home className="w-12 h-12 text-primary/50 group-hover:text-accent/70 transition-all" />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-2">{rental.title}</h3>
                    <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                      <p>📍 {rental.location}</p>
                      <p>🏠 {rental.bedrooms} rooms</p>
                      <p>💰 ₹{rental.rent.toLocaleString()}/month</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          setEditingRental(rental);
                          setShowModal(true);
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
                          e.preventDefault();
                          handleDelete(rental.id);
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

      <RentalModal
        open={showModal}
        onOpenChange={setShowModal}
        rental={editingRental}
        onSave={handleSave}
      />
    </div>
  );
}
