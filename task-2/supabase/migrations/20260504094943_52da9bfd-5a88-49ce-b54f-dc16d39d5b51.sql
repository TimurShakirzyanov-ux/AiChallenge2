
-- Enums
CREATE TYPE public.host_member_role AS ENUM ('host', 'checker');
CREATE TYPE public.event_visibility AS ENUM ('public', 'unlisted');
CREATE TYPE public.event_status AS ENUM ('draft', 'published');
CREATE TYPE public.rsvp_status AS ENUM ('confirmed', 'waitlisted', 'cancelled');
CREATE TYPE public.photo_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.report_target_type AS ENUM ('event', 'photo');
CREATE TYPE public.report_status AS ENUM ('pending', 'hidden', 'dismissed');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Hosts
CREATE TABLE public.hosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  bio TEXT,
  contact_email TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hosts ENABLE ROW LEVEL SECURITY;

-- Host members
CREATE TABLE public.host_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES public.hosts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.host_member_role NOT NULL DEFAULT 'host',
  invited_at TIMESTAMPTZ DEFAULT now(),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(host_id, user_id)
);
ALTER TABLE public.host_members ENABLE ROW LEVEL SECURITY;

-- Host invites
CREATE TABLE public.host_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES public.hosts(id) ON DELETE CASCADE,
  role public.host_member_role NOT NULL DEFAULT 'host',
  token TEXT NOT NULL UNIQUE DEFAULT substring(replace(gen_random_uuid()::text, '-', ''), 1, 16),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  used_at TIMESTAMPTZ
);
ALTER TABLE public.host_invites ENABLE ROW LEVEL SECURITY;

-- Events
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES public.hosts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  venue_address TEXT,
  online_link TEXT,
  capacity INTEGER,
  cover_image_url TEXT,
  visibility public.event_visibility NOT NULL DEFAULT 'public',
  status public.event_status NOT NULL DEFAULT 'draft',
  is_paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- RSVPs
CREATE TABLE public.rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status public.rsvp_status NOT NULL DEFAULT 'confirmed',
  ticket_code TEXT UNIQUE,
  qr_data TEXT,
  waitlist_position INTEGER,
  rsvp_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  cancelled_at TIMESTAMPTZ,
  UNIQUE(event_id, user_id)
);
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

-- Check-ins
CREATE TABLE public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rsvp_id UUID NOT NULL REFERENCES public.rsvps(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  checked_in_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  undone BOOLEAN NOT NULL DEFAULT false
);
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

-- Feedback
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Gallery photos
CREATE TABLE public.gallery_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  status public.photo_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;

-- Reports
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type public.report_target_type NOT NULL,
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status public.report_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Generate ticket code function
CREATE OR REPLACE FUNCTION public.generate_ticket_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- RSVP function with waitlist logic
CREATE OR REPLACE FUNCTION public.handle_rsvp(p_event_id UUID, p_user_id UUID)
RETURNS public.rsvps
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_capacity INTEGER;
  v_confirmed_count INTEGER;
  v_rsvp public.rsvps;
  v_ticket TEXT;
  v_max_pos INTEGER;
BEGIN
  -- Check existing
  SELECT * INTO v_rsvp FROM rsvps WHERE event_id = p_event_id AND user_id = p_user_id;
  IF v_rsvp.id IS NOT NULL AND v_rsvp.status != 'cancelled' THEN
    RETURN v_rsvp;
  END IF;

  SELECT capacity INTO v_capacity FROM events WHERE id = p_event_id;
  SELECT COUNT(*) INTO v_confirmed_count FROM rsvps WHERE event_id = p_event_id AND status = 'confirmed';

  IF v_capacity IS NULL OR v_confirmed_count < v_capacity THEN
    v_ticket := generate_ticket_code();
    -- ensure unique
    WHILE EXISTS (SELECT 1 FROM rsvps WHERE ticket_code = v_ticket) LOOP
      v_ticket := generate_ticket_code();
    END LOOP;

    IF v_rsvp.id IS NOT NULL THEN
      UPDATE rsvps SET status = 'confirmed', ticket_code = v_ticket, qr_data = v_ticket, waitlist_position = NULL, cancelled_at = NULL, rsvp_at = now()
      WHERE id = v_rsvp.id RETURNING * INTO v_rsvp;
    ELSE
      INSERT INTO rsvps (event_id, user_id, status, ticket_code, qr_data)
      VALUES (p_event_id, p_user_id, 'confirmed', v_ticket, v_ticket)
      RETURNING * INTO v_rsvp;
    END IF;
  ELSE
    SELECT COALESCE(MAX(waitlist_position), 0) + 1 INTO v_max_pos FROM rsvps WHERE event_id = p_event_id AND status = 'waitlisted';

    IF v_rsvp.id IS NOT NULL THEN
      UPDATE rsvps SET status = 'waitlisted', ticket_code = NULL, qr_data = NULL, waitlist_position = v_max_pos, cancelled_at = NULL, rsvp_at = now()
      WHERE id = v_rsvp.id RETURNING * INTO v_rsvp;
    ELSE
      INSERT INTO rsvps (event_id, user_id, status, waitlist_position)
      VALUES (p_event_id, p_user_id, 'waitlisted', v_max_pos)
      RETURNING * INTO v_rsvp;
    END IF;
  END IF;

  RETURN v_rsvp;
END;
$$;

-- Cancel RSVP and promote waitlist
CREATE OR REPLACE FUNCTION public.cancel_rsvp(p_rsvp_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_id UUID;
  v_next_rsvp public.rsvps;
  v_ticket TEXT;
BEGIN
  UPDATE rsvps SET status = 'cancelled', cancelled_at = now(), ticket_code = NULL, qr_data = NULL
  WHERE id = p_rsvp_id AND status IN ('confirmed', 'waitlisted')
  RETURNING event_id INTO v_event_id;

  IF v_event_id IS NULL THEN RETURN; END IF;

  -- Promote next waitlisted
  SELECT * INTO v_next_rsvp FROM rsvps
  WHERE event_id = v_event_id AND status = 'waitlisted'
  ORDER BY waitlist_position ASC LIMIT 1;

  IF v_next_rsvp.id IS NOT NULL THEN
    v_ticket := generate_ticket_code();
    WHILE EXISTS (SELECT 1 FROM rsvps WHERE ticket_code = v_ticket) LOOP
      v_ticket := generate_ticket_code();
    END LOOP;

    UPDATE rsvps SET status = 'confirmed', ticket_code = v_ticket, qr_data = v_ticket, waitlist_position = NULL
    WHERE id = v_next_rsvp.id;
  END IF;
END;
$$;

-- Helper: check if user is host member
CREATE OR REPLACE FUNCTION public.is_host_member(p_host_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM host_members WHERE host_id = p_host_id AND user_id = p_user_id);
$$;

CREATE OR REPLACE FUNCTION public.is_host_role(p_host_id UUID, p_user_id UUID, p_role public.host_member_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM host_members WHERE host_id = p_host_id AND user_id = p_user_id AND role = p_role);
$$;

-- RLS Policies

-- Profiles
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Hosts
CREATE POLICY "Anyone can view hosts" ON public.hosts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create hosts" ON public.hosts FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Host members can update host" ON public.hosts FOR UPDATE TO authenticated USING (public.is_host_member(id, auth.uid()));

-- Host members
CREATE POLICY "Anyone can view host members" ON public.host_members FOR SELECT USING (true);
CREATE POLICY "Host admins can insert members" ON public.host_members FOR INSERT TO authenticated WITH CHECK (public.is_host_role(host_id, auth.uid(), 'host') OR NOT EXISTS (SELECT 1 FROM host_members WHERE host_id = host_members.host_id));
CREATE POLICY "Host admins can delete members" ON public.host_members FOR DELETE TO authenticated USING (public.is_host_role(host_id, auth.uid(), 'host'));

-- Host invites
CREATE POLICY "Host members can view invites" ON public.host_invites FOR SELECT TO authenticated USING (public.is_host_member(host_id, auth.uid()));
CREATE POLICY "Host admins can create invites" ON public.host_invites FOR INSERT TO authenticated WITH CHECK (public.is_host_role(host_id, auth.uid(), 'host'));
CREATE POLICY "Anyone authed can read invite by token" ON public.host_invites FOR SELECT TO authenticated USING (true);

-- Events
CREATE POLICY "Anyone can view published events" ON public.events FOR SELECT USING (status = 'published' OR (auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM host_members WHERE host_id = events.host_id AND user_id = auth.uid())));
CREATE POLICY "Host members can insert events" ON public.events FOR INSERT TO authenticated WITH CHECK (public.is_host_member(host_id, auth.uid()));
CREATE POLICY "Host members can update events" ON public.events FOR UPDATE TO authenticated USING (public.is_host_member(host_id, auth.uid()));
CREATE POLICY "Host members can delete events" ON public.events FOR DELETE TO authenticated USING (public.is_host_role(host_id, auth.uid(), 'host'));

-- RSVPs
CREATE POLICY "Users can view own rsvps" ON public.rsvps FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Host members can view event rsvps" ON public.rsvps FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM host_members hm JOIN events e ON e.host_id = hm.host_id WHERE e.id = rsvps.event_id AND hm.user_id = auth.uid()));
CREATE POLICY "Anyone can view rsvp counts" ON public.rsvps FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert rsvps" ON public.rsvps FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own rsvps" ON public.rsvps FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Check-ins
CREATE POLICY "Host members can view check-ins" ON public.check_ins FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM host_members hm JOIN events e ON e.host_id = hm.host_id WHERE e.id = check_ins.event_id AND hm.user_id = auth.uid()));
CREATE POLICY "Host members can insert check-ins" ON public.check_ins FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM host_members hm JOIN events e ON e.host_id = hm.host_id WHERE e.id = check_ins.event_id AND hm.user_id = auth.uid()));
CREATE POLICY "Host members can update check-ins" ON public.check_ins FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM host_members hm JOIN events e ON e.host_id = hm.host_id WHERE e.id = check_ins.event_id AND hm.user_id = auth.uid()));

-- Feedback
CREATE POLICY "Anyone can view feedback" ON public.feedback FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert feedback" ON public.feedback FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Gallery photos
CREATE POLICY "Anyone can view approved photos" ON public.gallery_photos FOR SELECT USING (status = 'approved' OR (auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM host_members hm JOIN events e ON e.host_id = hm.host_id WHERE e.id = gallery_photos.event_id AND hm.user_id = auth.uid())));
CREATE POLICY "Authenticated can upload photos" ON public.gallery_photos FOR INSERT TO authenticated WITH CHECK (uploaded_by = auth.uid());
CREATE POLICY "Host members can update photos" ON public.gallery_photos FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM host_members hm JOIN events e ON e.host_id = hm.host_id WHERE e.id = gallery_photos.event_id AND hm.user_id = auth.uid()));

-- Reports
CREATE POLICY "Reporters can insert reports" ON public.reports FOR INSERT TO authenticated WITH CHECK (reporter_id = auth.uid());
CREATE POLICY "Host members can view reports" ON public.reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Host members can update reports" ON public.reports FOR UPDATE TO authenticated USING (true);
