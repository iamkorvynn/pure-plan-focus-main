import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Task {
  id: string;
  name: string;
  category: 'Work' | 'Life' | 'Health' | 'Personal' | 'Home';
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  completed: boolean;
}

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  addTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  editTask: (id: string, name: string) => void;
}

const TaskContext = createContext<TaskContextType | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('due_date', { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to load tasks:', error.message);
          setTasks([]);
          setLoading(false);
          return;
        }

        setTasks(
          (data || []).map((t) => ({
            id: t.id,
            name: t.name,
            category: t.category as Task['category'],
            priority: t.priority as Task['priority'],
            dueDate: t.due_date,
            completed: t.completed,
          }))
        );
        setLoading(false);
      });
  }, [user]);

  const toggleTask = useCallback(async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const oldCompleted = task.completed;
    const newCompleted = !oldCompleted;

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: newCompleted } : t))
    );

    const { error } = await supabase
      .from('tasks')
      .update({ completed: newCompleted })
      .eq('id', id);

    if (error) {
      console.error('Failed to toggle task:', error.message);
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: oldCompleted } : t))
      );
    }
  }, [tasks]);

  const removeTask = useCallback(async (id: string) => {
    const oldTasks = tasks;

    setTasks((prev) => prev.filter((t) => t.id !== id));

    const { error } = await supabase.from('tasks').delete().eq('id', id);

    if (error) {
      console.error('Failed to delete task:', error.message);
      setTasks(oldTasks);
    }
  }, [tasks]);

  const addTask = useCallback(async (task: Omit<Task, 'id' | 'completed'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        name: task.name,
        category: task.category,
        priority: task.priority,
        due_date: task.dueDate,
        completed: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to add task:', error.message);
      return;
    }

    if (data) {
      setTasks((prev) =>
        [
          ...prev,
          {
            id: data.id,
            name: data.name,
            category: data.category as Task['category'],
            priority: data.priority as Task['priority'],
            dueDate: data.due_date,
            completed: data.completed,
          },
        ].sort(
          (a, b) =>
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        )
      );
    }
  }, [user]);

  const editTask = useCallback(async (id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const oldTasks = tasks;

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, name: trimmed } : t))
    );

    const { error } = await supabase
      .from('tasks')
      .update({ name: trimmed })
      .eq('id', id);

    if (error) {
      console.error('Failed to edit task:', error.message);
      setTasks(oldTasks);
    }
  }, [tasks]);

  return (
    <TaskContext.Provider
      value={{ tasks, loading, toggleTask, removeTask, addTask, editTask }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTaskContext must be used within TaskProvider');
  return ctx;
}