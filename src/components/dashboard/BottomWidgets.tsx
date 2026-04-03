import { useState } from 'react';
import { useHabits, useMeals, useShopping, useFinance, type Meal, type FinanceEntry } from '@/hooks/useSupabaseData';

function HabitTracker() {
  const { items: habits, toggle, add } = useHabits();
  const [showAdd, setShowAdd] = useState(false);
  const [newHabit, setNewHabit] = useState('');

  const addHabit = () => {
    if (!newHabit.trim()) return;
    add({ day: 'Monday', habitName: newHabit.trim() });
    setNewHabit(''); setShowAdd(false);
  };

  const done = habits.filter(h => h.done).length;
  const pct = habits.length > 0 ? Math.round((done / habits.length) * 100) : 0;

  return (
    <div className="glass-panel rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-foreground font-semibold text-sm">Habit Tracker</h3>
        <span className="text-muted-foreground text-[10px]">Today</span>
      </div>
      <div className="mb-3">
        <span className="text-xs text-muted-foreground">Monday</span>
        <div className="w-full bg-secondary rounded-full h-1.5 mt-1.5">
          <div className="bg-primary h-1.5 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
        <div className="text-xs text-muted-foreground mt-1 font-mono">{pct}%</div>
      </div>
      <div className="space-y-2">
        {habits.map(h => (
          <label key={h.id} className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={h.done} onChange={() => toggle(h.id)} className="w-3.5 h-3.5 accent-primary rounded" />
            <span className={`text-xs ${h.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{h.habitName}</span>
          </label>
        ))}
      </div>
      {showAdd ? (
        <div className="mt-3 flex gap-1">
          <input value={newHabit} onChange={e => setNewHabit(e.target.value)} onKeyDown={e => e.key === 'Enter' && addHabit()} placeholder="Habit name..." className="flex-1 bg-input text-foreground text-xs px-2 py-1 rounded border border-border outline-none" autoFocus />
          <button onClick={addHabit} className="text-xs text-primary hover:opacity-80">Add</button>
          <button onClick={() => { setShowAdd(false); setNewHabit(''); }} className="text-xs text-muted-foreground">✕</button>
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)} className="mt-3 w-full py-1.5 bg-secondary text-muted-foreground text-xs rounded-md hover:text-primary transition-colors">+ New</button>
      )}
    </div>
  );
}

function MealPlanner() {
  const { items: meals, add, remove } = useMeals();
  const [showAdd, setShowAdd] = useState(false);
  const [newMeal, setNewMeal] = useState({ type: 'Lunch' as Meal['type'], name: '', day: 'Monday' });

  const addMeal = () => {
    if (!newMeal.name.trim()) return;
    add({ type: newMeal.type, name: newMeal.name.trim(), day: newMeal.day });
    setNewMeal({ type: 'Lunch', name: '', day: 'Monday' }); setShowAdd(false);
  };

  return (
    <div className="glass-panel rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-foreground font-semibold text-sm">Meal Planner</h3>
        <span className="text-muted-foreground text-[10px]">Today</span>
      </div>
      <div className="space-y-3">
        {meals.map(meal => (
          <div key={meal.id} className="group">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-primary">{meal.type}</span>
                <span className="ml-2 text-[10px] bg-warning/20 text-warning px-1.5 py-0.5 rounded">{meal.day}</span>
              </div>
              <button onClick={() => remove(meal.id)} className="text-muted-foreground hover:text-destructive text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
            </div>
            <div className="text-xs text-muted-foreground mt-1">{meal.name}</div>
          </div>
        ))}
      </div>
      {showAdd ? (
        <div className="mt-3 space-y-1.5">
          <input value={newMeal.name} onChange={e => setNewMeal({ ...newMeal, name: e.target.value })} onKeyDown={e => e.key === 'Enter' && addMeal()} placeholder="Meal name..." className="w-full bg-input text-foreground text-xs px-2 py-1 rounded border border-border outline-none" autoFocus />
          <div className="flex gap-1">
            <select value={newMeal.type} onChange={e => setNewMeal({ ...newMeal, type: e.target.value as Meal['type'] })} className="bg-input text-foreground text-[10px] rounded px-1 py-0.5 border border-border outline-none">
              {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={newMeal.day} onChange={e => setNewMeal({ ...newMeal, day: e.target.value })} className="bg-input text-foreground text-[10px] rounded px-1 py-0.5 border border-border outline-none">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <button onClick={addMeal} className="text-[10px] text-primary hover:opacity-80">Add</button>
            <button onClick={() => setShowAdd(false)} className="text-[10px] text-muted-foreground">✕</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)} className="mt-3 w-full py-1.5 bg-secondary text-muted-foreground text-xs rounded-md hover:text-primary transition-colors">+ New</button>
      )}
    </div>
  );
}

function ShoppingList() {
  const { items, toggle, add, remove } = useShopping();
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState('');

  const addItem = () => {
    if (!newItem.trim()) return;
    add({ name: newItem.trim() });
    setNewItem(''); setShowAdd(false);
  };

  return (
    <div className="glass-panel rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-foreground font-semibold text-sm">Shopping List</h3>
        <span className="text-muted-foreground text-[10px]">Shopping</span>
      </div>
      <div className="space-y-1.5">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-2 group">
            <input type="checkbox" checked={item.checked} onChange={() => toggle(item.id)} className="w-3 h-3 accent-primary cursor-pointer" />
            <span className={`text-xs truncate flex-1 ${item.checked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{item.name}</span>
            <button onClick={() => remove(item.id)} className="text-muted-foreground hover:text-destructive text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
          </div>
        ))}
      </div>
      {showAdd ? (
        <div className="mt-3 flex gap-1">
          <input value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && addItem()} placeholder="Item name..." className="flex-1 bg-input text-foreground text-xs px-2 py-1 rounded border border-border outline-none" autoFocus />
          <button onClick={addItem} className="text-[10px] text-primary hover:opacity-80">Add</button>
          <button onClick={() => { setShowAdd(false); setNewItem(''); }} className="text-[10px] text-muted-foreground">✕</button>
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)} className="mt-3 text-muted-foreground text-xs hover:text-primary transition-colors">+ New</button>
      )}
    </div>
  );
}

function Finance() {
  const { items: entries, add } = useFinance();
  const [showAdd, setShowAdd] = useState(false);
  const [newEntry, setNewEntry] = useState({ type: 'income' as FinanceEntry['type'], name: '', amount: '' });

  const addEntry = () => {
    if (!newEntry.name.trim() || !newEntry.amount) return;
    add({ type: newEntry.type, name: newEntry.name.trim(), amount: parseFloat(newEntry.amount) });
    setNewEntry({ type: 'income', name: '', amount: '' }); setShowAdd(false);
  };

  const totalIncome = entries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const totalExpenses = entries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
  const balance = totalIncome - totalExpenses;

  return (
    <div className="glass-panel rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-foreground font-semibold text-sm">Finance</h3>
        <span className="text-muted-foreground text-[10px]">This month</span>
      </div>
      <div className="space-y-2">
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Total Income</span><span className="text-success font-mono">${totalIncome.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Total Expenses</span><span className="text-destructive font-mono">${totalExpenses.toFixed(2)}</span></div>
          <div className="flex justify-between border-t border-border pt-1.5"><span className="text-muted-foreground">Balance</span><span className={`font-medium font-mono ${balance >= 0 ? 'text-success' : 'text-destructive'}`}>${balance.toFixed(2)}</span></div>
        </div>
        {entries.length > 0 && (
          <div className="space-y-1 mt-2 max-h-24 overflow-y-auto scrollbar-thin">
            {entries.map(e => (
              <div key={e.id} className="flex justify-between text-[10px]">
                <span className="text-muted-foreground">{e.name}</span>
                <span className={`font-mono ${e.type === 'income' ? 'text-success' : 'text-destructive'}`}>{e.type === 'income' ? '+' : '-'}${e.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {showAdd ? (
        <div className="mt-3 space-y-1.5">
          <div className="flex gap-1">
            <select value={newEntry.type} onChange={e => setNewEntry({ ...newEntry, type: e.target.value as FinanceEntry['type'] })} className="bg-input text-foreground text-[10px] rounded px-1 py-0.5 border border-border outline-none">
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <input value={newEntry.name} onChange={e => setNewEntry({ ...newEntry, name: e.target.value })} placeholder="Name..." className="flex-1 bg-input text-foreground text-[10px] px-2 py-0.5 rounded border border-border outline-none" autoFocus />
            <input type="number" value={newEntry.amount} onChange={e => setNewEntry({ ...newEntry, amount: e.target.value })} onKeyDown={e => e.key === 'Enter' && addEntry()} placeholder="$" className="w-16 bg-input text-foreground text-[10px] px-2 py-0.5 rounded border border-border outline-none font-mono" />
          </div>
          <div className="flex gap-1">
            <button onClick={addEntry} className="text-[10px] text-primary hover:opacity-80">Add</button>
            <button onClick={() => setShowAdd(false)} className="text-[10px] text-muted-foreground">✕</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)} className="mt-3 w-full py-1.5 bg-secondary text-muted-foreground text-xs rounded-md hover:text-primary transition-colors">+ New</button>
      )}
    </div>
  );
}

export default function BottomWidgets() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <HabitTracker />
      <MealPlanner />
      <ShoppingList />
      <Finance />
    </div>
  );
}
