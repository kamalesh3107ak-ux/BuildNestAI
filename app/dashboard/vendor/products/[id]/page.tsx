"use client";

import ProductModal from "@/components/products/product-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { ArrowLeft, Edit, Package, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Product {
  id: string;
  vendor_id: string;
  name: string;
  description: string;
  category_id: string;
  price: number;
  stock_quantity: number;
  unit: string;
  images: string[];
  location: string;
  contact_phone: string;
  contact_email: string;
  status: string;
  views: number;
  created_at: string;
  updated_at: string;
}

export default function VendorProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const supabase = createClient();
  const [activeImage, setActiveImage] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);

  const fetchProduct = async () => {
    try {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      setProduct(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (!error) {
      router.push("/dashboard/vendor/products");
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <Card className="h-96 bg-secondary animate-pulse" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8">
        <Card className="glass p-8 text-center">
          <p className="text-muted-foreground">Product not found</p>
          <Link href="/dashboard/vendor/products">
            <Button className="mt-4">Back to Products</Button>
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
        <Link href="/dashboard/vendor/products">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image */}
          <div className="lg:col-span-1">
            <div className="lg:col-span-1 space-y-4">
              {product.images && product.images.length > 0 ? (
                <>
                  {/* Main Image */}
                  <Card className="glass overflow-hidden relative">
                    <motion.img
                      key={activeImage}
                      src={product.images[activeImage]}
                      onClick={() => setShowImageModal(true)}
                      className="w-full h-80 object-cover cursor-zoom-in"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    />

                    {/* Left Arrow */}
                    {product.images.length > 1 && (
                      <button
                        onClick={() =>
                          setActiveImage((prev) =>
                            prev === 0 ? product.images.length - 1 : prev - 1,
                          )
                        }
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-3 py-1 rounded-full"
                      >
                        ←
                      </button>
                    )}

                    {/* Right Arrow */}
                    {product.images.length > 1 && (
                      <button
                        onClick={() =>
                          setActiveImage((prev) =>
                            prev === product.images.length - 1 ? 0 : prev + 1,
                          )
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-3 py-1 rounded-full"
                      >
                        →
                      </button>
                    )}
                  </Card>

                  {/* Thumbnails */}
                  <div className="flex gap-2 overflow-x-auto">
                    {product.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        onClick={() => setActiveImage(idx)}
                        className={`w-16 h-16 object-cover rounded-md cursor-pointer border-2 transition ${
                          activeImage === idx
                            ? "border-primary"
                            : "border-transparent opacity-70"
                        }`}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <Card className="glass p-8 h-80 flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                  <Package className="w-24 h-24 text-primary/50" />
                </Card>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    product.status === "active"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {product.status}
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
                <p className="text-xs text-muted-foreground mb-1">Price</p>
                <p className="text-xl font-bold text-accent">
                  ₹{product.price?.toLocaleString()}
                </p>
              </Card>
              <Card className="glass p-4">
                <p className="text-xs text-muted-foreground mb-1">Stock</p>
                <p className="text-xl font-bold">{product.stock_quantity}</p>
              </Card>
              <Card className="glass p-4">
                <p className="text-xs text-muted-foreground mb-1">Unit</p>
                <p className="text-xl font-bold">{product.unit || "piece"}</p>
              </Card>
              <Card className="glass p-4">
                <p className="text-xs text-muted-foreground mb-1">Views</p>
                <p className="text-xl font-bold">{product.views || 0}</p>
              </Card>
            </div>

            <Card className="glass p-6">
              <h3 className="font-bold mb-3">Description</h3>
              <p className="text-muted-foreground">
                {product.description || "No description provided"}
              </p>
            </Card>

            <Card className="glass p-6">
              <h3 className="font-bold mb-3">Contact Information</h3>
              <div className="space-y-2 text-muted-foreground">
                {product.location && <p>Location: {product.location}</p>}
                {product.contact_phone && <p>Phone: {product.contact_phone}</p>}
                {product.contact_email && <p>Email: {product.contact_email}</p>}
              </div>
            </Card>

            <Card className="glass p-6">
              <h3 className="font-bold mb-3">Product Info</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p>{new Date(product.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Updated</p>
                  <p>{new Date(product.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </motion.div>

      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          {/* Close button */}
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 text-white text-2xl"
          >
            ✕
          </button>

          {/* Left Arrow */}
          {product.images.length > 1 && (
            <button
              onClick={() =>
                setActiveImage((prev) =>
                  prev === 0 ? product.images.length - 1 : prev - 1,
                )
              }
              className="absolute left-4 text-white text-3xl"
            >
              ‹
            </button>
          )}

          {/* Image */}
          <motion.img
            key={activeImage}
            src={product.images[activeImage]}
            className="max-h-[90%] max-w-[90%] object-contain rounded-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          />

          {/* Right Arrow */}
          {product.images.length > 1 && (
            <button
              onClick={() =>
                setActiveImage((prev) =>
                  prev === product.images.length - 1 ? 0 : prev + 1,
                )
              }
              className="absolute right-4 text-white text-3xl"
            >
              ›
            </button>
          )}
        </div>
      )}

      <ProductModal
        open={showModal}
        onOpenChange={setShowModal}
        product={product as any}
        onSave={() => {
          fetchProduct();
          setShowModal(false);
        }}
      />
    </div>
  );
}
