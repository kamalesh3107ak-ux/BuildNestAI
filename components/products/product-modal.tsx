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
import { Product } from "@/lib/types";
import { useEffect, useState } from "react";

interface ProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSave: () => void;
}

export default function ProductModal({
  open,
  onOpenChange,
  product,
  onSave,
}: ProductModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    stock_quantity: 0,
    unit: "piece",
    location: "",
    contact_phone: "",
    contact_email: "",
  });
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || 0,
        stock_quantity: product.stock_quantity || 0,
        unit: product.unit || "piece",
        location: product.location || "",
        contact_phone: product.contact_phone || product.contact_email || "",
        contact_email: product.contact_email || "",
      });

      setImages(product.images || []);
    } else {
      setFormData({
        name: "",
        description: "",
        price: 0,
        stock_quantity: 0,
        unit: "piece",
        location: "",
        contact_phone: "",
        contact_email: "",
      });

      setImages([]);
    }
    setError("");
  }, [product, open]);

  const handleImageUpload = async (files: FileList | null) => {
    if (!files) return;

    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        const fileName = `${Date.now()}-${file.name}`;

        const { data, error } = await supabase.storage
          .from("product-images") // ⚠️ your bucket name
          .upload(fileName, file);

        if (error) throw error;

        const { data: publicUrl } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl.publicUrl);
      }

      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err: any) {
      setError(err.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be logged in");
        return;
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        stock_quantity: formData.stock_quantity,
        unit: formData.unit,
        location: formData.location,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email,
        images,
      };

      if (product) {
        // Update existing product
        const { error: updateError } = await supabase
          .from("products")
          .update(productData)
          .eq("id", product.id);

        if (updateError) throw updateError;
      } else {
        // Create new product
        const { error: insertError } = await supabase.from("products").insert({
          ...productData,
          vendor_id: user.id,
        });

        if (insertError) throw insertError;
      }

      onSave();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">
              Product Name *
            </label>
            <Input
              type="text"
              placeholder="e.g., Steel Rebar 12mm"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="bg-input border-border"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description *
            </label>
            <textarea
              placeholder="Describe your product..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="bg-input border px-4 py-2 h-[150px] rounded-lg no-scrollbar w-full"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Price (₹) *
              </label>
              <Input
                type="number"
                placeholder="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
                className="bg-input border-border"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Stock Quantity *
              </label>
              <Input
                type="number"
                placeholder="0"
                value={formData.stock_quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stock_quantity: parseInt(e.target.value) || 0,
                  })
                }
                className="bg-input border-border"
                required
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Unit</label>
            <Input
              type="text"
              placeholder="piece, kg, meter, etc."
              value={formData.unit}
              onChange={(e) =>
                setFormData({ ...formData, unit: e.target.value })
              }
              className="bg-input border-border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <Input
              type="text"
              placeholder="City or area"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="bg-input border-border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Contact Phone *
            </label>
            <Input
              type="tel"
              placeholder="+91 XXXXX XXXXX"
              value={formData.contact_phone}
              onChange={(e) =>
                setFormData({ ...formData, contact_phone: e.target.value })
              }
              className="bg-input border-border"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Contact Email
            </label>
            <Input
              type="email"
              placeholder="vendor@example.com"
              value={formData.contact_email}
              onChange={(e) =>
                setFormData({ ...formData, contact_email: e.target.value })
              }
              className="bg-input border-border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Product Images
            </label>

            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files)}
              className="bg-input border-border"
            />

            {uploading && (
              <p className="text-sm text-muted-foreground mt-2">
                Uploading images...
              </p>
            )}

            {/* Preview Images */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={img}
                    className="w-full h-20 object-cover rounded-md border"
                  />

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() =>
                      setImages(images.filter((_, i) => i !== idx))
                    }
                    className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1 rounded opacity-0 group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
              ))}
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
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {loading
                ? "Saving..."
                : product
                  ? "Update Product"
                  : "Add Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
