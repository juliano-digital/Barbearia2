-- Apply after supabase_appointments_migration.sql on an existing project.
-- Adds administrator-only access to CMS writes and private form submissions.
BEGIN;

CREATE TABLE IF NOT EXISTS public.site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page TEXT UNIQUE NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT;
UPDATE public.users SET role = 'user' WHERE role IS NULL;
ALTER TABLE public.users
  ALTER COLUMN role SET DEFAULT 'user',
  ALTER COLUMN role SET NOT NULL;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users AS profile
    WHERE profile.id = auth.uid()
      AND profile.role::TEXT = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL CHECK (BTRIM(nome) <> ''),
  email TEXT NOT NULL CHECK (BTRIM(email) <> ''),
  mensagem TEXT NOT NULL CHECK (BTRIM(mensagem) <> ''),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS contact_messages_created_at_idx
  ON public.contact_messages (created_at DESC);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  target_table TEXT;
  policy_name TEXT;
BEGIN
  FOREACH target_table IN ARRAY ARRAY['users', 'site_content', 'appointments', 'contact_messages']
  LOOP
    FOR policy_name IN
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public' AND tablename = target_table
    LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', policy_name, target_table);
    END LOOP;
  END LOOP;
END;
$$;

REVOKE ALL ON TABLE public.users FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON TABLE public.users TO authenticated;
CREATE POLICY "Users can read own profile or admins can read profiles"
  ON public.users FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "Users can create own profile"
  ON public.users FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid() AND role::TEXT = 'user');

REVOKE ALL ON TABLE public.site_content FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.site_content TO anon, authenticated;
GRANT INSERT, UPDATE ON TABLE public.site_content TO authenticated;
CREATE POLICY "Public can read site content"
  ON public.site_content FOR SELECT TO public
  USING (true);
CREATE POLICY "Admins can insert site content"
  ON public.site_content FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update site content"
  ON public.site_content FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

REVOKE ALL ON TABLE public.appointments FROM PUBLIC, anon, authenticated;
GRANT INSERT ON TABLE public.appointments TO anon, authenticated;
GRANT SELECT, DELETE ON TABLE public.appointments TO authenticated;
CREATE POLICY "Public can insert appointments"
  ON public.appointments FOR INSERT TO anon, authenticated
  WITH CHECK (
    BTRIM(nome) <> ''
    AND BTRIM(telefone) <> ''
    AND BTRIM(servico) <> ''
  );
CREATE POLICY "Admins can read appointments"
  ON public.appointments FOR SELECT TO authenticated
  USING (public.is_admin());
CREATE POLICY "Admins can delete appointments"
  ON public.appointments FOR DELETE TO authenticated
  USING (public.is_admin());

REVOKE ALL ON TABLE public.contact_messages FROM PUBLIC, anon, authenticated;
GRANT INSERT ON TABLE public.contact_messages TO anon, authenticated;
GRANT SELECT, DELETE ON TABLE public.contact_messages TO authenticated;
CREATE POLICY "Public can submit contact messages"
  ON public.contact_messages FOR INSERT TO anon, authenticated
  WITH CHECK (
    BTRIM(nome) <> ''
    AND BTRIM(email) <> ''
    AND BTRIM(mensagem) <> ''
  );
CREATE POLICY "Admins can read contact messages"
  ON public.contact_messages FOR SELECT TO authenticated
  USING (public.is_admin());
CREATE POLICY "Admins can delete contact messages"
  ON public.contact_messages FOR DELETE TO authenticated
  USING (public.is_admin());

INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public can view site images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload site images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update site images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete site images" ON storage.objects;
CREATE POLICY "Public can view site images"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'site-images');
CREATE POLICY "Admins can upload site images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'site-images' AND public.is_admin());
CREATE POLICY "Admins can update site images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'site-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'site-images' AND public.is_admin());
CREATE POLICY "Admins can delete site images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'site-images' AND public.is_admin());

COMMIT;
