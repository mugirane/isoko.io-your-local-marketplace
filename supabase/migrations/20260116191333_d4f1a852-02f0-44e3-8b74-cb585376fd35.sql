-- Add subdomain column to stores table with unique constraint
ALTER TABLE public.stores ADD COLUMN subdomain text;

-- Create unique index for subdomain
CREATE UNIQUE INDEX stores_subdomain_unique ON public.stores(subdomain) WHERE subdomain IS NOT NULL;

-- Add check constraint for subdomain format (lowercase, alphanumeric with hyphens)
ALTER TABLE public.stores ADD CONSTRAINT stores_subdomain_format CHECK (subdomain ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$' OR subdomain ~ '^[a-z0-9]$');