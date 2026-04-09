"use client";

import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Briefcase,
  Home,
  MessageSquare,
  Package,
  ShoppingCart,
  Wrench,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Package,
    title: "Browse Materials",
    description:
      "Explore thousands of construction materials from verified vendors",
    href: "/dashboard/customer/materials",
    color: "bg-blue-500/20",
  },
  {
    icon: Home,
    title: "Find Rentals",
    description: "Discover rental properties with instant broker contact",
    href: "/dashboard/customer/rentals",
    color: "bg-green-500/20",
  },
  {
    icon: Wrench,
    title: "Hire Engineers",
    description: "Connect with professional engineers for your projects",
    href: "/dashboard/customer/engineers",
    color: "bg-purple-500/20",
  },
  {
    icon: ShoppingCart,
    title: "Your Cart",
    description: "Manage items and proceed to checkout",
    href: "/dashboard/customer/cart",
    color: "bg-orange-500/20",
  },
  {
    icon: Briefcase,
    title: "My Orders",
    description: "View order history, status, and delivery updates",
    href: "/dashboard/customer/orders",
    color: "bg-pink-500/20",
  },
  {
    icon: MessageSquare,
    title: "AI Assistant",
    description: "Get personalized construction guidance",
    href: "/dashboard/customer/ai-assistant",
    color: "bg-indigo-500/20",
  },
];

export default function CustomerDashboard() {
  return (
    <div className="p-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2 gradient-text">
          Welcome to BuildNest
        </h1>
        <p className="text-muted-foreground text-lg">
          Your one-stop solution for construction materials, rentals, and
          engineers
        </p>
      </motion.div>

      {/* Feature Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
      >
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link href={feature.href}>
                <Card className="glass p-6 hover:border-accent/50 transition-all cursor-pointer h-full group">
                  <div
                    className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
