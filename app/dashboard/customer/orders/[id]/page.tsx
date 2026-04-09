'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { ArrowLeft, Package, MapPin, Phone, Clock, CheckCircle, Truck, Box } from 'lucide-react'
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
  vendor?: {
    full_name: string
    business_name: string
    phone: string
  }
  items?: Array<{
    id: string
    quantity: number
    price: number
    product: {
      name: string
      images: string[]
    }
  }>
}

const statusSteps = [
  { key: 'pending', label: 'Pending', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'processing', label: 'Processing', icon: Box },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Package },
]

export default function CustomerOrderDetailPage() {
  const params = useParams()
  const orderId = params.id as string
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await supabase
          .from('orders')
          .select(`
            *,
            vendor:profiles!vendor_id(full_name, business_name, phone),
            items:order_items(id, quantity, price, product:products(name, images))
          `)
          .eq('id', orderId)
          .single()

        setOrder(data)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId, supabase])

  const getCurrentStepIndex = () => {
    if (!order) return 0
    if (order.status === 'cancelled') return -1
    return statusSteps.findIndex(s => s.key === order.status)
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
          <Link href="/dashboard/customer/orders">
            <Button className="mt-4">Back to Orders</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const currentStep = getCurrentStepIndex()

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link href="/dashboard/customer/orders">
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
          {order.status === 'cancelled' ? (
            <span className="px-4 py-2 rounded-full text-sm font-medium bg-red-500/20 text-red-400">
              Cancelled
            </span>
          ) : (
            <span className="px-4 py-2 rounded-full text-sm font-medium bg-accent/20 text-accent">
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          )}
        </div>

        {/* Order Status Timeline */}
        {order.status !== 'cancelled' && (
          <Card className="glass p-6 mb-8">
            <h3 className="font-bold mb-6">Order Progress</h3>
            <div className="flex justify-between items-center relative">
              {/* Progress Line */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
              <div 
                className="absolute top-5 left-0 h-0.5 bg-accent transition-all duration-500"
                style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
              />

              {statusSteps.map((step, idx) => {
                const Icon = step.icon
                const isCompleted = idx <= currentStep
                const isCurrent = idx === currentStep

                return (
                  <div key={step.key} className="flex flex-col items-center relative z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-accent text-white'
                          : 'bg-secondary text-muted-foreground'
                      } ${isCurrent ? 'ring-4 ring-accent/30' : ''}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className={`mt-2 text-xs font-medium ${isCompleted ? 'text-accent' : 'text-muted-foreground'}`}>
                      {step.label}
                    </p>
                  </div>
                )
              })}
            </div>
          </Card>
        )}

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
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                      <Package className="w-8 h-8 text-primary/50" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.product?.name || 'Product'}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-accent">₹{item.price.toLocaleString()}</p>
                  </div>
                )) || (
                  <p className="text-muted-foreground">No items found</p>
                )}
              </div>
              <div className="border-t border-border mt-4 pt-4">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Subtotal</span>
                  <span>₹{order.total_amount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-3">
                  <span>Total</span>
                  <span className="text-accent">₹{order.total_amount?.toLocaleString()}</span>
                </div>
              </div>
            </Card>

            <Card className="glass p-6">
              <h3 className="font-bold mb-4">Order Timeline</h3>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-2 h-2 mt-2 rounded-full bg-accent" />
                  <div>
                    <p className="font-medium">Order Placed</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                {order.updated_at !== order.created_at && (
                  <div className="flex gap-4 items-start">
                    <div className="w-2 h-2 mt-2 rounded-full bg-accent" />
                    <div>
                      <p className="font-medium">Last Updated</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.updated_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="glass p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-accent" />
                Shipping Address
              </h3>
              <div className="text-sm space-y-1">
                <p>{order.shipping_address}</p>
                <p>{order.shipping_city}, {order.shipping_state} {order.shipping_zip}</p>
                <p className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                  <Phone className="w-4 h-4 text-accent" />
                  {order.shipping_phone}
                </p>
              </div>
            </Card>

            <Card className="glass p-6">
              <h3 className="font-bold mb-4">Vendor Information</h3>
              <div className="text-sm space-y-2">
                <p>{order.vendor?.full_name || order.vendor?.business_name}</p>
                {order.vendor?.business_name && order.vendor?.full_name && (
                  <p className="text-muted-foreground">{order.vendor.business_name}</p>
                )}
              </div>
            </Card>

            <Card className="glass p-6">
              <h3 className="font-bold mb-4">Payment</h3>
              <div className="text-sm">
                <p className="text-muted-foreground">Payment Method</p>
                <p className="font-medium">{order.payment_method?.toUpperCase() || 'Cash on Delivery'}</p>
              </div>
            </Card>

            {order.notes && (
              <Card className="glass p-6">
                <h3 className="font-bold mb-3">Your Notes</h3>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </Card>
            )}

            {order.status !== 'delivered' && order.status !== 'cancelled' && (
              <Button variant="outline" className="w-full border-destructive text-destructive hover:bg-destructive/10">
                Cancel Order
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
