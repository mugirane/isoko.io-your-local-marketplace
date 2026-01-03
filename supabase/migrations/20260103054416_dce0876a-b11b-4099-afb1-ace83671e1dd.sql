-- Create affiliates table
CREATE TABLE public.affiliates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  promo_code TEXT NOT NULL UNIQUE,
  commission_rate NUMERIC NOT NULL DEFAULT 0.30,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create affiliate earnings table to track commissions
CREATE TABLE public.affiliate_earnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  payment_id UUID NOT NULL REFERENCES public.store_payments(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add promo_code column to stores table to track which affiliate referred them
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS referred_by_affiliate_id UUID REFERENCES public.affiliates(id);

-- Enable RLS
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_earnings ENABLE ROW LEVEL SECURITY;

-- RLS policies for affiliates
CREATE POLICY "Anyone can view active affiliates for validation"
ON public.affiliates
FOR SELECT
USING (is_active = true);

CREATE POLICY "Affiliates can view their own data"
ON public.affiliates
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can register as affiliates"
ON public.affiliates
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Affiliates can update their own data"
ON public.affiliates
FOR UPDATE
USING (auth.uid() = user_id);

-- RLS policies for affiliate earnings
CREATE POLICY "Affiliates can view their earnings"
ON public.affiliate_earnings
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.affiliates
  WHERE affiliates.id = affiliate_earnings.affiliate_id
  AND affiliates.user_id = auth.uid()
));

-- Create function to generate unique promo code
CREATE OR REPLACE FUNCTION public.generate_promo_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    code := 'ISOKO' || upper(substr(md5(random()::text), 1, 6));
    SELECT EXISTS(SELECT 1 FROM affiliates WHERE promo_code = code) INTO exists_check;
    EXIT WHEN NOT exists_check;
  END LOOP;
  RETURN code;
END;
$$;

-- Create trigger to update updated_at
CREATE TRIGGER update_affiliates_updated_at
BEFORE UPDATE ON public.affiliates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();