-- Create storage bucket for route images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('route-images', 'route-images', true);

-- Create RLS policies for route images bucket
CREATE POLICY "Admin users can upload route images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'route-images' AND 
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND 'write' = ANY(permissions)
  )
);

CREATE POLICY "Admin users can update route images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'route-images' AND 
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND 'write' = ANY(permissions)
  )
);

CREATE POLICY "Admin users can delete route images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'route-images' AND 
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND 'write' = ANY(permissions)
  )
);

CREATE POLICY "Route images are publicly viewable" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'route-images');