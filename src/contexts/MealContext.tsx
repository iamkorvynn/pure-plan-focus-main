import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Meal {
  id: string;
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  day: string;
  name: string;
}

interface MealContextType {
  meals: Meal[];
  loading: boolean;
  addMeal: (meal: Omit<Meal, 'id'>) => void;
  removeMeal: (id: string) => void;
  editMeal: (id: string, name: string) => void;
}

const MealContext = createContext<MealContextType | null>(null);

export function MealProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setMeals([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    supabase
      .from('meals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to load meals:', error.message);
          setMeals([]);
          setLoading(false);
          return;
        }

        setMeals(
          (data || []).map((m) => ({
            id: m.id,
            type: m.type as Meal['type'],
            day: m.day,
            name: m.name,
          }))
        );
        setLoading(false);
      });
  }, [user]);

  const addMeal = useCallback(
    async (meal: Omit<Meal, 'id'>) => {
      if (!user) return;

      const { data, error } = await supabase
        .from('meals')
        .insert({
          user_id: user.id,
          type: meal.type,
          day: meal.day,
          name: meal.name,
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to add meal:', error.message);
        return;
      }

      if (data) {
        setMeals((prev) => [
          {
            id: data.id,
            type: data.type as Meal['type'],
            day: data.day,
            name: data.name,
          },
          ...prev,
        ]);
      }
    },
    [user]
  );

  const removeMeal = useCallback(
    async (id: string) => {
      const oldMeals = meals;
      setMeals((prev) => prev.filter((m) => m.id !== id));

      const { error } = await supabase.from('meals').delete().eq('id', id);

      if (error) {
        console.error('Failed to delete meal:', error.message);
        setMeals(oldMeals);
      }
    },
    [meals]
  );

  const editMeal = useCallback(
    async (id: string, name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;

      const oldMeals = meals;
      setMeals((prev) =>
        prev.map((m) => (m.id === id ? { ...m, name: trimmed } : m))
      );

      const { error } = await supabase
        .from('meals')
        .update({ name: trimmed })
        .eq('id', id);

      if (error) {
        console.error('Failed to edit meal:', error.message);
        setMeals(oldMeals);
      }
    },
    [meals]
  );

  return (
    <MealContext.Provider value={{ meals, loading, addMeal, removeMeal, editMeal }}>
      {children}
    </MealContext.Provider>
  );
}

export function useMealContext() {
  const ctx = useContext(MealContext);
  if (!ctx) throw new Error('useMealContext must be used within MealProvider');
  return ctx;
}