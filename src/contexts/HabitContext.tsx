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

export interface Habit {
    id: string;
    day: string;
    habitName: string;
    done: boolean;
}

interface HabitContextType {
    habits: Habit[];
    loading: boolean;
    addHabit: (habit: Omit<Habit, 'id' | 'done'>) => void;
    toggleHabit: (id: string) => void;
    removeHabit: (id: string) => void;
    editHabit: (id: string, habitName: string) => void;
}

const HabitContext = createContext<HabitContextType | null>(null);

export function HabitProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [habits, setHabits] = useState<Habit[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setHabits([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        supabase
            .from('habits')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .then(({ data, error }) => {
                if (error) {
                    console.error('Failed to load habits:', error.message);
                    setHabits([]);
                    setLoading(false);
                    return;
                }

                setHabits(
                    (data || []).map((h) => ({
                        id: h.id,
                        day: h.day,
                        habitName: h.habit_name,
                        done: h.done,
                    }))
                );
                setLoading(false);
            });
    }, [user]);

    const addHabit = useCallback(
        async (habit: Omit<Habit, 'id' | 'done'>) => {
            if (!user) return;

            const { data, error } = await supabase
                .from('habits')
                .insert({
                    user_id: user.id,
                    day: habit.day,
                    habit_name: habit.habitName,
                    done: false,
                })
                .select()
                .single();

            if (error) {
                console.error('Failed to add habit:', error.message);
                return;
            }

            if (data) {
                setHabits((prev) => [
                    {
                        id: data.id,
                        day: data.day,
                        habitName: data.habit_name,
                        done: data.done,
                    },
                    ...prev,
                ]);
            }
        },
        [user]
    );

    const toggleHabit = useCallback(
        async (id: string) => {
            const habit = habits.find((h) => h.id === id);
            if (!habit) return;

            const oldDone = habit.done;
            const newDone = !oldDone;

            setHabits((prev) =>
                prev.map((h) => (h.id === id ? { ...h, done: newDone } : h))
            );

            const { error } = await supabase
                .from('habits')
                .update({ done: newDone })
                .eq('id', id);

            if (error) {
                console.error('Failed to toggle habit:', error.message);
                setHabits((prev) =>
                    prev.map((h) => (h.id === id ? { ...h, done: oldDone } : h))
                );
            }
        },
        [habits]
    );

    const removeHabit = useCallback(
        async (id: string) => {
            const oldHabits = habits;
            setHabits((prev) => prev.filter((h) => h.id !== id));

            const { error } = await supabase.from('habits').delete().eq('id', id);

            if (error) {
                console.error('Failed to delete habit:', error.message);
                setHabits(oldHabits);
            }
        },
        [habits]
    );

    const editHabit = useCallback(
        async (id: string, habitName: string) => {
            const trimmed = habitName.trim();
            if (!trimmed) return;

            const oldHabits = habits;
            setHabits((prev) =>
                prev.map((h) => (h.id === id ? { ...h, habitName: trimmed } : h))
            );

            const { error } = await supabase
                .from('habits')
                .update({ habit_name: trimmed })
                .eq('id', id);

            if (error) {
                console.error('Failed to edit habit:', error.message);
                setHabits(oldHabits);
            }
        },
        [habits]
    );

    return (
        <HabitContext.Provider
            value={{ habits, loading, addHabit, toggleHabit, removeHabit, editHabit }}
        >
            {children}
        </HabitContext.Provider>
    );
}

export function useHabitContext() {
    const ctx = useContext(HabitContext);
    if (!ctx) throw new Error('useHabitContext must be used within HabitProvider');
    return ctx;
}