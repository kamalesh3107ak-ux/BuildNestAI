"use client";

import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { Clock, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function VendorDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    pendingOrders: 0,
  });
  const [chartData, setChartData] = useState<any>({
    revenue: [],
    orders: [],
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch orders
        const { data: orders } = await supabase
          .from("orders")
          .select("*")
          .eq("vendor_id", user.id);

        // Fetch products
        const { data: products } = await supabase
          .from("products")
          .select("*")
          .eq("vendor_id", user.id);

        if (orders && products) {
          const totalRevenue = orders.reduce(
            (sum: any, order: any) => sum + order.total_price,
            0,
          );
          const pendingOrders = orders.filter(
            (o: any) => o.status === "pending",
          ).length;

          setStats({
            totalOrders: orders.length,
            totalRevenue,
            totalProducts: products.length,
            pendingOrders,
          });

          // 📊 Generate Revenue by Month (REAL DATA)
          const monthlyRevenueMap: Record<string, number> = {};

          orders.forEach((order: any) => {
            const date = new Date(order.created_at); // ⚠️ ensure this field exists
            const month = date.toLocaleString("default", { month: "short" });

            if (!monthlyRevenueMap[month]) {
              monthlyRevenueMap[month] = 0;
            }

            monthlyRevenueMap[month] += order.total_price;
          });

          // Convert to array
          const revenueData = Object.entries(monthlyRevenueMap).map(
            ([month, revenue]) => ({
              month,
              revenue,
            }),
          );

          // 📊 Order Distribution
          const orderData = [
            { status: "Pending", value: pendingOrders },
            {
              status: "Confirmed",
              value: orders.filter((o: any) => o.status === "confirmed").length,
            },
            {
              status: "Shipped",
              value: orders.filter((o: any) => o.status === "shipped").length,
            },
            {
              status: "Delivered",
              value: orders.filter((o: any) => o.status === "delivered").length,
            },
          ];

          // ✅ SET REAL DATA HERE
          setChartData({
            revenue: revenueData,
            orders: orderData,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [supabase]);

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="h-24 bg-secondary animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "bg-blue-500/20",
    },
    {
      label: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: "bg-green-500/20",
    },
    {
      label: "Products",
      value: stats.totalProducts,
      icon: Package,
      color: "bg-purple-500/20",
    },
    {
      label: "Pending Orders",
      value: stats.pendingOrders,
      icon: Clock,
      color: "bg-orange-500/20",
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2">Vendor Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back to your seller dashboard
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
      >
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="glass p-6">
                <div
                  className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center mb-4`}
                >
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {/* Revenue Chart */}
        <Card className="glass p-6">
          <h3 className="text-lg font-bold mb-4">Revenue Trend</h3>

          {chartData.revenue.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No revenue data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2530" />
                <XAxis dataKey="month" stroke="#a0a0aa" />
                <YAxis stroke="#a0a0aa" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1622",
                    border: "none",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#9d4edd"
                  strokeWidth={2}
                  dot={{ fill: "#c77dff" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Order Distribution */}
        <Card className="glass p-6">
          <h3 className="text-lg font-bold mb-4">Order Distribution</h3>

          {chartData.orders.every((item: any) => item.value === 0) ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No order data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.orders}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, value }) => `${status}: ${value}`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {chartData.orders.map((_: any, index: any) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={["#9d4edd", "#c77dff", "#e0aaff", "#7209b7"][index]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1622",
                    border: "none",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
