export interface Task {
  id: string;
  name: string;
  category: 'Work' | 'Life' | 'Health' | 'Personal' | 'Home';
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  completed: boolean;
}

export interface HabitDay {
  day: string;
  habits: { name: string; done: boolean }[];
}

export interface Goal {
  id: string;
  name: string;
  done: boolean;
}

export interface Meal {
  id: string;
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  day: string;
  name: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  checked: boolean;
}

export interface FinanceEntry {
  id: string;
  type: 'income' | 'expense';
  name: string;
  amount: number;
}

const TASKS_KEY = 'life-planner-tasks';
const GOALS_KEY = 'life-planner-goals';
const HABITS_KEY = 'life-planner-habits';
const MEALS_KEY = 'life-planner-meals';
const SHOPPING_KEY = 'life-planner-shopping';
const FINANCE_KEY = 'life-planner-finance';

const defaultTasks: Task[] = [
  { id: '1', name: 'Write blog post', category: 'Work', priority: 'High', dueDate: '2024-01-26', completed: false },
  { id: '2', name: 'Write blog post', category: 'Work', priority: 'High', dueDate: '2024-01-27', completed: false },
  { id: '3', name: 'Meet Carl', category: 'Life', priority: 'Medium', dueDate: '2024-01-27', completed: false },
  { id: '4', name: 'Edit Photo', category: 'Work', priority: 'Medium', dueDate: '2024-01-28', completed: false },
  { id: '5', name: 'Write blog post', category: 'Work', priority: 'High', dueDate: '2024-01-28', completed: false },
  { id: '6', name: 'Edit Website', category: 'Work', priority: 'Medium', dueDate: '2024-02-12', completed: false },
  { id: '7', name: 'Create Social Content', category: 'Life', priority: 'Low', dueDate: '2024-02-13', completed: false },
  { id: '8', name: 'Run', category: 'Health', priority: 'Medium', dueDate: '2024-02-14', completed: false },
  { id: '9', name: 'Edit Website', category: 'Work', priority: 'High', dueDate: '2024-02-19', completed: false },
  { id: '10', name: 'Write copy', category: 'Work', priority: 'High', dueDate: '2024-02-19', completed: false },
];

const defaultGoals: Goal[] = [
  { id: '1', name: 'Read 12 books this year', done: false },
  { id: '2', name: 'Run a half marathon', done: false },
  { id: '3', name: 'Learn a new language', done: false },
  { id: '4', name: 'Save $5000', done: true },
];

const defaultHabits: HabitDay = {
  day: 'Monday',
  habits: [
    { name: 'Workout', done: false },
    { name: 'Meditate', done: false },
    { name: 'Read', done: false },
    { name: 'Run', done: false },
    { name: 'Cold Shower', done: false },
  ],
};

const defaultMeals: Meal[] = [
  { id: '1', type: 'Dinner', day: 'Monday', name: '🍲 Chicken Noodle Soup' },
  { id: '2', type: 'Lunch', day: 'Monday', name: '🍕 Brick-Oven Pizza (Brooklyn Style)' },
  { id: '3', type: 'Breakfast', day: 'Monday', name: '🍕 Brick-Oven Pizza (Brooklyn Style)' },
];

const defaultShopping: ShoppingItem[] = [
  { id: '1', name: '6 leaves fresh basil, torn', checked: false },
  { id: '2', name: '3 cups bread flour', checked: false },
  { id: '3', name: '1 tablespoon extra-virgin olive oil', checked: false },
  { id: '4', name: '2 tablespoons extra-virgin olive oil', checked: false },
  { id: '5', name: 'Onion', checked: false },
  { id: '6', name: '1 cup cold water', checked: false },
];

const defaultFinance: FinanceEntry[] = [];

function getOrInit<T>(key: string, defaults: T): T {
  const stored = localStorage.getItem(key);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(key, JSON.stringify(defaults));
  return defaults;
}

function save<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function getTasks(): Task[] { return getOrInit(TASKS_KEY, defaultTasks); }
export function saveTasks(tasks: Task[]) { save(TASKS_KEY, tasks); }

export function getGoals(): Goal[] { return getOrInit(GOALS_KEY, defaultGoals); }
export function saveGoals(goals: Goal[]) { save(GOALS_KEY, goals); }

export function getHabits(): HabitDay { return getOrInit(HABITS_KEY, defaultHabits); }
export function saveHabits(habits: HabitDay) { save(HABITS_KEY, habits); }

export function getMeals(): Meal[] { return getOrInit(MEALS_KEY, defaultMeals); }
export function saveMeals(meals: Meal[]) { save(MEALS_KEY, meals); }

export function getShopping(): ShoppingItem[] { return getOrInit(SHOPPING_KEY, defaultShopping); }
export function saveShopping(items: ShoppingItem[]) { save(SHOPPING_KEY, items); }

export function getFinance(): FinanceEntry[] { return getOrInit(FINANCE_KEY, defaultFinance); }
export function saveFinance(entries: FinanceEntry[]) { save(FINANCE_KEY, entries); }
