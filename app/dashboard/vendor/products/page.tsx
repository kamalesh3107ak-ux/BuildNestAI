"use client";

import ProductModal from "@/components/products/product-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { Product } from "@/lib/types";
import { motion } from "framer-motion";
import { Edit, Package, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function VendorProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const supabase = createClient();

  const fetchProducts = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("vendor_id", user.id)
        .order("created_at", { ascending: false });

      setProducts(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [supabase]);

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (!error) {
      setProducts(products.filter((p) => p.id !== productId));
    }
  };

  const handleSave = async () => {
    await fetchProducts();
    setShowModal(false);
    setEditingProduct(null);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
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
          <h1 className="text-3xl font-bold mb-2">Your Products</h1>
          <p className="text-muted-foreground">
            Manage and sell your construction materials
          </p>
        </motion.div>
        <Button
          onClick={() => {
            setEditingProduct(null);
            setShowModal(true);
          }}
          className="bg-primary hover:bg-primary-dark h-10 px-6"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-input border-border"
        />
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <Card className="glass p-12 text-center">
          <p className="text-muted-foreground">
            No products yet. Create your first one!
          </p>
        </Card>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Link href={`/dashboard/vendor/products/${product.id}`}>
                <Card className="glass hover:border-accent/50 transition-all cursor-pointer h-full overflow-hidden group">
                  {product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt="Rental"
                      className="h-40 object-cover rounded-lg cursor-pointer"
                    />
                  ) : (
                    <div className="h-40 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-accent/30 transition-all">
                      <Package className="w-12 h-12 text-primary/50 group-hover:text-accent/70 transition-all" />
                    </div>
                  )}

                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Price</p>
                        <p className="text-lg font-bold text-accent">
                          ₹{product.price.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Stock</p>
                        <p className="text-lg font-bold">
                          {product.stock_quantity}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          setEditingProduct(product);
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
                          handleDelete(product.id);
                        }}
                        size="sm"
                        variant="outline"
                        className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
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

      {/* Modal */}
      <ProductModal
        open={showModal}
        onOpenChange={setShowModal}
        product={editingProduct}
        onSave={handleSave}
      />
    </div>
  );
}
