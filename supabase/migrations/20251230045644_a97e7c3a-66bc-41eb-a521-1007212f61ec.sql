-- Create storage bucket for store and profile images
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-images', 'store-images', true);

-- Storage policies for store-images bucket
CREATE POLICY "Anyone can view store images"
ON storage.objects FOR SELECT
USING (bucket_id = 'store-images');

CREATE POLICY "Authenticated users can upload store images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'store-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own store images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'store-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own store images"
ON storage.objects FOR DELETE
USING (bucket_id = 'store-images' AND auth.role() = 'authenticated');