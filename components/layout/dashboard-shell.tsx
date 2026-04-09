"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  User,
  LogOut,
  Menu,
  X,
  Home,
  Briefcase,
  Wrench,
  ShoppingCart,
  MessageSquare,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type UserRole = "customer" | "vendor" | "broker" | "engineer" | "admin";

interface DashboardLink {
  name: string;
  href: string;
  icon: React.ReactNode;
}

const roleLinks: Record<UserRole, DashboardLink[]> = {
  customer: [
    {
      name: "Overview",
      href: "/dashboard/customer",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: "Materials",
      href: "/dashboard/customer/materials",
      icon: <Package className="w-5 h-5" />,
    },
    {
      name: "Rentals",
      href: "/dashboard/customer/rentals",
      icon: <Home className="w-5 h-5" />,
    },
    {
      name: "Engineers",
      href: "/dashboard/customer/engineers",
      icon: <Wrench className="w-5 h-5" />,
    },
    {
      name: "Cart",
      href: "/dashboard/customer/cart",
      icon: <ShoppingCart className="w-5 h-5" />,
    },
    {
      name: "Orders",
      href: "/dashboard/customer/orders",
      icon: <Briefcase className="w-5 h-5" />,
    },
    {
      name: "AI Assistant",
      href: "/dashboard/customer/ai-assistant",
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      name: "Profile",
      href: "/dashboard/customer/profile",
      icon: <User className="w-5 h-5" />,
    },
  ],
  vendor: [
    {
      name: "Overview",
      href: "/dashboard/vendor",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: "Products",
      href: "/dashboard/vendor/products",
      icon: <Package className="w-5 h-5" />,
    },
    {
      name: "Orders",
      href: "/dashboard/vendor/orders",
      icon: <ShoppingCart className="w-5 h-5" />,
    },
    {
      name: "Profile",
      href: "/dashboard/vendor/profile",
      icon: <User className="w-5 h-5" />,
    },
  ],
  broker: [
    {
      name: "Overview",
      href: "/dashboard/broker",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: "Rentals",
      href: "/dashboard/broker/rentals",
      icon: <Home className="w-5 h-5" />,
    },
    {
      name: "Profile",
      href: "/dashboard/broker/profile",
      icon: <User className="w-5 h-5" />,
    },
  ],
  engineer: [
    {
      name: "Overview",
      href: "/dashboard/engineer",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: "Posts",
      href: "/dashboard/engineer/posts",
      icon: <Briefcase className="w-5 h-5" />,
    },
    {
      name: "AI Assistant",
      href: "/dashboard/engineer/ai-assistant",
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      name: "Profile",
      href: "/dashboard/engineer/profile",
      icon: <User className="w-5 h-5" />,
    },
  ],
  admin: [
    {
      name: "Overview",
      href: "/dashboard/admin",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: "Users",
      href: "/dashboard/admin/users",
      icon: <User className="w-5 h-5" />,
    },
    {
      name: "Content",
      href: "/dashboard/admin/content",
      icon: <Package className="w-5 h-5" />,
    },
  ],
};

export default function DashboardShell({
  role,
  children,
}: {
  role: UserRole;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const links = roleLinks[role];
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <motion.aside
        className={`fixed left-0 top-0 min-h-screen w-64 bg-card border-r border-border p-6 flex flex-col z-40 md:relative`}
        animate={{ x: isDesktop ? 0 : sidebarOpen ? 0 : -256 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">B</span>
            </div>
            <span className="font-bold text-lg hidden sm:inline">
              BuildNest
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-2 mb-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all group"
            >
              <span className="text-accent group-hover:scale-110 transition-transform">
                {link.icon}
              </span>
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="border-t border-border pt-4 space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 w-full flex flex-col">
        {/* Top Navigation */}
        <nav className="sticky top-0 h-16 border-b border-border bg-background/80 backdrop-blur-xl flex items-center px-6 z-30">
          <div className="flex items-center justify-between w-full">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-muted-foreground hover:text-foreground"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4 ml-auto">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
        </nav>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 md:hidden z-30"
            onClick={() => setSidebarOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
