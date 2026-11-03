-- SQL para criação das tabelas no Supabase

-- Tabela de Usuários (users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  avatar TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT;
UPDATE public.users SET role = 'user' WHERE role IS NULL;
ALTER TABLE public.users
  ALTER COLUMN role SET DEFAULT 'user',
  ALTER COLUMN role SET NOT NULL;

-- Tabela de Agendamentos (appointments)
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL CONSTRAINT appointments_nome_not_blank CHECK (BTRIM(nome) <> ''),
  telefone TEXT NOT NULL CONSTRAINT appointments_telefone_not_blank CHECK (BTRIM(telefone) <> ''),
  servico TEXT NOT NULL CONSTRAINT appointments_servico_not_blank CHECK (BTRIM(servico) <> ''),
  data DATE NOT NULL,
  horario TIME NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS appointments_date_time_idx
  ON public.appointments (data, horario);

-- Tabela de conteúdo editável do site (usada pelo painel /admin)
create table if not exists site_content (
  id uuid primary key default gen_random_uuid(),
  page text unique not null,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table site_content enable row level security;

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

-- Qualquer visitante pode LER o conteúdo (site público)
DROP POLICY IF EXISTS "Public can read site content" ON site_content;
DROP POLICY IF EXISTS "Authenticated users can insert site content" ON site_content;
DROP POLICY IF EXISTS "Authenticated users can update site content" ON site_content;
DROP POLICY IF EXISTS "Admins can insert site content" ON site_content;
DROP POLICY IF EXISTS "Admins can update site content" ON site_content;
create policy "Public can read site content"
  on site_content for select
  using (true);

CREATE POLICY "Admins can insert site content"
  on site_content for insert
  to authenticated
  with check (public.is_admin());

CREATE POLICY "Admins can update site content"
  on site_content for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
REVOKE ALL ON TABLE public.site_content FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.site_content TO anon, authenticated;
GRANT INSERT, UPDATE ON TABLE public.site_content TO authenticated;

-- Habilitação de RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile or admins can read profiles" ON public.users;
DROP POLICY IF EXISTS "Users can create own profile" ON public.users;
CREATE POLICY "Users can read own profile or admins can read profiles"
  ON public.users FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "Users can create own profile"
  ON public.users FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid() AND role = 'user');
REVOKE ALL ON TABLE public.users FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON TABLE public.users TO authenticated;

-- Visitantes podem somente inserir agendamentos; não podem consultar ou alterá-los.
DROP POLICY IF EXISTS "Public can insert appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admins can read appointments" ON public.appointments;
CREATE POLICY "Public can insert appointments"
  ON public.appointments
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    BTRIM(nome) <> ''
    AND BTRIM(telefone) <> ''
    AND BTRIM(servico) <> ''
  );
CREATE POLICY "Admins can read appointments"
  ON public.appointments
  FOR SELECT
  TO authenticated
  USING (public.is_admin());
CREATE POLICY "Admins can delete appointments"
  ON public.appointments
  FOR DELETE
  TO authenticated
  USING (public.is_admin());
REVOKE ALL ON TABLE public.appointments FROM PUBLIC, anon, authenticated;
GRANT INSERT ON TABLE public.appointments TO anon, authenticated;
GRANT SELECT, DELETE ON TABLE public.appointments TO authenticated;

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL CHECK (BTRIM(nome) <> ''),
  email TEXT NOT NULL CHECK (BTRIM(email) <> ''),
  mensagem TEXT NOT NULL CHECK (BTRIM(mensagem) <> ''),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS contact_messages_created_at_idx
  ON public.contact_messages (created_at DESC);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.contact_messages FROM PUBLIC, anon, authenticated;
GRANT INSERT ON TABLE public.contact_messages TO anon, authenticated;
GRANT SELECT, DELETE ON TABLE public.contact_messages TO authenticated;

DROP POLICY IF EXISTS "Public can submit contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can read contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can delete contact messages" ON public.contact_messages;
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

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
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
