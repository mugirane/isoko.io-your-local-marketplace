-- Add currency column to stores table
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'RWF';

-- Add index for faster filtering by currency
CREATE INDEX IF NOT EXISTS idx_stores_currency ON public.stores(currency);