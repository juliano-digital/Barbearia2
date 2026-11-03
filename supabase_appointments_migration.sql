-- Migrate the legacy scheduling schema to the public booking form model.
-- Back up the database before running: the legacy support tables are removed.
BEGIN;

CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  servico TEXT NOT NULL,
  data DATE NOT NULL,
  horario TIME NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

LOCK TABLE public.appointments IN ACCESS EXCLUSIVE MODE;

ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS nome TEXT,
  ADD COLUMN IF NOT EXISTS telefone TEXT,
  ADD COLUMN IF NOT EXISTS servico TEXT,
  ADD COLUMN IF NOT EXISTS data DATE,
  ADD COLUMN IF NOT EXISTS horario TIME,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

UPDATE public.appointments
SET id = COALESCE(id, gen_random_uuid()),
    created_at = COALESCE(created_at, now());

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'appointments'
      AND column_name = 'cliente_nome'
  ) THEN
    EXECUTE $sql$
      UPDATE public.appointments
      SET nome = COALESCE(NULLIF(BTRIM(nome), ''), NULLIF(BTRIM(cliente_nome), ''))
      WHERE NULLIF(BTRIM(nome), '') IS NULL
    $sql$;
  END IF;

  IF to_regclass('public.users') IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'users'
        AND column_name IN ('id', 'nome')
      GROUP BY table_name
      HAVING COUNT(*) = 2
    )
    AND EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'appointments'
        AND column_name = 'cliente_id'
    ) THEN
    EXECUTE $sql$
      UPDATE public.appointments AS appointment
      SET nome = COALESCE(NULLIF(BTRIM(appointment.nome), ''), NULLIF(BTRIM(customer.nome), ''))
      FROM public.users AS customer
      WHERE appointment.cliente_id = customer.id
        AND NULLIF(BTRIM(appointment.nome), '') IS NULL
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'appointments'
      AND column_name = 'cliente_telefone'
  ) THEN
    EXECUTE $sql$
      UPDATE public.appointments
      SET telefone = COALESCE(NULLIF(BTRIM(telefone), ''), NULLIF(BTRIM(cliente_telefone), ''))
      WHERE NULLIF(BTRIM(telefone), '') IS NULL
    $sql$;
  END IF;

  IF to_regclass('public.users') IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'users'
        AND column_name IN ('id', 'telefone')
      GROUP BY table_name
      HAVING COUNT(*) = 2
    )
    AND EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'appointments'
        AND column_name = 'cliente_id'
    ) THEN
    EXECUTE $sql$
      UPDATE public.appointments AS appointment
      SET telefone = COALESCE(NULLIF(BTRIM(appointment.telefone), ''), NULLIF(BTRIM(customer.telefone), ''))
      FROM public.users AS customer
      WHERE appointment.cliente_id = customer.id
        AND NULLIF(BTRIM(appointment.telefone), '') IS NULL
    $sql$;
  END IF;

  IF to_regclass('public.services') IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'services'
        AND column_name IN ('id', 'nome')
      GROUP BY table_name
      HAVING COUNT(*) = 2
    )
    AND EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'appointments'
        AND column_name = 'service_id'
    ) THEN
    EXECUTE $sql$
      UPDATE public.appointments AS appointment
      SET servico = COALESCE(NULLIF(BTRIM(appointment.servico), ''), NULLIF(BTRIM(service.nome), ''))
      FROM public.services AS service
      WHERE appointment.service_id = service.id
        AND NULLIF(BTRIM(appointment.servico), '') IS NULL
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'appointments'
      AND column_name = 'descricao'
  ) THEN
    EXECUTE $sql$
      UPDATE public.appointments
      SET servico = COALESCE(NULLIF(BTRIM(servico), ''), NULLIF(BTRIM(descricao), ''))
      WHERE NULLIF(BTRIM(servico), '') IS NULL
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'appointments'
      AND column_name = 'hora'
  ) THEN
    EXECUTE 'UPDATE public.appointments SET horario = COALESCE(horario, hora)';
  END IF;
END;
$$;

DO $$
DECLARE
  incomplete_count BIGINT;
BEGIN
  SELECT COUNT(*) INTO incomplete_count
  FROM public.appointments
  WHERE NULLIF(BTRIM(nome), '') IS NULL
    OR NULLIF(BTRIM(telefone), '') IS NULL
    OR NULLIF(BTRIM(servico), '') IS NULL
    OR data IS NULL
    OR horario IS NULL;

  IF incomplete_count > 0 THEN
    RAISE EXCEPTION
      'Migração cancelada: % agendamento(s) não possuem todos os campos necessários. Corrija os dados legados e execute novamente.',
      incomplete_count;
  END IF;
END;
$$;

ALTER TABLE public.appointments
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN id SET NOT NULL,
  ALTER COLUMN nome SET NOT NULL,
  ALTER COLUMN telefone SET NOT NULL,
  ALTER COLUMN servico SET NOT NULL,
  ALTER COLUMN data SET NOT NULL,
  ALTER COLUMN horario SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN created_at SET NOT NULL;
CREATE INDEX IF NOT EXISTS appointments_date_time_idx
  ON public.appointments (data, horario);

ALTER TABLE public.appointments
  DROP CONSTRAINT IF EXISTS appointments_client_or_guest;

DROP TRIGGER IF EXISTS appointments_validate_slot ON public.appointments;
DROP FUNCTION IF EXISTS public.validar_horario_agendamento();
DROP FUNCTION IF EXISTS public.obter_horarios_disponiveis(DATE);
DROP FUNCTION IF EXISTS public.criar_agendamento(TEXT, TEXT, TEXT, DATE, TIME);

ALTER TABLE public.appointments
  DROP COLUMN IF EXISTS cliente_id,
  DROP COLUMN IF EXISTS barber_id,
  DROP COLUMN IF EXISTS service_id,
  DROP COLUMN IF EXISTS cliente_nome,
  DROP COLUMN IF EXISTS cliente_telefone,
  DROP COLUMN IF EXISTS descricao,
  DROP COLUMN IF EXISTS hora,
  DROP COLUMN IF EXISTS status;

DO $$
DECLARE
  dependency_record RECORD;
BEGIN
  FOR dependency_record IN
    SELECT source_table.relname AS source_name, target_table.relname AS target_name
    FROM pg_constraint AS foreign_key
    JOIN pg_class AS source_table ON source_table.oid = foreign_key.conrelid
    JOIN pg_class AS target_table ON target_table.oid = foreign_key.confrelid
    WHERE foreign_key.contype = 'f'
      AND target_table.relnamespace = 'public'::regnamespace
      AND target_table.relname IN (
        'barbers',
        'services',
        'blocked_times',
        'working_hours',
        'holidays'
      )
      AND NOT (
        source_table.relnamespace = 'public'::regnamespace
        AND source_table.relname IN ('appointments', 'blocked_times')
      )
  LOOP
    RAISE EXCEPTION
      'Migração cancelada: a tabela public.% ainda referencia public.%. Remova ou migre essa dependência antes de continuar.',
      dependency_record.source_name,
      dependency_record.target_name;
  END LOOP;
END;
$$;

DROP TABLE IF EXISTS public.blocked_times RESTRICT;
DROP TABLE IF EXISTS public.working_hours RESTRICT;
DROP TABLE IF EXISTS public.holidays RESTRICT;
DROP TABLE IF EXISTS public.barbers RESTRICT;
DROP TABLE IF EXISTS public.services RESTRICT;
DROP TYPE IF EXISTS public.appointment_status RESTRICT;

DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'appointments'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.appointments', policy_record.policyname);
  END LOOP;
END;
$$;

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.appointments FROM PUBLIC, anon, authenticated;
GRANT INSERT ON TABLE public.appointments TO anon, authenticated;

ALTER TABLE public.appointments
  DROP CONSTRAINT IF EXISTS appointments_nome_not_blank,
  DROP CONSTRAINT IF EXISTS appointments_telefone_not_blank,
  DROP CONSTRAINT IF EXISTS appointments_servico_not_blank;

ALTER TABLE public.appointments
  ADD CONSTRAINT appointments_nome_not_blank CHECK (BTRIM(nome) <> ''),
  ADD CONSTRAINT appointments_telefone_not_blank CHECK (BTRIM(telefone) <> ''),
  ADD CONSTRAINT appointments_servico_not_blank CHECK (BTRIM(servico) <> '');

CREATE POLICY "Public can insert appointments"
  ON public.appointments
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    BTRIM(nome) <> ''
    AND BTRIM(telefone) <> ''
    AND BTRIM(servico) <> ''
  );

COMMIT;
