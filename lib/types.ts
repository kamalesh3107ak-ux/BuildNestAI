// Type definitions for the BuildNest app matching Supabase schema

export type UserRole = 'customer' | 'vendor' | 'broker' | 'engineer' | 'admin'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  role: UserRole
  phone: string
  address: string
  city: string
  state: string
  zip_code: string
  avatar_url: string
  bio: string
  business_name: string
  business_address: string
  agency_name: string
  license_number: string
  specialization: string
  experience_years: number
  certifications: string[]
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  type: string
  icon: string
  created_at: string
}

export interface Product {
  id: string
  vendor_id: string
  name: string
  description: string
  category_id: string
  price: number
  stock_quantity: number
  unit: string
  images: string[]
  location: string
  contact_phone: string
  contact_email: string
  specifications: Record<string, unknown>
  status: 'active' | 'inactive'
  views: number
  created_at: string
  updated_at: string
}

export interface RentalHouse {
  id: string
  broker_id: string
  title: string
  description: string
  location: string
  address: string
  city: string
  state: string
  rent: number
  deposit: number
  bedrooms: number
  bathrooms: number
  area_sqft: number
  amenities: string[]
  images: string[]
  property_type: string
  contact_name: string
  contact_phone: string
  contact_email: string
  availability_date: string
  status: 'active' | 'inactive' | 'rented'
  views: number
  furnished: boolean
  parking: boolean
  pets_allowed: boolean
  created_at: string
  updated_at: string
}

export interface EngineerPost {
  id: string
  engineer_id: string
  title: string
  description: string
  work_type: string
  experience_required: string
  location: string
  images: string[]
  contact_name: string
  contact_phone: string
  contact_email: string
  project_duration: string
  budget_range: string
  skills: string[]
  status: 'active' | 'inactive' | 'archived'
  views: number
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  customer_id: string
  vendor_id: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
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
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  created_at: string
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  created_at: string
  product?: Product
}

export interface WishlistItem {
  id: string
  user_id: string
  product_id: string | null
  rental_id: string | null
  engineer_post_id: string | null
  created_at: string
}

export interface Review {
  id: string
  user_id: string
  product_id: string | null
  rental_id: string | null
  engineer_post_id: string | null
  rating: number
  comment: string
  created_at: string
}

export interface Inquiry {
  id: string
  sender_id: string
  receiver_id: string
  subject: string
  message: string
  related_product_id: string | null
  related_rental_id: string | null
  related_engineer_post_id: string | null
  is_read: boolean
  created_at: string
}

export interface AIChat {
  id: string
  user_id: string
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
  created_at: string
  updated_at: string
}
