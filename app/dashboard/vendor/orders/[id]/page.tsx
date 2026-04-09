'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { ArrowLeft, Package, User, MapPin, Phone, Clock } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Order {
  id: string
  customer_id: string
  vendor_id: string
  status: string
  total_amount: number
  shipping_address: string
  shipping_city: string
  shipping_state: string
  shipping_zip: string
  shipping_phone: string
  payment_method: string
  notes: string
  created_at: string
  updated_at: string
  customer?: {
    full_name: string
    email: string
    phone: string
  }
  items?: Array<{
    id: string
    quantity: number
    price: number
    product: {
      name: string
    }
  }>
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  processing: 'bg-purple-500/20 text-purple-400',
  shipped: 'bg-indigo-500/20 text-indigo-400',
  delivered: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

export default function VendorOrderDetailPage() {
  const params = useParams()
  const orderId = params.id as string
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const supabase = createClient()

  const fetchOrder = async () => {
    try {
      const { data } = await supabase
        .from('orders')
        .select(`
          *,
          customer:profiles!customer_id(full_name, email, phone),
          items:order_items(id, quantity, price, product:products(name))
        `)
        .eq('id', orderId)
        .single()

      setOrder(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrder()
  }, [orderId])

  const updateStatus = async (newStatus: string) => {
    setUpdating(true)
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (!error) {
        setOrder(prev => prev ? { ...prev, status: newStatus } : null)
      }
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <Card className="h-96 bg-secondary animate-pulse" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-8">
        <Card className="glass p-8 text-center">
          <p className="text-muted-foreground">Order not found</p>
          <Link href="/dashboard/vendor/orders">
            <Button className="mt-4">Back to Orders</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const statusFlow = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link href="/dashboard/vendor/orders">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
        </Link>

        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Order Details</h1>
            <p className="text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusColors[order.status] || 'bg-gray-500/20'}`}>
            {order.status}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-accent" />
                Order Items
              </h3>
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-4 bg-secondary/50 rounded-lg">
                    <div>
                      <p className="font-medium">{item.product?.name || 'Product'}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-accent">₹{item.price.toLocaleString()}</p>
                  </div>
                )) || (
                  <p className="text-muted-foreground">No items found</p>
                )}
              </div>
              <div className="border-t border-border mt-4 pt-4 flex justify-between">
                <span className="font-bold">Total Amount</span>
                <span className="text-xl font-bold text-accent">₹{order.total_amount?.toLocaleString()}</span>
              </div>
            </Card>

            {/* Update Status */}
            <Card className="glass p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" />
                Update Order Status
              </h3>
              <div className="flex flex-wrap gap-2">
                {statusFlow.map((status) => (
                  <Button
                    key={status}
                    onClick={() => updateStatus(status)}
                    disabled={updating || order.status === status}
                    variant={order.status === status ? 'default' : 'outline'}
                    className={order.status === status ? 'bg-primary' : 'border-border'}
                    size="sm"
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
                <Button
                  onClick={() => updateStatus('cancelled')}
                  disabled={updating || order.status === 'cancelled' || order.status === 'delivered'}
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive/10"
                  size="sm"
                >
                  Cancel Order
                </Button>
              </div>
            </Card>
          </div>

          {/* Customer & Shipping Info */}
          <div className="space-y-6">
            <Card className="glass p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-accent" />
                Customer Details
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-medium">{order.customer?.full_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{order.customer?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{order.customer?.phone || order.shipping_phone}</p>
                </div>
              </div>
            </Card>

            <Card className="glass p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-accent" />
                Shipping Address
              </h3>
              <div className="space-y-2 text-sm">
                <p>{order.shipping_address}</p>
                <p>{order.shipping_city}, {order.shipping_state} {order.shipping_zip}</p>
              </div>
            </Card>

            <Card className="glass p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-accent" />
                Contact for Delivery
              </h3>
              <p className="text-lg font-medium">{order.shipping_phone}</p>
            </Card>

            <Card className="glass p-6">
              <h3 className="font-bold mb-4">Order Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium">{order.payment_method?.toUpperCase() || 'COD'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ordered On</span>
                  <span className="font-medium">{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="font-medium">{new Date(order.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            </Card>

            {order.notes && (
              <Card className="glass p-6">
                <h3 className="font-bold mb-3">Customer Notes</h3>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </Card>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
