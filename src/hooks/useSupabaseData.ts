import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Habit types & hook
export interface Habit { id: string; day: string; habitName: string; done: boolean; }
export function useHabits() {
  const { user } = useAuth();
  const [items, setItems] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setItems([]); setLoading(false); return; }
    setLoading(true);
    supabase.from('habits').select('*').eq('user_id', user.id).then(({ data }) => {
      setItems((data || []).map(r => ({ id: r.id, day: r.day, habitName: r.habit_name, done: r.done })));
      setLoading(false);
    });
  }, [user]);

  const add = useCallback(async (item: { day: string; habitName: string }) => {
    if (!user) return;
    const { data } = await supabase.from('habits').insert({ user_id: user.id, day: item.day, habit_name: item.habitName, done: false }).select().single();
    if (data) setItems(prev => [...prev, { id: data.id, day: data.day, habitName: data.habit_name, done: data.done }]);
  }, [user]);

  const remove = useCallback(async (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    await supabase.from('habits').delete().eq('id', id);
  }, []);

  const toggle = useCallback(async (id: string) => {
    const item = items.find(h => h.id === id);
    if (!item) return;
    const newDone = !item.done;
    setItems(prev => prev.map(h => h.id === id ? { ...h, done: newDone } : h));
    await supabase.from('habits').update({ done: newDone }).eq('id', id);
  }, [items]);

  return { items, loading, add, remove, toggle };
}

// Meal types & hook
export interface Meal { id: string; type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'; day: string; name: string; }
export function useMeals() {
  const { user } = useAuth();
  const [items, setItems] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setItems([]); setLoading(false); return; }
    setLoading(true);
    supabase.from('meals').select('*').eq('user_id', user.id).then(({ data }) => {
      setItems((data || []).map(r => ({ id: r.id, type: r.type as Meal['type'], day: r.day, name: r.name })));
      setLoading(false);
    });
  }, [user]);

  const add = useCallback(async (item: { type: Meal['type']; day: string; name: string }) => {
    if (!user) return;
    const { data } = await supabase.from('meals').insert({ user_id: user.id, type: item.type, day: item.day, name: item.name }).select().single();
    if (data) setItems(prev => [...prev, { id: data.id, type: data.type as Meal['type'], day: data.day, name: data.name }]);
  }, [user]);

  const remove = useCallback(async (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    await supabase.from('meals').delete().eq('id', id);
  }, []);

  return { items, loading, add, remove };
}

// Shopping types & hook
export interface ShoppingItem { id: string; name: string; checked: boolean; }
export function useShopping() {
  const { user } = useAuth();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setItems([]); setLoading(false); return; }
    setLoading(true);
    supabase.from('shopping_items').select('*').eq('user_id', user.id).then(({ data }) => {
      setItems((data || []).map(r => ({ id: r.id, name: r.name, checked: r.checked })));
      setLoading(false);
    });
  }, [user]);

  const add = useCallback(async (item: { name: string }) => {
    if (!user) return;
    const { data } = await supabase.from('shopping_items').insert({ user_id: user.id, name: item.name, checked: false }).select().single();
    if (data) setItems(prev => [...prev, { id: data.id, name: data.name, checked: data.checked }]);
  }, [user]);

  const remove = useCallback(async (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    await supabase.from('shopping_items').delete().eq('id', id);
  }, []);

  const toggle = useCallback(async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const newChecked = !item.checked;
    setItems(prev => prev.map(i => i.id === id ? { ...i, checked: newChecked } : i));
    await supabase.from('shopping_items').update({ checked: newChecked }).eq('id', id);
  }, [items]);

  return { items, loading, add, remove, toggle };
}

// Finance types & hook
export interface FinanceEntry { id: string; type: 'income' | 'expense'; name: string; amount: number; }
export function useFinance() {
  const { user } = useAuth();
  const [items, setItems] = useState<FinanceEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setItems([]); setLoading(false); return; }
    setLoading(true);
    supabase.from('finance_entries').select('*').eq('user_id', user.id).then(({ data }) => {
      setItems((data || []).map(r => ({ id: r.id, type: r.type as FinanceEntry['type'], name: r.name, amount: Number(r.amount) })));
      setLoading(false);
    });
  }, [user]);

  const add = useCallback(async (item: { type: FinanceEntry['type']; name: string; amount: number }) => {
    if (!user) return;
    const { data } = await supabase.from('finance_entries').insert({ user_id: user.id, type: item.type, name: item.name, amount: item.amount }).select().single();
    if (data) setItems(prev => [...prev, { id: data.id, type: data.type as FinanceEntry['type'], name: data.name, amount: Number(data.amount) }]);
  }, [user]);

  const remove = useCallback(async (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    await supabase.from('finance_entries').delete().eq('id', id);
  }, []);

  return { items, loading, add, remove };
}

// Goals types & hook
export interface Goal { id: string; name: string; done: boolean; }
export function useGoals() {
  const { user } = useAuth();
  const [items, setItems] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setItems([]); setLoading(false); return; }
    setLoading(true);
    supabase.from('goals').select('*').eq('user_id', user.id).then(({ data }) => {
      setItems((data || []).map(r => ({ id: r.id, name: r.name, done: r.done })));
      setLoading(false);
    });
  }, [user]);

  const add = useCallback(async (item: { name: string }) => {
    if (!user) return;
    const { data } = await supabase.from('goals').insert({ user_id: user.id, name: item.name, done: false }).select().single();
    if (data) setItems(prev => [...prev, { id: data.id, name: data.name, done: data.done }]);
  }, [user]);

  const remove = useCallback(async (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    await supabase.from('goals').delete().eq('id', id);
  }, []);

  const toggle = useCallback(async (id: string) => {
    const item = items.find(g => g.id === id);
    if (!item) return;
    const newDone = !item.done;
    setItems(prev => prev.map(g => g.id === id ? { ...g, done: newDone } : g));
    await supabase.from('goals').update({ done: newDone }).eq('id', id);
  }, [items]);

  return { items, loading, add, remove, toggle };
}
