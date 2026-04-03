import { useState } from 'react';
import { useHabitContext } from '@/contexts/HabitContext';
import { useMealContext, type MealType } from '@/contexts/MealContext';
import { useShopping, useFinance, type FinanceEntry } from '@/hooks/useSupabaseData';
import { ShoppingBasket, Soup, WalletCards } from 'lucide-react';

const mealBadgeColors: Record<MealType, string> = {
  Breakfast: 'bg-warning/20 text-warning',
  Lunch: 'bg-success/20 text-success',
  Dinner: 'bg-primary/20 text-primary',
  Snack: 'bg-muted text-muted-foreground',
};

export function SidebarHabitWidget() {
  const { habits, toggleHabit, addHabit } = useHabitContext();
  const [showAdd, setShowAdd] = useState(false);
  const [newHabit, setNewHabit] = useState('');

  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const weekdayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const todaysHabits = habits.filter((habit) => habit.day === todayName);
  const done = todaysHabits.filter((habit) => habit.done).length;
  const pct = todaysHabits.length > 0 ? Math.round((done / todaysHabits.length) * 100) : 0;

  const weeklyHabitGroups = weekdayOrder.map((day) => {
    const dayHabits = habits.filter((habit) => habit.day === day);
    const completed = dayHabits.filter((habit) => habit.done).length;
    return {
      day,
      total: dayHabits.length,
      percent: dayHabits.length > 0 ? Math.round((completed / dayHabits.length) * 100) : 0,
    };
  });

  const handleAddHabit = () => {
    if (!newHabit.trim()) return;
    addHabit({ day: todayName, habitName: newHabit.trim() });
    setNewHabit('');
    setShowAdd(false);
  };

  return (
    <section className="group rounded-2xl border border-border/70 bg-gradient-to-br from-background via-background to-secondary/30 p-4 shadow-[0_12px_40px_rgba(10,10,10,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_20px_50px_rgba(10,10,10,0.12)]">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Habit Tracker</h3>
          <p className="text-[11px] text-muted-foreground">{todayName}</p>
        </div>
        <span className="rounded-full border border-border bg-background/70 px-2 py-1 text-[10px] font-medium text-muted-foreground">
          {done}/{todaysHabits.length || 0}
        </span>
      </div>

      <div className="mb-4">
        <div className="h-2 rounded-full bg-secondary/90">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-primary via-primary to-warning transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-1 text-[11px] font-mono text-muted-foreground">{pct}% complete</div>
      </div>

      <div className="space-y-2">
        {todaysHabits.length > 0 ? todaysHabits.map((habit) => (
          <label key={habit.id} className="flex cursor-pointer items-center gap-2 rounded-xl border border-border/60 bg-background/55 px-3 py-2 text-xs transition-all duration-200 hover:border-primary/25 hover:bg-secondary/40 active:scale-[0.99]">
            <input
              type="checkbox"
              checked={habit.done}
              onChange={() => toggleHabit(habit.id)}
              className="h-3.5 w-3.5 rounded accent-primary"
            />
            <span className={habit.done ? 'text-muted-foreground line-through' : 'text-foreground'}>
              {habit.habitName}
            </span>
          </label>
        )) : (
          <p className="rounded-xl border border-dashed border-border/70 px-3 py-3 text-xs text-muted-foreground">
            No habits planned for today yet.
          </p>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Weekly streak</span>
          <span className="text-[10px] text-muted-foreground">7-day view</span>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weeklyHabitGroups.map((group) => (
            <div key={group.day} className="space-y-1 text-center">
              <div className="text-[9px] text-muted-foreground">{group.day.slice(0, 1)}</div>
              <div className="flex h-10 items-end rounded-lg bg-secondary/70 p-1">
                <div
                  className="w-full rounded-md bg-primary/85 transition-all duration-500"
                  style={{ height: `${Math.max(group.percent, group.total > 0 ? 12 : 6)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAdd ? (
        <div className="mt-4 flex gap-2">
          <input
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()}
            placeholder="Habit name..."
            className="flex-1 rounded-xl border border-border bg-input px-3 py-2 text-xs text-foreground outline-none transition-colors focus:border-primary/35"
            autoFocus
          />
          <button onClick={handleAddHabit} className="rounded-xl bg-primary px-3 py-2 text-xs text-primary-foreground transition-transform duration-150 hover:opacity-90 active:scale-95">Add</button>
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)} className="mt-4 w-full rounded-xl border border-border/70 bg-secondary/50 px-3 py-2 text-xs text-muted-foreground transition-all duration-200 hover:border-primary/25 hover:text-primary active:scale-[0.99]">
          + Add Today&apos;s Habit
        </button>
      )}
    </section>
  );
}

function MealPlanner() {
  const { meals } = useMealContext();
  const todayKey = new Date().toISOString().slice(0, 10);
  const todaysMeals = meals.filter((meal) => meal.scheduledDate === todayKey).slice(0, 4);
  const calorieTotal = todaysMeals.reduce((sum, meal) => sum + (meal.calories ?? 0), 0);

  return (
    <section className="group rounded-2xl border border-border/70 bg-gradient-to-br from-background via-background to-warning/5 p-4 shadow-[0_12px_40px_rgba(10,10,10,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-warning/25 hover:shadow-[0_20px_50px_rgba(10,10,10,0.12)]">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Meal Planner</h3>
          <p className="text-[11px] text-muted-foreground">Today&apos;s meals</p>
        </div>
        <span className="rounded-full border border-border bg-background/70 px-2 py-1 text-[10px] font-medium text-muted-foreground">
          {calorieTotal} cal
        </span>
      </div>

      <div className="space-y-2">
        {todaysMeals.length > 0 ? todaysMeals.map((meal) => (
          <div key={meal.id} className="rounded-xl border border-border/60 bg-background/55 px-3 py-2 transition-all duration-200 hover:border-warning/25 hover:bg-secondary/40">
            <div className="flex items-center justify-between gap-2">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${mealBadgeColors[meal.type]}`}>{meal.type}</span>
              <span className="text-[10px] text-muted-foreground">{meal.mealTime || meal.status}</span>
            </div>
            <div className="mt-1 text-xs font-medium text-foreground">{meal.name}</div>
            <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
              {meal.protein ? <span>{meal.protein}g protein</span> : null}
              {meal.waterMl ? <span>{meal.waterMl}ml water</span> : null}
            </div>
          </div>
        )) : (
          <div className="rounded-xl border border-dashed border-border/70 px-3 py-4 text-center">
            <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-secondary/35 text-warning">
              <Soup size={16} />
            </div>
            <p className="text-xs font-medium text-foreground">No meals planned</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Use the meal planner tab to prep today&apos;s menu.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function ShoppingList() {
  const { items, toggle, add, remove } = useShopping();
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState('');
  const remaining = items.filter((item) => !item.checked);

  const addItem = () => {
    if (!newItem.trim()) return;
    add({ name: newItem.trim() });
    setNewItem('');
    setShowAdd(false);
  };

  return (
    <section className="group rounded-2xl border border-border/70 bg-gradient-to-br from-background via-background to-success/5 p-4 shadow-[0_12px_40px_rgba(10,10,10,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-success/25 hover:shadow-[0_20px_50px_rgba(10,10,10,0.12)]">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Shopping List</h3>
          <p className="text-[11px] text-muted-foreground">{remaining.length} left to grab</p>
        </div>
      </div>

      <div className="space-y-2">
        {items.slice(0, 5).map((item) => (
          <div key={item.id} className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/55 px-3 py-2 text-xs transition-all duration-200 hover:border-success/25 hover:bg-secondary/40">
            <input type="checkbox" checked={item.checked} onChange={() => toggle(item.id)} className="h-3.5 w-3.5 cursor-pointer accent-primary" />
            <span className={`flex-1 truncate ${item.checked ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{item.name}</span>
            <button onClick={() => remove(item.id)} className="text-[10px] text-muted-foreground transition-colors hover:text-destructive active:scale-95">x</button>
          </div>
        ))}
        {items.length === 0 && (
          <div className="rounded-xl border border-dashed border-border/70 px-3 py-4 text-center">
            <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-secondary/35 text-success">
              <ShoppingBasket size={16} />
            </div>
            <p className="text-xs font-medium text-foreground">Shopping list is clear</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Add a few ingredients or errands to stay stocked.</p>
          </div>
        )}
      </div>

      {showAdd ? (
        <div className="mt-4 flex gap-2">
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
            placeholder="Add item..."
            className="flex-1 rounded-xl border border-border bg-input px-3 py-2 text-xs text-foreground outline-none transition-colors focus:border-success/35"
            autoFocus
          />
          <button onClick={addItem} className="rounded-xl bg-success px-3 py-2 text-xs text-success-foreground transition-transform duration-150 hover:opacity-90 active:scale-95">Add</button>
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)} className="mt-4 w-full rounded-xl border border-border/70 bg-secondary/50 px-3 py-2 text-xs text-muted-foreground transition-all duration-200 hover:border-success/25 hover:text-success active:scale-[0.99]">
          + Add Item
        </button>
      )}
    </section>
  );
}

function Finance() {
  const { items: entries, add } = useFinance();
  const [showAdd, setShowAdd] = useState(false);
  const [newEntry, setNewEntry] = useState({ type: 'income' as FinanceEntry['type'], name: '', amount: '' });

  const totalIncome = entries.filter((entry) => entry.type === 'income').reduce((sum, entry) => sum + entry.amount, 0);
  const totalExpenses = entries.filter((entry) => entry.type === 'expense').reduce((sum, entry) => sum + entry.amount, 0);
  const balance = totalIncome - totalExpenses;

  const addEntry = () => {
    if (!newEntry.name.trim() || !newEntry.amount) return;
    add({ type: newEntry.type, name: newEntry.name.trim(), amount: parseFloat(newEntry.amount) });
    setNewEntry({ type: 'income', name: '', amount: '' });
    setShowAdd(false);
  };

  return (
    <section className="group rounded-2xl border border-border/70 bg-gradient-to-br from-background via-background to-primary/5 p-4 shadow-[0_12px_40px_rgba(10,10,10,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_20px_50px_rgba(10,10,10,0.12)]">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Finance</h3>
          <p className="text-[11px] text-muted-foreground">This month snapshot</p>
        </div>
        <span className={`rounded-full px-2 py-1 text-[10px] font-medium ${balance >= 0 ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'}`}>
          ${balance.toFixed(0)}
        </span>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between rounded-xl border border-border/60 bg-background/55 px-3 py-2">
          <span className="text-muted-foreground">Income</span>
          <span className="font-mono text-success">${totalIncome.toFixed(2)}</span>
        </div>
        <div className="flex justify-between rounded-xl border border-border/60 bg-background/55 px-3 py-2">
          <span className="text-muted-foreground">Expenses</span>
          <span className="font-mono text-destructive">${totalExpenses.toFixed(2)}</span>
        </div>
      </div>
      {entries.length === 0 && !showAdd && (
        <div className="mt-4 rounded-xl border border-dashed border-border/70 px-3 py-4 text-center">
          <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-secondary/35 text-primary">
            <WalletCards size={16} />
          </div>
          <p className="text-xs font-medium text-foreground">No finance entries yet</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Track one income or expense to start your monthly snapshot.</p>
        </div>
      )}

      {showAdd ? (
        <div className="mt-4 space-y-2">
          <div className="flex gap-2">
            <select value={newEntry.type} onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value as FinanceEntry['type'] })} className="rounded-xl border border-border bg-input px-2 py-2 text-[11px] text-foreground outline-none">
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <input value={newEntry.name} onChange={(e) => setNewEntry({ ...newEntry, name: e.target.value })} placeholder="Name..." className="flex-1 rounded-xl border border-border bg-input px-3 py-2 text-xs text-foreground outline-none" />
          </div>
          <div className="flex gap-2">
            <input type="number" value={newEntry.amount} onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && addEntry()} placeholder="Amount" className="flex-1 rounded-xl border border-border bg-input px-3 py-2 text-xs text-foreground outline-none" />
            <button onClick={addEntry} className="rounded-xl bg-primary px-3 py-2 text-xs text-primary-foreground transition-transform duration-150 hover:opacity-90 active:scale-95">Add</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)} className="mt-4 w-full rounded-xl border border-border/70 bg-secondary/50 px-3 py-2 text-xs text-muted-foreground transition-all duration-200 hover:border-primary/25 hover:text-primary active:scale-[0.99]">
          + Quick Entry
        </button>
      )}
    </section>
  );
}

export default function BottomWidgets() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <MealPlanner />
      <ShoppingList />
      <Finance />
    </div>
  );
}
