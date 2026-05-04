
REVOKE EXECUTE ON FUNCTION public.handle_rsvp FROM anon;
REVOKE EXECUTE ON FUNCTION public.cancel_rsvp FROM anon;
REVOKE EXECUTE ON FUNCTION public.generate_ticket_code FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_host_member FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_host_role FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user FROM anon, authenticated;

ALTER FUNCTION public.generate_ticket_code SET search_path = public;

-- Storage bucket for uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);

-- Storage policies
CREATE POLICY "Anyone can view uploads" ON storage.objects FOR SELECT USING (bucket_id = 'uploads');
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'uploads');
CREATE POLICY "Users can update own uploads" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete own uploads" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);
