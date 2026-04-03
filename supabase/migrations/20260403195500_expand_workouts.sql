ALTER TABLE public.workouts
ADD COLUMN IF NOT EXISTS scheduled_date DATE,
ADD COLUMN IF NOT EXISTS workout_type TEXT NOT NULL DEFAULT 'Strength' CHECK (workout_type IN ('Strength', 'Cardio', 'Mobility', 'Recovery', 'Push', 'Pull', 'Legs')),
ADD COLUMN IF NOT EXISTS intensity TEXT NOT NULL DEFAULT 'Moderate' CHECK (intensity IN ('Low', 'Moderate', 'High')),
ADD COLUMN IF NOT EXISTS calories INTEGER,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS equipment TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

UPDATE public.workouts
SET scheduled_date = COALESCE(scheduled_date, created_at::date)
WHERE scheduled_date IS NULL;

ALTER TABLE public.workouts
ALTER COLUMN scheduled_date SET NOT NULL;

CREATE TABLE IF NOT EXISTS public.workout_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  workout_type TEXT NOT NULL DEFAULT 'Strength' CHECK (workout_type IN ('Strength', 'Cardio', 'Mobility', 'Recovery', 'Push', 'Pull', 'Legs')),
  intensity TEXT NOT NULL DEFAULT 'Moderate' CHECK (intensity IN ('Low', 'Moderate', 'High')),
  duration TEXT NOT NULL DEFAULT '',
  calories INTEGER,
  notes TEXT,
  location TEXT,
  equipment TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'workout_templates'
      AND policyname = 'Users manage own workout templates'
  ) THEN
    CREATE POLICY "Users manage own workout templates"
    ON public.workout_templates
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'update_workout_templates_updated_at'
  ) THEN
    CREATE TRIGGER update_workout_templates_updated_at
    BEFORE UPDATE ON public.workout_templates
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;
