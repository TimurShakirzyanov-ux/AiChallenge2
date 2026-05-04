
-- Seed host (no created_by since no real user exists)
INSERT INTO public.hosts (id, name, logo_url, bio, contact_email, created_by)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Community Events Co.',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&h=200&fit=crop',
  'We organize free community meetups and workshops.',
  'hello@communityevents.example',
  NULL
);

-- Upcoming event (7 days from now)
INSERT INTO public.events (id, host_id, title, description, start_time, end_time, timezone, venue_address, capacity, cover_image_url, visibility, status)
VALUES (
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'React Builders Meetup',
  'Join us for an evening of React talks, live coding, and networking. Whether you''re a beginner or expert, there''s something for everyone. Bring your laptop and your curiosity!',
  now() + interval '7 days',
  now() + interval '7 days' + interval '2 hours',
  'UTC',
  'TechHub, 123 Main St, San Francisco',
  50,
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop',
  'public',
  'published'
);

-- Past event (14 days ago)
INSERT INTO public.events (id, host_id, title, description, start_time, end_time, timezone, venue_address, capacity, cover_image_url, visibility, status)
VALUES (
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Intro to Open Source',
  'A beginner-friendly workshop on contributing to open source projects. Learn about Git, pull requests, and finding your first issue to work on.',
  now() - interval '14 days',
  now() - interval '14 days' + interval '2 hours',
  'UTC',
  'TechHub, 123 Main St, San Francisco',
  30,
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=400&fit=crop',
  'public',
  'published'
);
