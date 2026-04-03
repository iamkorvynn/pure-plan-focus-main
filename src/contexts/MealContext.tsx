import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
export type MealStatus = 'planned' | 'prepared' | 'eaten';

export interface Meal {
  id: string;
  name: string;
  type: MealType;
  scheduledDate: string;
  status: MealStatus;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fats: number | null;
  notes: string;
  tags: string[];
  mealTime: string;
  waterMl: number | null;
  prepAhead: boolean;
  ingredients: string[];
  eatenAt: string | null;
}

export interface MealTemplate {
  id: string;
  name: string;
  type: MealType;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fats: number | null;
  notes: string;
  tags: string[];
  mealTime: string;
  waterMl: number | null;
  prepAhead: boolean;
  ingredients: string[];
}

export interface MealDraft {
  name: string;
  type: MealType;
  scheduledDate: string;
  status: MealStatus;
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
  notes: string;
  tags: string[];
  mealTime: string;
  waterMl: string;
  prepAhead: boolean;
  ingredients: string[];
}

interface MealContextType {
  meals: Meal[];
  templates: MealTemplate[];
  loading: boolean;
  addMeal: (meal: MealDraft) => Promise<void>;
  removeMeal: (id: string) => Promise<void>;
  editMeal: (id: string, meal: MealDraft) => Promise<void>;
  updateMealStatus: (id: string, status: MealStatus) => Promise<void>;
  addMealTemplate: (template: Omit<MealTemplate, 'id'>) => Promise<void>;
  removeMealTemplate: (id: string) => Promise<void>;
}

const MealContext = createContext<MealContextType | null>(null);

const mapMealRow = (meal: {
  id: string;
  name: string;
  type: string;
  scheduled_date: string;
  status: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fats: number | null;
  notes: string | null;
  tags: string[];
  meal_time: string | null;
  water_ml: number | null;
  prep_ahead: boolean;
  ingredients: string[];
  eaten_at: string | null;
}): Meal => ({
  id: meal.id,
  name: meal.name,
  type: meal.type as MealType,
  scheduledDate: meal.scheduled_date,
  status: meal.status as MealStatus,
  calories: meal.calories,
  protein: meal.protein,
  carbs: meal.carbs,
  fats: meal.fats,
  notes: meal.notes ?? '',
  tags: meal.tags ?? [],
  mealTime: meal.meal_time ?? '',
  waterMl: meal.water_ml,
  prepAhead: meal.prep_ahead,
  ingredients: meal.ingredients ?? [],
  eatenAt: meal.eaten_at,
});

const mapTemplateRow = (template: {
  id: string;
  name: string;
  type: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fats: number | null;
  notes: string | null;
  tags: string[];
  meal_time: string | null;
  water_ml: number | null;
  prep_ahead: boolean;
  ingredients: string[];
}): MealTemplate => ({
  id: template.id,
  name: template.name,
  type: template.type as MealType,
  calories: template.calories,
  protein: template.protein,
  carbs: template.carbs,
  fats: template.fats,
  notes: template.notes ?? '',
  tags: template.tags ?? [],
  mealTime: template.meal_time ?? '',
  waterMl: template.water_ml,
  prepAhead: template.prep_ahead,
  ingredients: template.ingredients ?? [],
});

const serializeMealDraft = (meal: MealDraft) => {
  const status = meal.status;
  const eatenAt = status === 'eaten' ? new Date().toISOString() : null;

  return {
    name: meal.name.trim(),
    type: meal.type,
    scheduled_date: meal.scheduledDate,
    day: meal.scheduledDate,
    status,
    calories: meal.calories.trim() ? Number(meal.calories) : null,
    protein: meal.protein.trim() ? Number(meal.protein) : null,
    carbs: meal.carbs.trim() ? Number(meal.carbs) : null,
    fats: meal.fats.trim() ? Number(meal.fats) : null,
    notes: meal.notes.trim() || null,
    tags: meal.tags,
    meal_time: meal.mealTime.trim() || null,
    water_ml: meal.waterMl.trim() ? Number(meal.waterMl) : null,
    prep_ahead: meal.prepAhead,
    ingredients: meal.ingredients,
    eaten_at: eatenAt,
  };
};

export function MealProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [templates, setTemplates] = useState<MealTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeals = async () => {
      if (!user) {
        setMeals([]);
        setTemplates([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      const [{ data: mealsData, error: mealsError }, { data: templatesData, error: templatesError }] = await Promise.all([
        supabase
          .from('meals')
          .select('*')
          .eq('user_id', user.id)
          .order('scheduled_date', { ascending: true }),
        supabase
          .from('meal_templates')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
      ]);

      if (mealsError) {
        console.error('Failed to load meals:', mealsError.message);
        setMeals([]);
      } else {
        setMeals((mealsData || []).map(mapMealRow));
      }

      if (templatesError) {
        console.error('Failed to load meal templates:', templatesError.message);
        setTemplates([]);
      } else {
        setTemplates((templatesData || []).map(mapTemplateRow));
      }

      setLoading(false);
    };

    fetchMeals();
  }, [user]);

  const addMeal = useCallback(async (meal: MealDraft) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('meals')
      .insert({
        user_id: user.id,
        ...serializeMealDraft(meal),
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to add meal:', error.message);
      return;
    }

    if (data) {
      setMeals((prev) => [...prev, mapMealRow(data)].sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate)));
    }
  }, [user]);

  const removeMeal = useCallback(async (id: string) => {
    setMeals((prev) => prev.filter((meal) => meal.id !== id));
    const { error } = await supabase.from('meals').delete().eq('id', id);
    if (error) {
      console.error('Failed to delete meal:', error.message);
    }
  }, []);

  const editMeal = useCallback(async (id: string, meal: MealDraft) => {
    const { data, error } = await supabase
      .from('meals')
      .update(serializeMealDraft(meal))
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Failed to edit meal:', error.message);
      return;
    }

    if (data) {
      setMeals((prev) =>
        prev
          .map((entry) => (entry.id === id ? mapMealRow(data) : entry))
          .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
      );
    }
  }, []);

  const updateMealStatus = useCallback(async (id: string, status: MealStatus) => {
    const eatenAt = status === 'eaten' ? new Date().toISOString() : null;

    setMeals((prev) =>
      prev.map((meal) => (meal.id === id ? { ...meal, status, eatenAt } : meal))
    );

    const { error } = await supabase
      .from('meals')
      .update({ status, eaten_at: eatenAt })
      .eq('id', id);

    if (error) {
      console.error('Failed to update meal status:', error.message);
    }
  }, []);

  const addMealTemplate = useCallback(async (template: Omit<MealTemplate, 'id'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('meal_templates')
      .insert({
        user_id: user.id,
        name: template.name.trim(),
        type: template.type,
        calories: template.calories,
        protein: template.protein,
        carbs: template.carbs,
        fats: template.fats,
        notes: template.notes.trim() || null,
        tags: template.tags,
        meal_time: template.mealTime.trim() || null,
        water_ml: template.waterMl,
        prep_ahead: template.prepAhead,
        ingredients: template.ingredients,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to add meal template:', error.message);
      return;
    }

    if (data) {
      setTemplates((prev) => [mapTemplateRow(data), ...prev]);
    }
  }, [user]);

  const removeMealTemplate = useCallback(async (id: string) => {
    setTemplates((prev) => prev.filter((template) => template.id !== id));
    const { error } = await supabase.from('meal_templates').delete().eq('id', id);
    if (error) {
      console.error('Failed to delete meal template:', error.message);
    }
  }, []);

  return (
    <MealContext.Provider value={{ meals, templates, loading, addMeal, removeMeal, editMeal, updateMealStatus, addMealTemplate, removeMealTemplate }}>
      {children}
    </MealContext.Provider>
  );
}

export function useMealContext() {
  const ctx = useContext(MealContext);
  if (!ctx) throw new Error('useMealContext must be used within MealProvider');
  return ctx;
}
