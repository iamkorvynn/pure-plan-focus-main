ALTER TABLE public.meals
ADD COLUMN IF NOT EXISTS scheduled_date DATE,
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'prepared', 'eaten')),
ADD COLUMN IF NOT EXISTS calories INTEGER,
ADD COLUMN IF NOT EXISTS protein INTEGER,
ADD COLUMN IF NOT EXISTS carbs INTEGER,
ADD COLUMN IF NOT EXISTS fats INTEGER,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS meal_time TEXT,
ADD COLUMN IF NOT EXISTS water_ml INTEGER,
ADD COLUMN IF NOT EXISTS prep_ahead BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS ingredients TEXT[] NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS eaten_at TIMESTAMPTZ;

UPDATE public.meals
SET scheduled_date = COALESCE(scheduled_date, created_at::date)
WHERE scheduled_date IS NULL;

ALTER TABLE public.meals
ALTER COLUMN scheduled_date SET NOT NULL;

CREATE TABLE IF NOT EXISTS public.meal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Breakfast', 'Lunch', 'Dinner', 'Snack')),
  calories INTEGER,
  protein INTEGER,
  carbs INTEGER,
  fats INTEGER,
  notes TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  meal_time TEXT,
  water_ml INTEGER,
  prep_ahead BOOLEAN NOT NULL DEFAULT false,
  ingredients TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.meal_templates ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'meal_templates'
      AND policyname = 'Users manage own meal templates'
  ) THEN
    CREATE POLICY "Users manage own meal templates"
    ON public.meal_templates
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
    WHERE tgname = 'update_meal_templates_updated_at'
  ) THEN
    CREATE TRIGGER update_meal_templates_updated_at
    BEFORE UPDATE ON public.meal_templates
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;
