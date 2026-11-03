-- Apply to existing Supabase projects to enable public availability and safe booking.
BEGIN;

DROP POLICY IF EXISTS "Public can insert appointments" ON public.appointments;
REVOKE INSERT ON TABLE public.appointments FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_reserved_appointment_times(p_date DATE)
RETURNS TABLE (horario TIME)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT appointment.horario
  FROM public.appointments AS appointment
  WHERE appointment.data = p_date;
$$;

REVOKE ALL ON FUNCTION public.get_reserved_appointment_times(DATE) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_reserved_appointment_times(DATE) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.create_public_appointment(
  p_nome TEXT,
  p_telefone TEXT,
  p_servico TEXT,
  p_data DATE,
  p_horario TIME
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_appointment_id UUID;
BEGIN
  IF BTRIM(p_nome) = '' OR BTRIM(p_telefone) = '' OR BTRIM(p_servico) = '' THEN
    RAISE EXCEPTION 'Preencha nome, telefone e serviço.';
  END IF;

  IF p_telefone !~ '^\([0-9]{2}\) [0-9]{5}-[0-9]{4}$' THEN
    RAISE EXCEPTION 'Informe um telefone no formato (00) 00000-0000.';
  END IF;

  IF p_data < CURRENT_DATE OR EXTRACT(ISODOW FROM p_data) IN (6, 7) THEN
    RAISE EXCEPTION 'A data selecionada não possui atendimento.';
  END IF;

  IF p_horario < TIME '09:00'
    OR p_horario >= TIME '18:00'
    OR EXTRACT(MINUTE FROM p_horario)::INTEGER % 30 <> 0
    OR EXTRACT(SECOND FROM p_horario) <> 0
  THEN
    RAISE EXCEPTION 'O horário deve estar entre 09:00 e 17:30, em intervalos de 30 minutos.';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_data::TEXT || ' ' || p_horario::TEXT, 0)
  );

  IF EXISTS (
    SELECT 1
    FROM public.appointments AS appointment
    WHERE appointment.data = p_data
      AND appointment.horario = p_horario
  ) THEN
    RAISE EXCEPTION 'Este horário acabou de ser reservado. Escolha outro horário.';
  END IF;

  INSERT INTO public.appointments (nome, telefone, servico, data, horario)
  VALUES (BTRIM(p_nome), BTRIM(p_telefone), BTRIM(p_servico), p_data, p_horario)
  RETURNING id INTO new_appointment_id;

  RETURN new_appointment_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_public_appointment(TEXT, TEXT, TEXT, DATE, TIME) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_public_appointment(TEXT, TEXT, TEXT, DATE, TIME) TO anon, authenticated;

COMMIT;
