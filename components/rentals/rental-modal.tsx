"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { createClient } from "@/lib/supabase/client";
import { RentalHouse } from "@/lib/types";
import { useEffect, useState } from "react";

interface RentalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rental: RentalHouse | null;
  onSave: () => void;
}

export default function RentalModal({
  open,
  onOpenChange,
  rental,
  onSave,
}: RentalModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    address: "",
    city: "",
    state: "",
    rent: 0,
    deposit: 0,
    bedrooms: 1,
    bathrooms: 1,
    area_sqft: 0,
    property_type: "apartment",
    contact_name: "",
    contact_phone: "",
    contact_email: "",
    availability_date: "",
    furnished: false,
    parking: false,
    pets_allowed: false,
  });
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (rental) {
      setImages(rental.images || []);
      setFormData({
        title: rental.title,
        description: rental.description,
        location: rental.location,
        address: rental.address || "",
        city: rental.city || "",
        state: rental.state || "",
        rent: rental.rent,
        deposit: rental.deposit,
        bedrooms: rental.bedrooms,
        bathrooms: rental.bathrooms,
        area_sqft: rental.area_sqft,
        property_type: rental.property_type || "apartment",
        contact_name: rental.contact_name || "",
        contact_phone: rental.contact_phone || "",
        contact_email: rental.contact_email || "",
        availability_date: rental.availability_date || "",
        furnished: rental.furnished || false,
        parking: rental.parking || false,
        pets_allowed: rental.pets_allowed || false,
      });
    } else {
      setImages([]);
      setFormData({
        title: "",
        description: "",
        location: "",
        address: "",
        city: "",
        state: "",
        rent: 0,
        deposit: 0,
        bedrooms: 1,
        bathrooms: 1,
        area_sqft: 0,
        property_type: "apartment",
        contact_name: "",
        contact_phone: "",
        contact_email: "",
        availability_date: "",
        furnished: false,
        parking: false,
        pets_allowed: false,
      });
    }
  }, [rental, open]);

  const handleImageUpload = async (files: FileList | null) => {
    if (!files) return;

    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        const fileName = `${Date.now()}-${file.name}`;

        const { error } = await supabase.storage
          .from("rental-images") // ✅ your bucket name
          .upload(fileName, file);

        if (error) throw error;

        const { data } = supabase.storage
          .from("rental-images")
          .getPublicUrl(fileName);

        uploadedUrls.push(data.publicUrl);
      }

      setImages((prev) => [...prev, ...uploadedUrls]);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      if (rental) {
        const { error } = await supabase
          .from("rental_houses")
          .update({ ...formData, images })
          .eq("id", rental.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("rental_houses").insert({
          ...formData,
          broker_id: user.id,
          images,
          amenities: [],
          views: 0,
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
      <DialogContent className="glass border-border max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {rental ? "Edit Rental" : "Add Rental Property"}
          </DialogTitle>
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
            placeholder="Location (Area/Landmark)"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            className="bg-input border-border"
            required
          />

          <Input
            placeholder="Full Address"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            className="bg-input border-border"
          />

          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="City"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              className="bg-input border-border"
            />
            <Input
              placeholder="State"
              value={formData.state}
              onChange={(e) =>
                setFormData({ ...formData, state: e.target.value })
              }
              className="bg-input border-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Rent (₹/month)"
              value={formData.rent}
              onChange={(e) =>
                setFormData({ ...formData, rent: parseFloat(e.target.value) })
              }
              className="bg-input border-border"
              required
            />
            <Input
              type="number"
              placeholder="Deposit (₹)"
              value={formData.deposit}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  deposit: parseFloat(e.target.value),
                })
              }
              className="bg-input border-border"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Input
              type="number"
              placeholder="Bedrooms"
              value={formData.bedrooms}
              onChange={(e) =>
                setFormData({ ...formData, bedrooms: parseInt(e.target.value) })
              }
              className="bg-input border-border"
              required
              min="1"
            />
            <Input
              type="number"
              placeholder="Bathrooms"
              value={formData.bathrooms}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bathrooms: parseInt(e.target.value),
                })
              }
              className="bg-input border-border"
              required
              min="1"
            />
            <Input
              type="number"
              placeholder="Area (sqft)"
              value={formData.area_sqft}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  area_sqft: parseFloat(e.target.value),
                })
              }
              className="bg-input border-border"
              required
            />
          </div>

          <Input
            placeholder="Property Type (e.g., Apartment, House, Villa)"
            value={formData.property_type}
            onChange={(e) =>
              setFormData({ ...formData, property_type: e.target.value })
            }
            className="bg-input border-border"
          />

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">House Images</p>

            {/* Upload Input */}
            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files)}
              className="bg-input border-border"
            />

            {/* Preview */}
            <div className="flex gap-2 flex-wrap">
              {images.map((img, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={img}
                    className="w-20 h-20 object-cover rounded-md border"
                  />

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() =>
                      setImages(images.filter((_, i) => i !== idx))
                    }
                    className="absolute top-0 right-0 bg-black/70 text-white text-xs px-1 rounded"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {uploading && (
              <p className="text-xs text-muted-foreground">Uploading...</p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Contact Information</p>
            <Input
              placeholder="Contact Name"
              value={formData.contact_name}
              onChange={(e) =>
                setFormData({ ...formData, contact_name: e.target.value })
              }
              className="bg-input border-border"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Phone"
                value={formData.contact_phone}
                onChange={(e) =>
                  setFormData({ ...formData, contact_phone: e.target.value })
                }
                className="bg-input border-border"
              />
              <Input
                type="email"
                placeholder="Email"
                value={formData.contact_email}
                onChange={(e) =>
                  setFormData({ ...formData, contact_email: e.target.value })
                }
                className="bg-input border-border"
              />
            </div>
          </div>

          <Input
            type="date"
            placeholder="Available From"
            value={formData.availability_date}
            onChange={(e) =>
              setFormData({ ...formData, availability_date: e.target.value })
            }
            className="bg-input border-border"
          />

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Amenities</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="furnished"
                  checked={formData.furnished}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, furnished: checked })
                  }
                />
                <Label htmlFor="furnished">Furnished</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="parking"
                  checked={formData.parking}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, parking: checked })
                  }
                />
                <Label htmlFor="parking">Parking</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="pets"
                  checked={formData.pets_allowed}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, pets_allowed: checked })
                  }
                />
                <Label htmlFor="pets">Pets</Label>
              </div>
            </div>
          </div>

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
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
