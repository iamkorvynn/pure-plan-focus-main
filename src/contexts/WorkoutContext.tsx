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

export interface Workout {
    id: string;
    day: string;
    workoutName: string;
    duration: string;
    done: boolean;
}

interface WorkoutContextType {
    workouts: Workout[];
    loading: boolean;
    addWorkout: (workout: Omit<Workout, 'id' | 'done'>) => void;
    toggleWorkout: (id: string) => void;
    removeWorkout: (id: string) => void;
    editWorkout: (id: string, name: string) => void;
}

const WorkoutContext = createContext<WorkoutContextType | null>(null);

export function WorkoutProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [loading, setLoading] = useState(true);

    // 🔥 FETCH WORKOUTS
    useEffect(() => {
        const fetchWorkouts = async () => {
            if (!user) {
                setWorkouts([]);
                setLoading(false);
                return;
            }

            setLoading(true);

            const { data, error } = await supabase
                .from('workouts')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching workouts:', error.message);
                setWorkouts([]);
                setLoading(false);
                return;
            }

            setWorkouts(
                (data || []).map((w) => ({
                    id: w.id,
                    day: w.day,
                    workoutName: w.workout_name,
                    duration: w.duration,
                    done: w.done,
                }))
            );

            setLoading(false);
        };

        fetchWorkouts();
    }, [user]);

    // 🔥 ADD WORKOUT

    const addWorkout = useCallback(
        async (workout: Omit<Workout, 'id' | 'done'>) => {
            if (!user) return;

            const { data, error } = await supabase
                .from('workouts')
                .insert({
                    user_id: user.id,
                    day: workout.day,
                    workout_name: workout.workoutName,
                    duration: workout.duration,
                    done: false,
                })
                .select()
                .single();

            if (error) {
                console.error('Error adding workout:', error.message);
                return;
            }

            if (data) {
                setWorkouts((prev) => [
                    {
                        id: data.id,
                        day: data.day,
                        workoutName: data.workout_name,
                        duration: data.duration,
                        done: data.done,
                    },
                    ...prev,
                ]);
            }
        },
        [user]
    );

    // 🔥 TOGGLE WORKOUT
    const toggleWorkout = useCallback(
        async (id: string) => {
            const workout = workouts.find((w) => w.id === id);
            if (!workout) return;

            const newDone = !workout.done;

            setWorkouts((prev) =>
                prev.map((w) =>
                    w.id === id ? { ...w, done: newDone } : w
                )
            );

            await supabase
                .from('workouts')
                .update({ done: newDone })
                .eq('id', id);
        },
        [workouts]
    );

    // 🔥 DELETE WORKOUT
    const removeWorkout = useCallback(
        async (id: string) => {
            setWorkouts((prev) => prev.filter((w) => w.id !== id));

            await supabase
                .from('workouts')
                .delete()
                .eq('id', id);
        },
        []
    );

    // 🔥 EDIT WORKOUT
    const editWorkout = useCallback(
        async (id: string, name: string) => {
            setWorkouts((prev) =>
                prev.map((w) =>
                    w.id === id ? { ...w, workoutName: name } : w
                )
            );

            await supabase
                .from('workouts')
                .update({ workout_name: name })
                .eq('id', id);
        },
        []
    );

    return (
        <WorkoutContext.Provider
            value={{
                workouts,
                loading,
                addWorkout,
                toggleWorkout,
                removeWorkout,
                editWorkout,
            }}
        >
            {children}
        </WorkoutContext.Provider>
    );
}

// 🔥 HOOK
export function useWorkoutContext() {
    const ctx = useContext(WorkoutContext);
    if (!ctx) {
        throw new Error('useWorkoutContext must be used within WorkoutProvider');
    }
    return ctx;
}