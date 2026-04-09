"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { CartItem, Product } from "@/lib/types";
import { motion } from "framer-motion";
import { ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CustomerCartPage() {
  const [cartItems, setCartItems] = useState<
    (CartItem & { product?: Product })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const supabase = createClient();

  // ✅ Fetch Cart
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data, error } = await supabase
          .from("cart_items")
          .select("*")
          .eq("user_id", user.id); // ✅ FIXED

        if (error) throw error;

        if (data) {
          const itemsWithProducts = await Promise.all(
            data.map(async (item: any) => {
              const { data: product } = await supabase
                .from("products")
                .select("*")
                .eq("id", item.product_id)
                .single();

              return { ...item, product };
            }),
          );

          setCartItems(itemsWithProducts);
        }
      } catch (err) {
        console.error("Fetch cart error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [supabase]);

  // ✅ Remove Item
  const handleRemove = async (cartItemId: string) => {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", cartItemId);

    if (!error) {
      setCartItems(cartItems.filter((item) => item.id !== cartItemId));
    }
  };

  // ✅ Total Price
  const totalPrice = cartItems.reduce((sum, item) => {
    return sum + (item.product ? item.product.price * item.quantity : 0);
  }, 0);

  // ✅ CHECKOUT FUNCTION (FULL FIXED)
  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    setCheckoutLoading(true);

    try {
      // 1️⃣ Get user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("User not logged in");

      // 2️⃣ Get profile (for shipping details)
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      // 3️⃣ Get vendor_id (from first product)
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("vendor_id")
        .eq("id", cartItems[0].product_id)
        .single();

      if (productError) throw productError;

      const vendorId = product.vendor_id;

      // 4️⃣ Create Order (ALL REQUIRED FIELDS)
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_id: user.id, // ✅ FIXED
          vendor_id: vendorId, // ✅ REQUIRED
          total_amount: Number(totalPrice), // ✅ SAFE
          status: "pending",
          payment_method: "COD",

          // ✅ FROM PROFILES
          shipping_address: profile.address || "Not Provided",
          shipping_city: profile.city || "",
          shipping_state: profile.state || "",
          shipping_zip: profile.zip || "",
          shipping_phone: profile.phone || "0000000000",

          notes: "",
        })
        .select()
        .single();

      if (orderError) {
        console.error("Order Error:", orderError);
        throw orderError;
      }

      // 5️⃣ Insert Order Items
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product?.price || 0,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Items Error:", itemsError);
        throw itemsError;
      }

      // 6️⃣ Clear Cart
      const { error: clearError } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id); // ✅ FIXED

      if (clearError) throw clearError;

      // 7️⃣ Update UI
      setCartItems([]);

      alert("✅ Order placed successfully (Cash on Delivery)");
    } catch (error) {
      console.error("Checkout error:", error);
      alert("❌ Failed to place order");
    } finally {
      setCheckoutLoading(false);
    }
  };

  // ✅ LOADING UI
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
        <p className="text-muted-foreground">Review and checkout your items</p>
      </motion.div>

      {cartItems.length === 0 ? (
        <Card className="glass p-12 text-center">
          <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Your cart is empty</p>
          <Link href="/dashboard/customer/materials">
            <Button className="bg-primary hover:bg-primary-dark">
              Continue Shopping
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* CART ITEMS */}
          <motion.div
            className="lg:col-span-2 space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {cartItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="glass p-6">
                  <div className="flex gap-4">
                    {item.product?.images?.length ? (
                      <img
                        src={item.product.images[0]}
                        alt="Product"
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="w-8 h-8 text-primary/50" />
                      </div>
                    )}

                    <div className="flex-1">
                      <h3 className="font-bold mb-2">{item.product?.name}</h3>

                      <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-muted-foreground">Price</p>
                          <p className="font-bold">
                            ₹{item.product?.price.toLocaleString()}
                          </p>
                        </div>

                        <div>
                          <p className="text-muted-foreground">Qty</p>
                          <p className="font-bold">{item.quantity}</p>
                        </div>

                        <div>
                          <p className="text-muted-foreground">Subtotal</p>
                          <p className="font-bold text-accent">
                            ₹
                            {(
                              (item.product?.price || 0) * item.quantity
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleRemove(item.id)}
                      variant="outline"
                      className="border-destructive text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* SUMMARY */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="glass p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-4">Order Summary</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <p className="text-muted-foreground">Items</p>
                  <p>{cartItems.length}</p>
                </div>

                <div className="flex justify-between text-sm">
                  <p className="text-muted-foreground">Subtotal</p>
                  <p>₹{totalPrice.toLocaleString()}</p>
                </div>

                <div className="flex justify-between text-sm">
                  <p className="text-muted-foreground">Shipping</p>
                  <p>₹0</p>
                </div>

                <div className="border-t pt-3 flex justify-between font-bold">
                  <p>Total</p>
                  <p className="text-accent">₹{totalPrice.toLocaleString()}</p>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full bg-primary hover:bg-primary-dark mb-3"
              >
                {checkoutLoading
                  ? "Placing Order..."
                  : "Proceed to Checkout (COD)"}
              </Button>

              <Link href="/dashboard/customer/materials">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
