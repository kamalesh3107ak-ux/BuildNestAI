"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { Product } from "@/lib/types";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Mail,
  MapPin,
  Package,
  Phone,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const supabase = createClient();
  const [activeImage, setActiveImage] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
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

    fetchProduct();
  }, [productId, supabase]);

  const handleAddToCart = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !product) return;

    await supabase.from("cart_items").insert({
      product_id: product.id,
      user_id: user.id,
      quantity: 1,
    });

    alert("Added to cart!");
  };

  const toggleWishlist = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !product) return;

    if (wishlist.includes(product.id)) {
      await supabase
        .from("wishlist_items")
        .delete()
        .eq("product_id", product.id)
        .eq("customer_id", user.id);

      setWishlist(wishlist.filter((id) => id !== product.id));
    } else {
      await supabase.from("wishlist_items").insert({
        product_id: product.id,
        customer_id: user.id,
      });

      setWishlist([...wishlist, product.id]);
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
        <Card className="p-8 text-center">
          <p>Product not found</p>
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
        <Link href="/dashboard/customer/materials">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Materials
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
                <Card className="glass p-8 h-80 flex items-center justify-center bg-linear-to-br from-primary/20 to-accent/20">
                  <Package className="w-24 h-24 text-primary/50" />
                </Card>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
              <div className="flex gap-4">
                <div>
                  <p className="text-muted-foreground">Stock</p>
                  <p className="font-medium">
                    {product.stock_quantity} available
                  </p>
                </div>
              </div>
            </div>

            <Card className="glass p-6">
              <p className="text-3xl font-bold text-accent mb-2">
                ₹{product.price.toLocaleString()}
              </p>
              <p className="text-muted-foreground">Per unit</p>
            </Card>

            <Card className="glass p-6">
              <h3 className="font-bold mb-3">Description</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </Card>

            <Card className="glass p-6">
              <h3 className="font-bold mb-3">Location & Contact</h3>
              <div className="space-y-2 text-muted-foreground">
                <p className="flex items-center justify-start">
                  <MapPin className="size-4" />
                  <span className="ms-1">{product.location}</span>
                </p>
                <p className="flex items-center justify-start">
                  <Phone className="size-4" />
                  <span className="ms-1">{product.contact_phone}</span>
                </p>
                <p className="flex items-center justify-start">
                  <Mail className="size-4" />
                  <span className="ms-1">{product.contact_email}</span>
                </p>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                className="flex-1 bg-primary hover:bg-primary-dark h-12"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
            </div>
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
    </div>
  );
}
