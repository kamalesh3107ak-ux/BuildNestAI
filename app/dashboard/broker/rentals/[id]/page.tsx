"use client";

import RentalModal from "@/components/rentals/rental-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bath,
  Bed,
  Calendar,
  Edit,
  Home,
  Mail,
  MapPin,
  Phone,
  Square,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
  views: number;
  property_type: string;
  furnished: boolean;
  parking: boolean;
  pets_allowed: boolean;
  created_at: string;
  updated_at: string;
}

export default function BrokerRentalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rentalId = params.id as string;
  const [rental, setRental] = useState<RentalHouse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const supabase = createClient();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);

  const fetchRental = async () => {
    try {
      const { data } = await supabase
        .from("rental_houses")
        .select("*")
        .eq("id", rentalId)
        .single();

      setRental(data);
      // ✅ set default image
      if (data?.images?.length > 0) {
        setSelectedImage(data.images[0]);
        setSelectedIndex(0);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRental();
  }, [rentalId]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this listing?")) return;

    const { error } = await supabase
      .from("rental_houses")
      .delete()
      .eq("id", rentalId);

    if (!error) {
      router.push("/dashboard/broker/rentals");
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
          <Link href="/dashboard/broker/rentals">
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
        <Link href="/dashboard/broker/rentals">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Rentals
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              {/* Main Image Carousel */}
              <Card className="glass p-2 h-80 relative overflow-hidden group">
                {rental.images?.length > 0 ? (
                  <>
                    <img
                      src={rental.images[selectedIndex]}
                      alt="Rental"
                      onClick={() => setShowImageModal(true)}
                      className="w-full h-full object-cover rounded-lg cursor-pointer"
                    />

                    {/* Left Arrow */}
                    <button
                      onClick={() =>
                        setSelectedIndex((prev) =>
                          prev === 0 ? rental.images.length - 1 : prev - 1,
                        )
                      }
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100"
                    >
                      ‹
                    </button>

                    {/* Right Arrow */}
                    <button
                      onClick={() =>
                        setSelectedIndex((prev) =>
                          prev === rental.images.length - 1 ? 0 : prev + 1,
                        )
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100"
                    >
                      ›
                    </button>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full w-full bg-gradient-to-br from-primary/20 to-accent/20">
                    <Home className="w-24 h-24 text-primary/50" />
                  </div>
                )}
              </Card>

              {/* Thumbnails */}
              {rental.images?.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {rental.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      onClick={() => setSelectedIndex(idx)}
                      className={`w-20 h-20 object-cover rounded-md cursor-pointer border ${
                        selectedIndex === idx
                          ? "border-primary"
                          : "border-border"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">{rental.title}</h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {rental.location}, {rental.city}, {rental.state}
                </p>
                <span
                  className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    rental.status === "active"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {rental.status}
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
                <p className="text-xs text-muted-foreground mb-1">
                  Monthly Rent
                </p>
                <p className="text-xl font-bold text-accent">
                  ₹{rental.rent?.toLocaleString()}
                </p>
              </Card>
              <Card className="glass p-4">
                <p className="text-xs text-muted-foreground mb-1">Deposit</p>
                <p className="text-xl font-bold">
                  ₹{rental.deposit?.toLocaleString()}
                </p>
              </Card>
              <Card className="glass p-4">
                <p className="text-xs text-muted-foreground mb-1">Area</p>
                <p className="text-xl font-bold">{rental.area_sqft} sqft</p>
              </Card>
              <Card className="glass p-4">
                <p className="text-xs text-muted-foreground mb-1">Views</p>
                <p className="text-xl font-bold">{rental.views || 0}</p>
              </Card>
            </div>

            <Card className="glass p-6">
              <h3 className="font-bold mb-4">Property Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Bed className="w-5 h-5 text-accent" />
                  <span>{rental.bedrooms} Bedrooms</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="w-5 h-5 text-accent" />
                  <span>{rental.bathrooms} Bathrooms</span>
                </div>
                <div className="flex items-center gap-2">
                  <Square className="w-5 h-5 text-accent" />
                  <span>{rental.area_sqft} sqft</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-accent" />
                  <span>
                    {rental.availability_date
                      ? new Date(rental.availability_date).toLocaleDateString()
                      : "Available Now"}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="glass p-6">
              <h3 className="font-bold mb-3">Description</h3>
              <p className="text-muted-foreground">
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
                      className="px-3 py-1 bg-secondary rounded-full text-sm"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            <Card className="glass p-6">
              <h3 className="font-bold mb-4">Contact Information</h3>
              <div className="space-y-3">
                {rental.contact_name && (
                  <p className="text-muted-foreground">
                    Name: {rental.contact_name}
                  </p>
                )}
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-accent" />
                  {rental.contact_phone}
                </p>
                {rental.contact_email && (
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-accent" />
                    {rental.contact_email}
                  </p>
                )}
              </div>
            </Card>

            <Card className="glass p-6">
              <h3 className="font-bold mb-3">Additional Features</h3>
              <div className="flex flex-wrap gap-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${rental.furnished ? "bg-green-500/20 text-green-400" : "bg-secondary"}`}
                >
                  {rental.furnished ? "Furnished" : "Unfurnished"}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${rental.parking ? "bg-green-500/20 text-green-400" : "bg-secondary"}`}
                >
                  {rental.parking ? "Parking Available" : "No Parking"}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${rental.pets_allowed ? "bg-green-500/20 text-green-400" : "bg-secondary"}`}
                >
                  {rental.pets_allowed ? "Pets Allowed" : "No Pets"}
                </span>
              </div>
            </Card>
          </div>
        </div>
      </motion.div>

      {showImageModal && rental.images?.length > 0 && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          {/* Close */}
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-6 text-white text-2xl"
          >
            ✕
          </button>

          {/* Image */}
          <img
            src={rental.images[selectedIndex]}
            className="max-h-[90%] max-w-[90%] object-contain"
          />

          {/* Left */}
          <button
            onClick={() =>
              setSelectedIndex((prev) =>
                prev === 0 ? rental.images.length - 1 : prev - 1,
              )
            }
            className="absolute left-6 text-white text-3xl"
          >
            ‹
          </button>

          {/* Right */}
          <button
            onClick={() =>
              setSelectedIndex((prev) =>
                prev === rental.images.length - 1 ? 0 : prev + 1,
              )
            }
            className="absolute right-6 text-white text-3xl"
          >
            ›
          </button>
        </div>
      )}

      <RentalModal
        open={showModal}
        onOpenChange={setShowModal}
        rental={rental as any}
        onSave={() => {
          fetchRental();
          setShowModal(false);
        }}
      />
    </div>
  );
}
