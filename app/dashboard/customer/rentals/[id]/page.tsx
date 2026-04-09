"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bath,
  Bed,
  Calendar,
  Home,
  Mail,
  MapPin,
  Phone,
  Square,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface RentalHouse {
  id: string;
  broker_id: string;
  title: string;
  description: string;
  location: string;
  address: string;
  city: string;
  state: string;
  rent: number;
  deposit: number;
  bedrooms: number;
  bathrooms: number;
  area_sqft: number;
  amenities: string[];
  images: string[];
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  availability_date: string;
  status: string;
  property_type: string;
  furnished: boolean;
  parking: boolean;
  pets_allowed: boolean;
  created_at: string;
  broker?: {
    full_name: string;
    agency_name: string;
    phone: string;
  };
}

export default function CustomerRentalDetailPage() {
  const params = useParams();
  const rentalId = params.id as string;
  const [rental, setRental] = useState<RentalHouse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const supabase = createClient();
  const [currentImage, setCurrentImage] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    const fetchRental = async () => {
      try {
        const { data } = await supabase
          .from("rental_houses")
          .select(
            `
            *,
            broker:profiles!broker_id(full_name, agency_name, phone)
          `,
          )
          .eq("id", rentalId)
          .single();

        setRental(data);

        // Check if saved
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: wishlistItem } = await supabase
            .from("wishlist_items")
            .select("id")
            .eq("user_id", user.id)
            .eq("rental_id", rentalId)
            .single();

          setIsSaved(!!wishlistItem);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRental();
  }, [rentalId, supabase]);

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
        .eq("rental_id", rentalId);
      setIsSaved(false);
    } else {
      await supabase
        .from("wishlist_items")
        .insert({ user_id: user.id, rental_id: rentalId });
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

  if (!rental) {
    return (
      <div className="p-8">
        <Card className="glass p-8 text-center">
          <p className="text-muted-foreground">Rental listing not found</p>
          <Link href="/dashboard/customer/rentals">
            <Button className="mt-4">Back to Rentals</Button>
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
        <Link href="/dashboard/customer/rentals">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Rentals
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image */}
          <div className="lg:col-span-2">
            <div className="lg:col-span-2">
              <Card className="glass p-2">
                <div className="relative w-full h-80 overflow-hidden rounded-xl">
                  {rental.images && rental.images.length > 0 ? (
                    <>
                      {/* Main Image */}
                      <img
                        src={rental.images[currentImage]}
                        alt="Property"
                        onClick={() => setPreviewOpen(true)}
                        className="w-full h-full object-cover rounded-xl transition-all duration-500 cursor-pointer"
                      />

                      {/* Left Button */}
                      <button
                        onClick={() =>
                          setCurrentImage((prev) =>
                            prev === 0 ? rental.images.length - 1 : prev - 1,
                          )
                        }
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full"
                      >
                        ‹
                      </button>

                      {/* Right Button */}
                      <button
                        onClick={() =>
                          setCurrentImage((prev) =>
                            prev === rental.images.length - 1 ? 0 : prev + 1,
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full"
                      >
                        ›
                      </button>

                      {/* Dots Indicator */}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                        {rental.images.map((_, idx) => (
                          <div
                            key={idx}
                            className={`w-2 h-2 rounded-full ${
                              currentImage === idx ? "bg-white" : "bg-white/40"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary">
                      <Home className="w-20 h-20 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Quick Info */}
          <div className="space-y-4">
            <Card className="glass p-6">
              <h2 className="text-3xl font-bold text-accent mb-2">
                ₹{rental.rent?.toLocaleString()}
              </h2>
              <p className="text-muted-foreground">per month</p>
              <div className="border-t border-border mt-4 pt-4">
                <p className="text-sm text-muted-foreground mb-1">
                  Security Deposit
                </p>
                <p className="text-xl font-bold">
                  ₹{rental.deposit?.toLocaleString()}
                </p>
              </div>
            </Card>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{rental.title}</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {rental.address}, {rental.city}, {rental.state}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="glass p-4 text-center">
                <Bed className="w-6 h-6 text-accent mx-auto mb-2" />
                <p className="font-bold">{rental.bedrooms}</p>
                <p className="text-xs text-muted-foreground">Bedrooms</p>
              </Card>
              <Card className="glass p-4 text-center">
                <Bath className="w-6 h-6 text-accent mx-auto mb-2" />
                <p className="font-bold">{rental.bathrooms}</p>
                <p className="text-xs text-muted-foreground">Bathrooms</p>
              </Card>
              <Card className="glass p-4 text-center">
                <Square className="w-6 h-6 text-accent mx-auto mb-2" />
                <p className="font-bold">{rental.area_sqft}</p>
                <p className="text-xs text-muted-foreground">Sq. Ft.</p>
              </Card>
              <Card className="glass p-4 text-center">
                <Calendar className="w-6 h-6 text-accent mx-auto mb-2" />
                <p className="font-bold text-sm">
                  {rental.availability_date
                    ? new Date(rental.availability_date).toLocaleDateString()
                    : "Now"}
                </p>
                <p className="text-xs text-muted-foreground">Available</p>
              </Card>
            </div>

            <Card className="glass p-6">
              <h3 className="font-bold mb-3">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {rental.description || "No description provided"}
              </p>
            </Card>

            {rental.amenities && rental.amenities.length > 0 && (
              <Card className="glass p-6">
                <h3 className="font-bold mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {rental.amenities.map((amenity, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            <Card className="glass p-6">
              <h3 className="font-bold mb-3">Features</h3>
              <div className="grid grid-cols-3 gap-4">
                <div
                  className={`p-3 rounded-lg text-center ${rental.furnished ? "bg-green-500/10 text-green-400" : "bg-secondary text-muted-foreground"}`}
                >
                  <p className="text-sm">
                    {rental.furnished ? "Furnished" : "Unfurnished"}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-lg text-center ${rental.parking ? "bg-green-500/10 text-green-400" : "bg-secondary text-muted-foreground"}`}
                >
                  <p className="text-sm">
                    {rental.parking ? "Parking" : "No Parking"}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-lg text-center ${rental.pets_allowed ? "bg-green-500/10 text-green-400" : "bg-secondary text-muted-foreground"}`}
                >
                  <p className="text-sm">
                    {rental.pets_allowed ? "Pets OK" : "No Pets"}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Contact Card */}
          <div className="space-y-6">
            <Card className="glass p-6">
              <h3 className="font-bold mb-4">Broker Contact</h3>
              <div className="space-y-4">
                {rental.contact_name && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Contact Name
                    </p>
                    <p className="font-medium">{rental.contact_name}</p>
                  </div>
                )}
                {rental.broker?.agency_name && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Agency</p>
                    <p className="font-medium">{rental.broker.agency_name}</p>
                  </div>
                )}
                <div className="border-t border-border pt-4">
                  <p className="flex items-center gap-2 mb-3">
                    <Phone className="w-4 h-4 text-accent" />
                    <span className="font-medium">{rental.contact_phone}</span>
                  </p>
                  {rental.contact_email && (
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-accent" />
                      <span className="font-medium break-all">
                        {rental.contact_email}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </Card>

            <Card className="glass p-6">
              <h3 className="font-bold mb-3">Property Type</h3>
              <p className="text-lg">{rental.property_type || "Apartment"}</p>
            </Card>

            <Card className="glass p-6">
              <h3 className="font-bold mb-3">Listed On</h3>
              <p className="text-muted-foreground">
                {new Date(rental.created_at).toLocaleDateString()}
              </p>
            </Card>
          </div>
        </div>
      </motion.div>

      {previewOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={() => setPreviewOpen(false)}
            className="absolute top-6 right-6 text-white text-3xl"
          >
            ✕
          </button>

          {/* Left Button */}
          <button
            onClick={() =>
              setCurrentImage((prev) =>
                prev === 0 ? rental.images.length - 1 : prev - 1,
              )
            }
            className="absolute left-6 text-white text-4xl"
          >
            ‹
          </button>

          {/* Image */}
          <img
            src={rental.images[currentImage]}
            alt="Preview"
            className="max-h-[90%] max-w-[90%] object-contain rounded-lg"
          />

          {/* Right Button */}
          <button
            onClick={() =>
              setCurrentImage((prev) =>
                prev === rental.images.length - 1 ? 0 : prev + 1,
              )
            }
            className="absolute right-6 text-white text-4xl"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
