'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Heart, ShoppingCart } from 'lucide-react'
import { WishlistItem, Product } from '@/lib/types'
import { Package } from 'lucide-react'

export default function CustomerWishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<(WishlistItem & { product?: Product })[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
          .from('wishlist_items')
          .select('*')
          .eq('user_id', user.id)

        if (data) {
          const itemsWithProducts = await Promise.all(
            data.map(async (item) => {
              const { data: product } = await supabase
                .from('products')
                .select('*')
                .eq('id', item.product_id)
                .single()

              return { ...item, product }
            })
          )

          setWishlistItems(itemsWithProducts)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchWishlist()
  }, [supabase])

  const handleRemove = async (wishlistItemId: string) => {
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('id', wishlistItemId)

    if (!error) {
      setWishlistItems(wishlistItems.filter(item => item.id !== wishlistItemId))
    }
  }

  const addToCart = async (product: Product) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('cart_items')
      .insert({
        product_id: product.id,
        user_id: user.id,
        quantity: 1,
      })

    alert('Added to cart!')
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-64 bg-secondary animate-pulse" />
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
        <h1 className="text-3xl font-bold mb-2">Wishlist</h1>
        <p className="text-muted-foreground">Your saved materials and items</p>
      </motion.div>

      {wishlistItems.length === 0 ? (
        <Card className="glass p-12 text-center">
          <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Your wishlist is empty</p>
          <Button className="bg-primary hover:bg-primary-dark">Continue Shopping</Button>
        </Card>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {wishlistItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="glass hover:border-accent/50 transition-all overflow-hidden group h-full flex flex-col">
                <div className="h-40 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-accent/30 transition-all">
                  <Package className="w-12 h-12 text-primary/50 group-hover:text-accent/70 transition-all" />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{item.product?.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                    {item.product?.description}
                  </p>
                  <div className="mb-4">
                    <p className="text-2xl font-bold text-accent">₹{item.product?.price.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Stock: {item.product?.stock_quantity}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => item.product && addToCart(item.product)}
                      className="flex-1 bg-primary hover:bg-primary-dark"
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Add to Cart
                    </Button>
                    <Button
                      onClick={() => handleRemove(item.id)}
                      size="icon"
                      variant="outline"
                      className="border-destructive text-destructive hover:bg-destructive/10"
                    >
                      <Heart className="w-4 h-4" fill="currentColor" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
