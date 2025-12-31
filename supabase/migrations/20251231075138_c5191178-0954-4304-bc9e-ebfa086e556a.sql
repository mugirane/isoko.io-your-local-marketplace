-- Add is_hidden column to products for hiding products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false;

-- Add is_visible column to stores for hiding entire store (different from is_active which is admin freeze)
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true;

-- Create store_categories table for seller-created categories within their store
CREATE TABLE public.store_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(store_id, name)
);

-- Enable RLS on store_categories
ALTER TABLE public.store_categories ENABLE ROW LEVEL SECURITY;

-- Policies for store_categories
CREATE POLICY "Anyone can view store categories"
ON public.store_categories
FOR SELECT
USING (true);

CREATE POLICY "Store owners can manage their categories"
ON public.store_categories
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM stores WHERE stores.id = store_id AND stores.owner_id = auth.uid()
));

CREATE POLICY "Store owners can update their categories"
ON public.store_categories
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM stores WHERE stores.id = store_id AND stores.owner_id = auth.uid()
));

CREATE POLICY "Store owners can delete their categories"
ON public.store_categories
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM stores WHERE stores.id = store_id AND stores.owner_id = auth.uid()
));

-- Add store_category_id to products (for seller's custom category)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS store_category_id UUID REFERENCES public.store_categories(id) ON DELETE SET NULL;

-- Create admin_notes table for admin to add notes on stores
CREATE TABLE public.admin_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create store_payments table for tracking monthly payments
CREATE TABLE public.store_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 8000,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin_chats table for messaging between admin and sellers
CREATE TABLE public.admin_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('admin', 'seller')),
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique constraint on store names
ALTER TABLE public.stores ADD CONSTRAINT stores_name_unique UNIQUE (name);

-- Enable RLS on new tables (admin-only access via edge function)
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_chats ENABLE ROW LEVEL SECURITY;

-- Policies for admin_notes (only accessible via service role/edge function)
CREATE POLICY "No direct access to admin notes"
ON public.admin_notes
FOR ALL
USING (false);

-- Policies for store_payments
CREATE POLICY "Store owners can view their payments"
ON public.store_payments
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM stores WHERE stores.id = store_id AND stores.owner_id = auth.uid()
));

-- No insert/update for users, only via edge function

-- Policies for admin_chats
CREATE POLICY "Store owners can view their chat messages"
ON public.admin_chats
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM stores WHERE stores.id = store_id AND stores.owner_id = auth.uid()
));

CREATE POLICY "Store owners can send messages"
ON public.admin_chats
FOR INSERT
WITH CHECK (
  sender_type = 'seller' AND 
  EXISTS (SELECT 1 FROM stores WHERE stores.id = store_id AND stores.owner_id = auth.uid())
);

-- Update products RLS to respect is_hidden
DROP POLICY IF EXISTS "Anyone can view products of active stores" ON public.products;

CREATE POLICY "Anyone can view visible products of active stores"
ON public.products
FOR SELECT
USING (
  is_hidden = false AND
  EXISTS (
    SELECT 1 FROM stores
    WHERE stores.id = products.store_id 
    AND stores.is_active = true 
    AND stores.is_visible = true
  )
);

-- Allow store owners to see their own hidden products
CREATE POLICY "Store owners can view all their products"
ON public.products
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM stores WHERE stores.id = products.store_id AND stores.owner_id = auth.uid()
));

-- Update stores RLS to respect is_visible
DROP POLICY IF EXISTS "Anyone can view active stores" ON public.stores;

CREATE POLICY "Anyone can view active visible stores"
ON public.stores
FOR SELECT
USING (is_active = true AND is_visible = true);

-- Allow store owners to see their own hidden store
CREATE POLICY "Store owners can view their own store"
ON public.stores
FOR SELECT
USING (owner_id = auth.uid());

-- Enable realtime for admin_chats
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_chats;