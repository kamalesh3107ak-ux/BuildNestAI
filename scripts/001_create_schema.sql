-- BuildNest Database Schema
-- Complete schema for multi-role marketplace

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUM types for roles and statuses
CREATE TYPE user_role AS ENUM ('customer', 'vendor', 'broker', 'engineer', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE listing_status AS ENUM ('active', 'inactive', 'rented', 'sold');
CREATE TYPE post_status AS ENUM ('active', 'inactive', 'archived');

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'customer',
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  avatar_url TEXT,
  bio TEXT,
  -- Vendor specific fields
  business_name TEXT,
  business_address TEXT,
  -- Broker specific fields
  agency_name TEXT,
  license_number TEXT,
  -- Engineer specific fields
  specialization TEXT,
  experience_years INTEGER,
  certifications TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('product', 'rental', 'service')),
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table (Vendor materials)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.categories(id),
  price DECIMAL(12,2) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  unit TEXT DEFAULT 'piece',
  images TEXT[],
  location TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  specifications JSONB,
  status listing_status DEFAULT 'active',
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rental Houses table (Broker listings)
CREATE TABLE IF NOT EXISTS public.rental_houses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  broker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  rent DECIMAL(12,2) NOT NULL,
  deposit DECIMAL(12,2),
  bedrooms INTEGER,
  bathrooms INTEGER,
  area_sqft INTEGER,
  amenities TEXT[],
  images TEXT[],
  contact_name TEXT,
  contact_phone TEXT NOT NULL,
  contact_email TEXT,
  availability_date DATE,
  status listing_status DEFAULT 'active',
  views INTEGER DEFAULT 0,
  property_type TEXT,
  furnished BOOLEAN DEFAULT false,
  parking BOOLEAN DEFAULT false,
  pets_allowed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Engineer Posts table (Work showcase)
CREATE TABLE IF NOT EXISTS public.engineer_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  engineer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  work_type TEXT NOT NULL,
  experience_required TEXT,
  location TEXT,
  images TEXT[],
  contact_name TEXT,
  contact_phone TEXT NOT NULL,
  contact_email TEXT,
  project_duration TEXT,
  budget_range TEXT,
  skills TEXT[],
  status post_status DEFAULT 'active',
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart table
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Wishlist table
CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  rental_id UUID REFERENCES public.rental_houses(id) ON DELETE CASCADE,
  engineer_post_id UUID REFERENCES public.engineer_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT wishlist_item_type CHECK (
    (product_id IS NOT NULL)::integer +
    (rental_id IS NOT NULL)::integer +
    (engineer_post_id IS NOT NULL)::integer = 1
  )
);

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status order_status DEFAULT 'pending',
  total_amount DECIMAL(12,2) NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_zip TEXT,
  shipping_phone TEXT NOT NULL,
  payment_method TEXT DEFAULT 'cod',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  rental_id UUID REFERENCES public.rental_houses(id) ON DELETE CASCADE,
  engineer_post_id UUID REFERENCES public.engineer_posts(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT review_item_type CHECK (
    (product_id IS NOT NULL)::integer +
    (rental_id IS NOT NULL)::integer +
    (engineer_post_id IS NOT NULL)::integer = 1
  )
);

-- Inquiries / Messages table
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT,
  message TEXT NOT NULL,
  related_product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  related_rental_id UUID REFERENCES public.rental_houses(id) ON DELETE SET NULL,
  related_engineer_post_id UUID REFERENCES public.engineer_posts(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Chat History table
CREATE TABLE IF NOT EXISTS public.ai_chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_products_vendor ON public.products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_rental_houses_broker ON public.rental_houses(broker_id);
CREATE INDEX IF NOT EXISTS idx_rental_houses_status ON public.rental_houses(status);
CREATE INDEX IF NOT EXISTS idx_engineer_posts_engineer ON public.engineer_posts(engineer_id);
CREATE INDEX IF NOT EXISTS idx_engineer_posts_status ON public.engineer_posts(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_vendor ON public.orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_user ON public.wishlist_items(user_id);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engineer_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- RLS Policies for categories (public read)
CREATE POLICY "categories_select_all" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories_admin_all" ON public.categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for products
CREATE POLICY "products_select_active" ON public.products FOR SELECT USING (status = 'active' OR vendor_id = auth.uid());
CREATE POLICY "products_insert_vendor" ON public.products FOR INSERT WITH CHECK (
  auth.uid() = vendor_id AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'vendor')
);
CREATE POLICY "products_update_vendor" ON public.products FOR UPDATE USING (auth.uid() = vendor_id);
CREATE POLICY "products_delete_vendor" ON public.products FOR DELETE USING (auth.uid() = vendor_id);

-- RLS Policies for rental_houses
CREATE POLICY "rental_houses_select_active" ON public.rental_houses FOR SELECT USING (status = 'active' OR broker_id = auth.uid());
CREATE POLICY "rental_houses_insert_broker" ON public.rental_houses FOR INSERT WITH CHECK (
  auth.uid() = broker_id AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'broker')
);
CREATE POLICY "rental_houses_update_broker" ON public.rental_houses FOR UPDATE USING (auth.uid() = broker_id);
CREATE POLICY "rental_houses_delete_broker" ON public.rental_houses FOR DELETE USING (auth.uid() = broker_id);

-- RLS Policies for engineer_posts
CREATE POLICY "engineer_posts_select_active" ON public.engineer_posts FOR SELECT USING (status = 'active' OR engineer_id = auth.uid());
CREATE POLICY "engineer_posts_insert_engineer" ON public.engineer_posts FOR INSERT WITH CHECK (
  auth.uid() = engineer_id AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'engineer')
);
CREATE POLICY "engineer_posts_update_engineer" ON public.engineer_posts FOR UPDATE USING (auth.uid() = engineer_id);
CREATE POLICY "engineer_posts_delete_engineer" ON public.engineer_posts FOR DELETE USING (auth.uid() = engineer_id);

-- RLS Policies for cart_items
CREATE POLICY "cart_items_select_own" ON public.cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cart_items_insert_own" ON public.cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cart_items_update_own" ON public.cart_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "cart_items_delete_own" ON public.cart_items FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for wishlist_items
CREATE POLICY "wishlist_items_select_own" ON public.wishlist_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "wishlist_items_insert_own" ON public.wishlist_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wishlist_items_delete_own" ON public.wishlist_items FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for orders
CREATE POLICY "orders_select_own" ON public.orders FOR SELECT USING (
  auth.uid() = customer_id OR auth.uid() = vendor_id
);
CREATE POLICY "orders_insert_customer" ON public.orders FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "orders_update_involved" ON public.orders FOR UPDATE USING (
  auth.uid() = customer_id OR auth.uid() = vendor_id
);

-- RLS Policies for order_items
CREATE POLICY "order_items_select_own" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND (customer_id = auth.uid() OR vendor_id = auth.uid()))
);
CREATE POLICY "order_items_insert_customer" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND customer_id = auth.uid())
);

-- RLS Policies for reviews
CREATE POLICY "reviews_select_all" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_own" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_update_own" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "reviews_delete_own" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for inquiries
CREATE POLICY "inquiries_select_own" ON public.inquiries FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);
CREATE POLICY "inquiries_insert_own" ON public.inquiries FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "inquiries_update_receiver" ON public.inquiries FOR UPDATE USING (auth.uid() = receiver_id);

-- RLS Policies for ai_chats
CREATE POLICY "ai_chats_select_own" ON public.ai_chats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ai_chats_insert_own" ON public.ai_chats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ai_chats_update_own" ON public.ai_chats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "ai_chats_delete_own" ON public.ai_chats FOR DELETE USING (auth.uid() = user_id);

-- Function to handle profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'customer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to auto-create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rental_houses_updated_at BEFORE UPDATE ON public.rental_houses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_engineer_posts_updated_at BEFORE UPDATE ON public.engineer_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ai_chats_updated_at BEFORE UPDATE ON public.ai_chats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
