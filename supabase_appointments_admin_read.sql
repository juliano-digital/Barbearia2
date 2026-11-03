-- Apply to existing Supabase projects to allow admins to manage appointments.
GRANT SELECT, DELETE ON TABLE public.appointments TO authenticated;

DROP POLICY IF EXISTS "Admins can read appointments" ON public.appointments;
CREATE POLICY "Admins can read appointments"
  ON public.appointments FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete appointments" ON public.appointments;
CREATE POLICY "Admins can delete appointments"
  ON public.appointments FOR DELETE TO authenticated
  USING (public.is_admin());
