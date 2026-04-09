"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { Product } from "@/lib/types";
import { motion } from "framer-motion";
import { Package, Search, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CustomerMaterialsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let query = supabase
          .from("products")
          .select("*")
          .eq("status", "active");

        if (category) {
          query = query.eq("category", category);
        }

        const { data } = await query;

        if (data) {
          const filtered = data.filter(
            (p: any) => p.name.toLowerCase().includes(search.toLowerCase()),
            // p.category.toLowerCase().includes(search.toLowerCase()),
          );
          setProducts(filtered);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, category, supabase]);

  const toggleWishlist = async (productId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (wishlist.includes(productId)) {
      await supabase
        .from("wishlist_items")
        .delete()
        .eq("product_id", productId)
        .eq("customer_id", user.id);

      setWishlist(wishlist.filter((id) => id !== productId));
    } else {
      await supabase.from("wishlist_items").insert({
        product_id: productId,
        customer_id: user.id,
      });

      setWishlist([...wishlist, productId]);
    }
  };

  const addToCart = async (product: Product) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("cart_items").insert({
      product_id: product.id,
      user_id: user.id,
      quantity: 1,
    });

    alert("Added to cart!");
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-64 bg-secondary animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const categories = ["All", "Steel", "Cement", "Brick", "Sand", "Timber"];

  return (
    <div className="p-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">Construction Materials</h1>
        <p className="text-muted-foreground">
          Browse and buy from verified vendors
        </p>
      </motion.div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search materials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-input border-border"
          />
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <Card className="glass p-12 text-center">
          <p className="text-muted-foreground">No materials found</p>
        </Card>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {products.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Link href={`/dashboard/customer/materials/${product.id}`}>
                <Card className="glass hover:border-accent/50 transition-all cursor-pointer h-full overflow-hidden group flex flex-col">
                  {product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt="Rental"
                      className="h-40 object-cover rounded-lg cursor-pointer"
                    />
                  ) : (
                    <div className="h-40 bg-linear-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-accent/30 transition-all">
                      <Package className="w-12 h-12 text-primary/50 group-hover:text-accent/70 transition-all" />
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                      {product.description}
                    </p>
                    <div className="mb-4">
                      <p className="text-2xl font-bold text-accent">
                        ₹{product.price.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Stock: {product.stock_quantity}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          addToCart(product);
                        }}
                        className="flex-1 bg-primary hover:bg-primary-dark"
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Add to Cart
                      </Button>
                    </div>
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
