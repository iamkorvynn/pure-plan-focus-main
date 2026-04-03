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

export type WorkoutType = 'Strength' | 'Cardio' | 'Mobility' | 'Recovery' | 'Push' | 'Pull' | 'Legs';
export type WorkoutIntensity = 'Low' | 'Moderate' | 'High';

export interface WorkoutExercise {
    id: string;
    name: string;
    sets: string;
    reps: string;
    weight: string;
    time: string;
    distance: string;
    notes: string;
}

export interface Workout {
    id: string;
    scheduledDate: string;
    workoutName: string;
    duration: string;
    done: boolean;
    workoutType: WorkoutType;
    intensity: WorkoutIntensity;
    calories: number | null;
    notes: string;
    location: string;
    equipment: string;
    tags: string[];
    exercises: WorkoutExercise[];
    completedAt: string | null;
    createdAt: string;
}

export interface WorkoutTemplate {
    id: string;
    name: string;
    workoutType: WorkoutType;
    intensity: WorkoutIntensity;
    duration: string;
    calories: number | null;
    notes: string;
    location: string;
    equipment: string;
    tags: string[];
    exercises: WorkoutExercise[];
}

export interface WorkoutDraft {
    scheduledDate: string;
    workoutName: string;
    duration: string;
    workoutType: WorkoutType;
    intensity: WorkoutIntensity;
    calories: string;
    notes: string;
    location: string;
    equipment: string;
    tags: string[];
    exercises: WorkoutExercise[];
}

interface WorkoutContextType {
    workouts: Workout[];
    templates: WorkoutTemplate[];
    loading: boolean;
    addWorkout: (workout: WorkoutDraft) => Promise<void>;
    toggleWorkout: (id: string) => Promise<void>;
    removeWorkout: (id: string) => Promise<void>;
    editWorkout: (id: string, updates: WorkoutDraft) => Promise<void>;
    addWorkoutTemplate: (template: Omit<WorkoutTemplate, 'id'>) => Promise<void>;
    removeWorkoutTemplate: (id: string) => Promise<void>;
}

const WorkoutContext = createContext<WorkoutContextType | null>(null);

const defaultExercises = (): WorkoutExercise[] => [];

const toStringValue = (value: unknown) => (typeof value === 'string' ? value : '');

const normalizeExercises = (value: unknown): WorkoutExercise[] => {
    if (!Array.isArray(value)) return defaultExercises();

    return value.map((exercise, index) => {
        const record = typeof exercise === 'object' && exercise !== null ? exercise as Record<string, unknown> : {};

        return {
            id: toStringValue(record.id) || `exercise-${index}`,
            name: toStringValue(record.name),
            sets: toStringValue(record.sets),
            reps: toStringValue(record.reps),
            weight: toStringValue(record.weight),
            time: toStringValue(record.time),
            distance: toStringValue(record.distance),
            notes: toStringValue(record.notes),
        };
    });
};

const mapWorkoutRow = (w: {
    id: string;
    scheduled_date: string;
    workout_name: string;
    duration: string;
    done: boolean;
    workout_type: string;
    intensity: string;
    calories: number | null;
    notes: string | null;
    location: string | null;
    equipment: string | null;
    tags: string[];
    exercises: unknown;
    completed_at: string | null;
    created_at: string;
}) => ({
    id: w.id,
    scheduledDate: w.scheduled_date,
    workoutName: w.workout_name,
    duration: w.duration,
    done: w.done,
    workoutType: w.workout_type as WorkoutType,
    intensity: w.intensity as WorkoutIntensity,
    calories: w.calories,
    notes: w.notes ?? '',
    location: w.location ?? '',
    equipment: w.equipment ?? '',
    tags: w.tags ?? [],
    exercises: normalizeExercises(w.exercises),
    completedAt: w.completed_at,
    createdAt: w.created_at,
});

const mapTemplateRow = (template: {
    id: string;
    name: string;
    workout_type: string;
    intensity: string;
    duration: string;
    calories: number | null;
    notes: string | null;
    location: string | null;
    equipment: string | null;
    tags: string[];
    exercises: unknown;
}) => ({
    id: template.id,
    name: template.name,
    workoutType: template.workout_type as WorkoutType,
    intensity: template.intensity as WorkoutIntensity,
    duration: template.duration,
    calories: template.calories,
    notes: template.notes ?? '',
    location: template.location ?? '',
    equipment: template.equipment ?? '',
    tags: template.tags ?? [],
    exercises: normalizeExercises(template.exercises),
});

const serializeWorkoutDraft = (workout: WorkoutDraft) => ({
    scheduled_date: workout.scheduledDate,
    day: workout.scheduledDate,
    workout_name: workout.workoutName.trim(),
    duration: workout.duration.trim(),
    workout_type: workout.workoutType,
    intensity: workout.intensity,
    calories: workout.calories.trim() ? Number(workout.calories) : null,
    notes: workout.notes.trim() || null,
    location: workout.location.trim() || null,
    equipment: workout.equipment.trim() || null,
    tags: workout.tags,
    exercises: workout.exercises,
});

export function WorkoutProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWorkouts = async () => {
            if (!user) {
                setWorkouts([]);
                setTemplates([]);
                setLoading(false);
                return;
            }

            setLoading(true);

            const [{ data: workoutsData, error: workoutsError }, { data: templatesData, error: templatesError }] = await Promise.all([
                supabase
                    .from('workouts')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('scheduled_date', { ascending: true }),
                supabase
                    .from('workout_templates')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false }),
            ]);

            if (workoutsError) {
                console.error('Error fetching workouts:', workoutsError.message);
                setWorkouts([]);
            } else {
                setWorkouts((workoutsData || []).map(mapWorkoutRow));
            }

            if (templatesError) {
                console.error('Error fetching workout templates:', templatesError.message);
                setTemplates([]);
            } else {
                setTemplates((templatesData || []).map(mapTemplateRow));
            }

            setLoading(false);
        };

        fetchWorkouts();
    }, [user]);

    const addWorkout = useCallback(
        async (workout: WorkoutDraft) => {
            if (!user) return;

            const { data, error } = await supabase
                .from('workouts')
                .insert({
                    user_id: user.id,
                    done: false,
                    completed_at: null,
                    ...serializeWorkoutDraft(workout),
                })
                .select()
                .single();

            if (error) {
                console.error('Error adding workout:', error.message);
                return;
            }

            if (data) {
                setWorkouts((prev) =>
                    [...prev, mapWorkoutRow(data)].sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
                );
            }
        },
        [user]
    );

    const editWorkout = useCallback(
        async (id: string, updates: WorkoutDraft) => {
            const { data, error } = await supabase
                .from('workouts')
                .update(serializeWorkoutDraft(updates))
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Error editing workout:', error.message);
                return;
            }

            if (data) {
                setWorkouts((prev) =>
                    prev
                        .map((workout) => (workout.id === id ? mapWorkoutRow(data) : workout))
                        .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
                );
            }
        },
        []
    );

    const toggleWorkout = useCallback(
        async (id: string) => {
            const workout = workouts.find((entry) => entry.id === id);
            if (!workout) return;

            const newDone = !workout.done;
            const completedAt = newDone ? new Date().toISOString() : null;

            setWorkouts((prev) =>
                prev.map((entry) =>
                    entry.id === id ? { ...entry, done: newDone, completedAt } : entry
                )
            );

            const { error } = await supabase
                .from('workouts')
                .update({ done: newDone, completed_at: completedAt })
                .eq('id', id);

            if (error) {
                console.error('Error toggling workout:', error.message);
            }
        },
        [workouts]
    );

    const removeWorkout = useCallback(async (id: string) => {
        setWorkouts((prev) => prev.filter((workout) => workout.id !== id));

        const { error } = await supabase
            .from('workouts')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting workout:', error.message);
        }
    }, []);

    const addWorkoutTemplate = useCallback(
        async (template: Omit<WorkoutTemplate, 'id'>) => {
            if (!user) return;

            const { data, error } = await supabase
                .from('workout_templates')
                .insert({
                    user_id: user.id,
                    name: template.name.trim(),
                    workout_type: template.workoutType,
                    intensity: template.intensity,
                    duration: template.duration.trim(),
                    calories: template.calories,
                    notes: template.notes.trim() || null,
                    location: template.location.trim() || null,
                    equipment: template.equipment.trim() || null,
                    tags: template.tags,
                    exercises: template.exercises,
                })
                .select()
                .single();

            if (error) {
                console.error('Error adding workout template:', error.message);
                return;
            }

            if (data) {
                setTemplates((prev) => [mapTemplateRow(data), ...prev]);
            }
        },
        [user]
    );

    const removeWorkoutTemplate = useCallback(async (id: string) => {
        setTemplates((prev) => prev.filter((template) => template.id !== id));

        const { error } = await supabase
            .from('workout_templates')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting workout template:', error.message);
        }
    }, []);

    return (
        <WorkoutContext.Provider
            value={{
                workouts,
                templates,
                loading,
                addWorkout,
                toggleWorkout,
                removeWorkout,
                editWorkout,
                addWorkoutTemplate,
                removeWorkoutTemplate,
            }}
        >
            {children}
        </WorkoutContext.Provider>
    );
}

export function useWorkoutContext() {
    const ctx = useContext(WorkoutContext);
    if (!ctx) {
        throw new Error('useWorkoutContext must be used within WorkoutProvider');
    }

    return ctx;
}
