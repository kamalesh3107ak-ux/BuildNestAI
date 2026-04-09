'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Order, Product } from '@/lib/types'
import Link from 'next/link'
import { Eye } from 'lucide-react'

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<(Order & { product?: Product })[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: ordersData } = await supabase
          .from('orders')
          .select('*')
          .eq('vendor_id', user.id)
          .order('created_at', { ascending: false })

        if (ordersData) {
          // Fetch product details for each order
          const ordersWithProducts = await Promise.all(
            ordersData.map(async (order) => {
              const { data: product } = await supabase
                .from('products')
                .select('*')
                .eq('id', order.product_id)
                .single()

              return { ...order, product }
            })
          )

          setOrders(ordersWithProducts)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [supabase])

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      confirmed: 'bg-blue-500/20 text-blue-400',
      shipped: 'bg-purple-500/20 text-purple-400',
      delivered: 'bg-green-500/20 text-green-400',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-500/20 text-gray-400'
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="h-16 bg-secondary animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">Orders</h1>
        <p className="text-muted-foreground">Manage all customer orders for your products</p>
      </motion.div>

      {orders.length === 0 ? (
        <Card className="glass p-12 text-center">
          <p className="text-muted-foreground">No orders yet</p>
        </Card>
      ) : (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Link href={`/dashboard/vendor/orders/${order.id}`}>
                <Card className="glass p-6 hover:border-accent/50 transition-all cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold mb-2">{order.product?.name || 'Unknown Product'}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Order ID</p>
                          <p className="font-medium truncate">{order.id.slice(0, 8)}...</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total</p>
                          <p className="font-medium">₹{order.total_amount?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Status</p>
                          <p className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Eye className="w-5 h-5 text-muted-foreground mt-2" />
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
