import { KeyboardEvent, useState } from 'react';
import { endOfWeek, format, isBefore, isSameDay, isThisWeek, isToday, isYesterday, startOfToday, startOfWeek } from 'date-fns';
import { useTaskContext, type Task } from '@/contexts/TaskContext';
import { useMealContext, type Meal, type MealDraft, type MealStatus, type MealType } from '@/contexts/MealContext';
import { useHabitContext } from '@/contexts/HabitContext';
import { useWorkoutContext, type Workout, type WorkoutDraft, type WorkoutExercise, type WorkoutIntensity, type WorkoutType } from '@/contexts/WorkoutContext';
import { Plus, Trash2, Pencil, X, Check, ClipboardList, Dumbbell, NotebookText, Salad, Sparkles, Target } from 'lucide-react';
import { useJournalContext } from "@/contexts/JournalContext";


const categoryColors: Record<string, string> = {
  Work: 'bg-muted text-muted-foreground',
  Life: 'bg-crimson-maroon/30 text-primary',
  Health: 'bg-success/20 text-success',
  Personal: 'bg-warning/20 text-warning',
  Home: 'bg-muted text-muted-foreground',
};

const priorityColors: Record<string, string> = {
  High: 'bg-primary/20 text-primary crimson-glow-sm',
  Medium: 'bg-crimson-maroon/30 text-muted-foreground',
  Low: 'bg-muted text-muted-foreground',
};

const mealTypeColors: Record<string, string> = {
  Breakfast: 'bg-warning/20 text-warning',
  Lunch: 'bg-success/20 text-success',
  Dinner: 'bg-primary/20 text-primary',
  Snack: 'bg-muted text-muted-foreground',
};

const mealStatusColors: Record<MealStatus, string> = {
  planned: 'bg-secondary/40 text-muted-foreground',
  prepared: 'bg-warning/20 text-warning',
  eaten: 'bg-success/15 text-success',
};

const mealTypeOptions: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const mealStatusOptions: MealStatus[] = ['planned', 'prepared', 'eaten'];

const workoutTypeColors: Record<WorkoutType, string> = {
  Strength: 'bg-primary/15 text-primary',
  Cardio: 'bg-warning/20 text-warning',
  Mobility: 'bg-success/20 text-success',
  Recovery: 'bg-muted text-muted-foreground',
  Push: 'bg-crimson-maroon/30 text-primary',
  Pull: 'bg-primary/10 text-foreground',
  Legs: 'bg-success/15 text-success',
};

const workoutIntensityColors: Record<WorkoutIntensity, string> = {
  Low: 'bg-success/15 text-success',
  Moderate: 'bg-warning/20 text-warning',
  High: 'bg-primary/20 text-primary',
};

const workoutTypeOptions: WorkoutType[] = ['Strength', 'Cardio', 'Mobility', 'Recovery', 'Push', 'Pull', 'Legs'];
const workoutIntensityOptions: WorkoutIntensity[] = ['Low', 'Moderate', 'High'];

const journalMoodOptions = [
  { label: 'Calm', emoji: '😌' },
  { label: 'Happy', emoji: '😊' },
  { label: 'Focused', emoji: '🧠' },
  { label: 'Tired', emoji: '😴' },
  { label: 'Stressed', emoji: '😵' },
  { label: 'Grateful', emoji: '🙏' },
];

const tabs = ['Todo', 'Journal', 'Habits', 'Workout', 'Meal'];

const createEmptyExercise = (): WorkoutExercise => ({
  id: crypto.randomUUID(),
  name: '',
  sets: '',
  reps: '',
  weight: '',
  time: '',
  distance: '',
  notes: '',
});

const createEmptyWorkoutDraft = (): WorkoutDraft => ({
  scheduledDate: format(new Date(), 'yyyy-MM-dd'),
  workoutName: '',
  duration: '',
  workoutType: 'Strength',
  intensity: 'Moderate',
  calories: '',
  notes: '',
  location: '',
  equipment: '',
  tags: [],
  exercises: [createEmptyExercise()],
});

const createEmptyMealDraft = (): MealDraft => ({
  name: '',
  type: 'Breakfast',
  scheduledDate: format(new Date(), 'yyyy-MM-dd'),
  status: 'planned',
  calories: '',
  protein: '',
  carbs: '',
  fats: '',
  notes: '',
  tags: [],
  mealTime: '',
  waterMl: '',
  prepAhead: false,
  ingredients: [],
});

function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: typeof Sparkles;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border/80 bg-gradient-to-br from-background/70 via-secondary/20 to-background/70 p-6 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-border/70 bg-secondary/50 text-primary">
        <Icon size={20} strokeWidth={1.8} />
      </div>
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-muted-foreground">{description}</p>
      <button
        onClick={onAction}
        className="interactive-button mt-4 rounded-xl border border-primary/25 bg-primary/12 px-4 py-2 text-xs font-medium text-primary"
      >
        {actionLabel}
      </button>
    </div>
  );
}

export default function TaskManager() {
  const { tasks, loading, toggleTask, removeTask, addTask, editTask } = useTaskContext();
  const {
    meals,
    loading: mealsLoading,
    addMeal,
    removeMeal,
    editMeal,
    updateMealStatus,
    templates: mealTemplates,
    addMealTemplate,
    removeMealTemplate,
  } = useMealContext();
  const {
    habits,
    loading: habitsLoading,
    addHabit,
    toggleHabit,
    removeHabit,
    editHabit,
  } = useHabitContext();
  const {
    workouts,
    loading: workoutsLoading,
    addWorkout,
    toggleWorkout,
    removeWorkout,
    editWorkout,
    templates,
    addWorkoutTemplate,
    removeWorkoutTemplate,
  } = useWorkoutContext();
  const { entries, loading: journalLoading, addEntry, editEntry, deleteEntry } = useJournalContext();

  const [activeTab, setActiveTab] = useState('Todo');

  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({
    name: '',
    category: 'Work' as Task['category'],
    priority: 'Medium' as Task['priority'],
    dueDate: '',
  });

  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [mealDraft, setMealDraft] = useState<MealDraft>(createEmptyMealDraft);
  const [mealFilter, setMealFilter] = useState<'All' | 'Today' | 'This Week' | 'Planned' | 'Prepared' | 'Eaten'>('All');
  const [mealTypeFilter, setMealTypeFilter] = useState<'All' | MealType>('All');
  const [mealTagInput, setMealTagInput] = useState('');
  const [mealIngredientInput, setMealIngredientInput] = useState('');
  const [selectedMealTemplateId, setSelectedMealTemplateId] = useState('');

  const [editingHabit, setEditingHabit] = useState<string | null>(null);
  const [editHabitName, setEditHabitName] = useState('');
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabit, setNewHabit] = useState({
    habitName: '',
    day: '',
  });

  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);
  const [workoutDraft, setWorkoutDraft] = useState<WorkoutDraft>(createEmptyWorkoutDraft);
  const [workoutFilter, setWorkoutFilter] = useState<'All' | 'Today' | 'This Week' | 'Completed' | 'Missed'>('All');
  const [workoutTypeFilter, setWorkoutTypeFilter] = useState<'All' | WorkoutType>('All');
  const [workoutTagInput, setWorkoutTagInput] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [journalContent, setJournalContent] = useState('');
  const [journalMood, setJournalMood] = useState<string | null>(null);
  const [editingJournalId, setEditingJournalId] = useState<string | null>(null);

  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [showAll, setShowAll] = useState(false);

  const startEdit = (t: Task) => {
    setEditing(t.id);
    setEditName(t.name);
  };

  const saveEdit = (id: string) => {
    editTask(id, editName);
    setEditing(null);
  };

  const handleAdd = () => {
    if (!newTask.name || !newTask.dueDate) return;
    addTask(newTask);
    setNewTask({
      name: '',
      category: 'Work',
      priority: 'Medium',
      dueDate: '',
    });
    setShowAdd(false);
  };

  const resetMealDraft = () => {
    setMealDraft(createEmptyMealDraft());
    setEditingMealId(null);
    setMealTagInput('');
    setMealIngredientInput('');
    setSelectedMealTemplateId('');
  };

  const updateMealDraft = <K extends keyof MealDraft>(key: K, value: MealDraft[K]) => {
    setMealDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddMealTag = () => {
    const normalizedTag = mealTagInput.trim();
    if (!normalizedTag || mealDraft.tags.includes(normalizedTag)) return;
    updateMealDraft('tags', [...mealDraft.tags, normalizedTag]);
    setMealTagInput('');
  };

  const removeMealTag = (tag: string) => {
    updateMealDraft('tags', mealDraft.tags.filter((item) => item !== tag));
  };

  const handleAddIngredient = () => {
    const ingredient = mealIngredientInput.trim();
    if (!ingredient || mealDraft.ingredients.includes(ingredient)) return;
    updateMealDraft('ingredients', [...mealDraft.ingredients, ingredient]);
    setMealIngredientInput('');
  };

  const removeIngredient = (ingredient: string) => {
    updateMealDraft('ingredients', mealDraft.ingredients.filter((item) => item !== ingredient));
  };

  const startMealEdit = (meal: Meal) => {
    setEditingMealId(meal.id);
    setMealDraft({
      name: meal.name,
      type: meal.type,
      scheduledDate: meal.scheduledDate,
      status: meal.status,
      calories: meal.calories?.toString() ?? '',
      protein: meal.protein?.toString() ?? '',
      carbs: meal.carbs?.toString() ?? '',
      fats: meal.fats?.toString() ?? '',
      notes: meal.notes,
      tags: meal.tags,
      mealTime: meal.mealTime,
      waterMl: meal.waterMl?.toString() ?? '',
      prepAhead: meal.prepAhead,
      ingredients: meal.ingredients,
    });
  };

  const applyMealTemplate = (templateId: string) => {
    setSelectedMealTemplateId(templateId);
    const template = mealTemplates.find((item) => item.id === templateId);
    if (!template) return;

    setMealDraft((prev) => ({
      ...prev,
      name: template.name,
      type: template.type,
      calories: template.calories?.toString() ?? '',
      protein: template.protein?.toString() ?? '',
      carbs: template.carbs?.toString() ?? '',
      fats: template.fats?.toString() ?? '',
      notes: template.notes,
      tags: template.tags,
      mealTime: template.mealTime,
      waterMl: template.waterMl?.toString() ?? '',
      prepAhead: template.prepAhead,
      ingredients: template.ingredients,
    }));
  };

  const handleSaveMeal = async () => {
    if (!mealDraft.name.trim() || !mealDraft.scheduledDate) return;

    const cleanedDraft: MealDraft = {
      ...mealDraft,
      name: mealDraft.name.trim(),
      notes: mealDraft.notes.trim(),
      mealTime: mealDraft.mealTime.trim(),
    };

    if (editingMealId) {
      await editMeal(editingMealId, cleanedDraft);
    } else {
      await addMeal(cleanedDraft);
    }

    resetMealDraft();
  };

  const handleSaveMealTemplate = async () => {
    if (!mealDraft.name.trim()) return;

    await addMealTemplate({
      name: mealDraft.name.trim(),
      type: mealDraft.type,
      calories: mealDraft.calories.trim() ? Number(mealDraft.calories) : null,
      protein: mealDraft.protein.trim() ? Number(mealDraft.protein) : null,
      carbs: mealDraft.carbs.trim() ? Number(mealDraft.carbs) : null,
      fats: mealDraft.fats.trim() ? Number(mealDraft.fats) : null,
      notes: mealDraft.notes.trim(),
      tags: mealDraft.tags,
      mealTime: mealDraft.mealTime.trim(),
      waterMl: mealDraft.waterMl.trim() ? Number(mealDraft.waterMl) : null,
      prepAhead: mealDraft.prepAhead,
      ingredients: mealDraft.ingredients,
    });
  };

  const startHabitEdit = (habit: { id: string; habitName: string }) => {
    setEditingHabit(habit.id);
    setEditHabitName(habit.habitName);
  };

  const saveHabitEdit = (id: string) => {
    editHabit(id, editHabitName);
    setEditingHabit(null);
  };

  const handleAddHabit = () => {
    if (!newHabit.habitName || !newHabit.day) return;
    addHabit(newHabit);
    setNewHabit({
      habitName: '',
      day: '',
    });
    setShowAddHabit(false);
  };

  const resetWorkoutDraft = () => {
    setWorkoutDraft(createEmptyWorkoutDraft());
    setEditingWorkoutId(null);
    setWorkoutTagInput('');
    setSelectedTemplateId('');
  };

  const updateWorkoutDraft = <K extends keyof WorkoutDraft>(key: K, value: WorkoutDraft[K]) => {
    setWorkoutDraft((prev) => ({ ...prev, [key]: value }));
  };

  const updateWorkoutExercise = (exerciseId: string, key: keyof WorkoutExercise, value: string) => {
    setWorkoutDraft((prev) => ({
      ...prev,
      exercises: prev.exercises.map((exercise) =>
        exercise.id === exerciseId ? { ...exercise, [key]: value } : exercise
      ),
    }));
  };

  const addWorkoutExercise = () => {
    setWorkoutDraft((prev) => ({
      ...prev,
      exercises: [...prev.exercises, createEmptyExercise()],
    }));
  };

  const removeWorkoutExercise = (exerciseId: string) => {
    setWorkoutDraft((prev) => ({
      ...prev,
      exercises: prev.exercises.length === 1
        ? [createEmptyExercise()]
        : prev.exercises.filter((exercise) => exercise.id !== exerciseId),
    }));
  };

  const handleAddWorkoutTag = () => {
    const normalizedTag = workoutTagInput.trim();
    if (!normalizedTag || workoutDraft.tags.includes(normalizedTag)) return;

    updateWorkoutDraft('tags', [...workoutDraft.tags, normalizedTag]);
    setWorkoutTagInput('');
  };

  const removeWorkoutTag = (tag: string) => {
    updateWorkoutDraft('tags', workoutDraft.tags.filter((item) => item !== tag));
  };

  const startWorkoutEdit = (workout: Workout) => {
    setEditingWorkoutId(workout.id);
    setWorkoutDraft({
      scheduledDate: workout.scheduledDate,
      workoutName: workout.workoutName,
      duration: workout.duration,
      workoutType: workout.workoutType,
      intensity: workout.intensity,
      calories: workout.calories?.toString() ?? '',
      notes: workout.notes,
      location: workout.location,
      equipment: workout.equipment,
      tags: workout.tags,
      exercises: workout.exercises.length > 0 ? workout.exercises : [createEmptyExercise()],
    });
  };

  const applyWorkoutTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = templates.find((item) => item.id === templateId);
    if (!template) return;

    setWorkoutDraft((prev) => ({
      ...prev,
      workoutName: template.name,
      duration: template.duration,
      workoutType: template.workoutType,
      intensity: template.intensity,
      calories: template.calories?.toString() ?? '',
      notes: template.notes,
      location: template.location,
      equipment: template.equipment,
      tags: template.tags,
      exercises: template.exercises.length > 0 ? template.exercises.map((exercise) => ({ ...exercise, id: crypto.randomUUID() })) : [createEmptyExercise()],
    }));
  };

  const handleSaveWorkout = async () => {
    if (!workoutDraft.workoutName.trim() || !workoutDraft.scheduledDate || !workoutDraft.duration.trim()) return;

    const cleanedDraft: WorkoutDraft = {
      ...workoutDraft,
      workoutName: workoutDraft.workoutName.trim(),
      duration: workoutDraft.duration.trim(),
      notes: workoutDraft.notes.trim(),
      location: workoutDraft.location.trim(),
      equipment: workoutDraft.equipment.trim(),
      exercises: workoutDraft.exercises.filter((exercise) =>
        exercise.name.trim() || exercise.sets.trim() || exercise.reps.trim() || exercise.weight.trim() || exercise.time.trim() || exercise.distance.trim() || exercise.notes.trim()
      ),
    };

    if (editingWorkoutId) {
      await editWorkout(editingWorkoutId, cleanedDraft);
    } else {
      await addWorkout(cleanedDraft);
    }

    resetWorkoutDraft();
  };

  const handleSaveWorkoutTemplate = async () => {
    if (!workoutDraft.workoutName.trim()) return;

    await addWorkoutTemplate({
      name: workoutDraft.workoutName.trim(),
      workoutType: workoutDraft.workoutType,
      intensity: workoutDraft.intensity,
      duration: workoutDraft.duration.trim(),
      calories: workoutDraft.calories.trim() ? Number(workoutDraft.calories) : null,
      notes: workoutDraft.notes.trim(),
      location: workoutDraft.location.trim(),
      equipment: workoutDraft.equipment.trim(),
      tags: workoutDraft.tags,
      exercises: workoutDraft.exercises.filter((exercise) =>
        exercise.name.trim() || exercise.sets.trim() || exercise.reps.trim() || exercise.weight.trim() || exercise.time.trim() || exercise.distance.trim() || exercise.notes.trim()
      ),
    });
  };

  const resetJournalComposer = () => {
    setJournalContent('');
    setJournalMood(null);
    setEditingJournalId(null);
  };

  const handleJournalSave = () => {
    const trimmedContent = journalContent.trim();
    if (!trimmedContent) return;

    if (editingJournalId) {
      editEntry(editingJournalId, trimmedContent, journalMood || undefined);
    } else {
      addEntry(trimmedContent, journalMood || undefined);
    }

    resetJournalComposer();
  };

  const handleJournalKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleJournalSave();
    }
  };

  const startJournalEdit = (entry: { id: string; content: string; mood: string | null }) => {
    setEditingJournalId(entry.id);
    setJournalContent(entry.content);
    setJournalMood(entry.mood);
  };

  const formatJournalTimestamp = (createdAt: string) => {
    const date = new Date(createdAt);

    if (isToday(date)) {
      return `Today at ${format(date, 'p')}`;
    }

    if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'p')}`;
    }

    return `${format(date, 'MMM d, yyyy')} at ${format(date, 'p')}`;
  };

  const todoTasks =
    filterPriority === 'All'
      ? tasks
      : tasks.filter((t) => t.priority === filterPriority);

  const displayedTodos = showAll ? todoTasks : todoTasks.slice(0, 8);

  const renderTodoContent = () => {
    if (loading) {
      return <div className="p-6 text-sm text-muted-foreground">Loading tasks...</div>;
    }

    return (
      <>
        {todoTasks.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No tasks yet"
            description="Start with one clear task and this board will turn into your daily control center."
            actionLabel="Create task"
            onAction={() => setShowAdd(true)}
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border/50 bg-gradient-to-br from-background/30 via-secondary/15 to-background/30">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="w-8 p-3 text-left font-medium"></th>
                  <th className="p-3 text-left font-medium">Name</th>
                  <th className="p-3 text-left font-medium">Category</th>
                  <th className="p-3 text-left font-mono font-medium">Due Date</th>
                  <th className="p-3 text-left font-medium">Priority</th>
                  <th className="w-20 p-3 text-right font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {displayedTodos.map((task) => (
                  <tr
                    key={task.id}
                    className="border-b border-border/30 transition-colors hover:bg-secondary/50"
                  >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      className="h-4 w-4 cursor-pointer rounded border-border accent-primary"
                    />
                  </td>

                  <td className="p-3">
                    {editing === task.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit(task.id)}
                          className="rounded border border-border bg-input px-2 py-0.5 text-sm text-foreground outline-none"
                          autoFocus
                        />
                        <button onClick={() => saveEdit(task.id)} className="text-success hover:opacity-80">
                          <Check size={14} />
                        </button>
                        <button onClick={() => setEditing(null)} className="text-muted-foreground hover:opacity-80">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <span className={`text-foreground ${task.completed ? 'line-through opacity-40' : ''}`}>
                        {task.name}
                      </span>
                    )}
                  </td>

                  <td className="p-3">
                    <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${categoryColors[task.category]}`}>
                      {task.category}
                    </span>
                  </td>

                  <td className="p-3 font-mono text-xs text-muted-foreground">
                    {new Date(task.dueDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>

                  <td className="p-3">
                    <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </span>
                  </td>

                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => startEdit(task)}
                        className="p-1 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <Pencil size={13} strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => removeTask(task.id)}
                        className="p-1 text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <Trash2 size={13} strokeWidth={1.5} />
                      </button>
                    </div>
                  </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {todoTasks.length > 8 && (
          <div className="border-t border-border/30 p-3 text-xs text-muted-foreground">
            <button
              onClick={() => setShowAll(!showAll)}
              className="transition-colors hover:text-foreground"
            >
              {showAll ? 'Show less' : `Load more (${todoTasks.length - 8} remaining)`}
            </button>
          </div>
        )}

        {showAdd ? (
          <div className="space-y-2 border-t border-border p-4">
            <div className="flex flex-col gap-2 xl:flex-row">
              <input
                placeholder="Task name"
                value={newTask.name}
                onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                className="flex-1 rounded-md border border-border bg-input px-3 py-1.5 text-sm text-foreground outline-none"
                autoFocus
              />

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 xl:w-[420px]">
                <select
                  value={newTask.category}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      category: e.target.value as Task['category'],
                    })
                  }
                  className="rounded-md border border-border bg-input px-2 py-1 text-xs text-foreground outline-none"
                >
                  {['Work', 'Life', 'Health', 'Personal', 'Home'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <select
                  value={newTask.priority}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      priority: e.target.value as Task['priority'],
                    })
                  }
                  className="rounded-md border border-border bg-input px-2 py-1 text-xs text-foreground outline-none"
                >
                  {['High', 'Medium', 'Low'].map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>

                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="rounded-md border border-border bg-input px-2 py-1 font-mono text-xs text-foreground outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="rounded-md bg-primary px-4 py-1.5 text-xs text-primary-foreground transition-opacity hover:opacity-90"
              >
                Add Task
              </button>
              <button
                onClick={() => setShowAdd(false)}
                className="px-4 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}
      </>
    );
  };

  const renderHabitContent = () => {
    if (habitsLoading) {
      return <div className="p-6 text-sm text-muted-foreground">Loading habits...</div>;
    }

    return (
      <>
        {habits.length === 0 ? (
          <EmptyState
            icon={Target}
            title="No habits yet"
            description="Add one repeating habit and start building a streak you can actually see grow."
            actionLabel="Add habit"
            onAction={() => setShowAddHabit(true)}
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border/50 bg-gradient-to-br from-background/30 via-secondary/15 to-background/30">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="w-8 p-3 text-left font-medium"></th>
                  <th className="p-3 text-left font-medium">Habit</th>
                  <th className="p-3 text-left font-medium">Day</th>
                  <th className="w-20 p-3 text-right font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {habits.map((habit) => (
                  <tr
                    key={habit.id}
                    className="border-b border-border/30 transition-colors hover:bg-secondary/50"
                  >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={habit.done}
                      onChange={() => toggleHabit(habit.id)}
                      className="h-4 w-4 cursor-pointer rounded border-border accent-primary"
                    />
                  </td>

                  <td className="p-3">
                    {editingHabit === habit.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          value={editHabitName}
                          onChange={(e) => setEditHabitName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && saveHabitEdit(habit.id)}
                          className="rounded border border-border bg-input px-2 py-0.5 text-sm text-foreground outline-none"
                          autoFocus
                        />
                        <button onClick={() => saveHabitEdit(habit.id)} className="text-success hover:opacity-80">
                          <Check size={14} />
                        </button>
                        <button onClick={() => setEditingHabit(null)} className="text-muted-foreground hover:opacity-80">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <span className={`text-foreground ${habit.done ? 'line-through opacity-40' : ''}`}>
                        {habit.habitName}
                      </span>
                    )}
                  </td>

                  <td className="p-3 text-xs text-muted-foreground">{habit.day}</td>

                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => startHabitEdit(habit)}
                        className="p-1 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <Pencil size={13} strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => removeHabit(habit.id)}
                        className="p-1 text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <Trash2 size={13} strokeWidth={1.5} />
                      </button>
                    </div>
                  </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="space-y-2 border-t border-border p-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              placeholder="Habit name"
              value={newHabit.habitName}
              onChange={(e) => setNewHabit({ ...newHabit, habitName: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()}
              className="flex-1 rounded-md border border-border bg-input px-3 py-1.5 text-sm text-foreground outline-none"
            />

            <input
              placeholder="Day"
              value={newHabit.day}
              onChange={(e) => setNewHabit({ ...newHabit, day: e.target.value })}
              className="rounded-md border border-border bg-input px-2 py-1 text-xs text-foreground outline-none sm:w-40"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddHabit}
              className="rounded-md bg-primary px-4 py-1.5 text-xs text-primary-foreground transition-opacity hover:opacity-90"
            >
              Add Habit
            </button>
          </div>
        </div>
      </>
    );
  };

  const renderWorkoutContent = () => {
    if (workoutsLoading) {
      return <div className="p-6 text-sm text-muted-foreground">Loading workouts...</div>;
    }

    const today = startOfToday();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

    const filteredWorkouts = workouts.filter((workout) => {
      const workoutDate = new Date(workout.scheduledDate);
      const matchesType = workoutTypeFilter === 'All' || workout.workoutType === workoutTypeFilter;

      if (!matchesType) return false;

      if (workoutFilter === 'Today') {
        return isSameDay(workoutDate, today);
      }

      if (workoutFilter === 'This Week') {
        return isThisWeek(workoutDate, { weekStartsOn: 1 });
      }

      if (workoutFilter === 'Completed') {
        return workout.done;
      }

      if (workoutFilter === 'Missed') {
        return !workout.done && isBefore(workoutDate, today);
      }

      return true;
    });

    const weeklyWorkouts = workouts.filter((workout) => {
      const workoutDate = new Date(workout.scheduledDate);
      return workoutDate >= weekStart && workoutDate <= weekEnd;
    });

    const weeklyCompleted = weeklyWorkouts.filter((workout) => workout.done).length;
    const weeklyMinutes = weeklyWorkouts.reduce((total, workout) => total + (Number.parseInt(workout.duration, 10) || 0), 0);
    const completedSorted = workouts
      .filter((workout) => workout.done)
      .sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate));

    let streak = 0;
    let streakCursor = today;
    for (const workout of completedSorted) {
      const workoutDate = new Date(workout.scheduledDate);
      if (isSameDay(workoutDate, streakCursor)) {
        streak += 1;
        streakCursor = new Date(streakCursor.getFullYear(), streakCursor.getMonth(), streakCursor.getDate() - 1);
      } else if (isBefore(workoutDate, streakCursor)) {
        break;
      }
    }

    const recentHighLoadCount = workouts.filter((workout) => {
      const workoutDate = new Date(workout.scheduledDate);
      return workout.done && workout.intensity === 'High' && workoutDate >= weekStart && workoutDate <= today;
    }).length;

    const restRecommendation = recentHighLoadCount >= 3
      ? 'Recovery recommended tomorrow based on your high-intensity load this week.'
      : 'Training load looks balanced. Keep alternating hard and easy sessions.';

    return (
      <div className="space-y-4 p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-border bg-secondary/20 p-3">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">This Week</div>
            <div className="mt-1 text-2xl font-semibold text-foreground">{weeklyCompleted}/{weeklyWorkouts.length}</div>
            <div className="text-xs text-muted-foreground">workouts completed</div>
          </div>
          <div className="rounded-lg border border-border bg-secondary/20 p-3">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Minutes</div>
            <div className="mt-1 text-2xl font-semibold text-foreground">{weeklyMinutes}</div>
            <div className="text-xs text-muted-foreground">planned this week</div>
          </div>
          <div className="rounded-lg border border-border bg-secondary/20 p-3">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Current Streak</div>
            <div className="mt-1 text-2xl font-semibold text-foreground">{streak}</div>
            <div className="text-xs text-muted-foreground">completed days in a row</div>
          </div>
          <div className="rounded-lg border border-border bg-secondary/20 p-3">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Load Check</div>
            <div className="mt-1 text-sm font-medium text-foreground">{restRecommendation}</div>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-border/70 bg-gradient-to-br from-background/60 via-secondary/15 to-background/70 p-4 md:p-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {editingWorkoutId ? 'Edit Workout' : 'Plan Workout'}
              </h3>
              <p className="text-xs text-muted-foreground">Schedule sessions, log exercises, and save routines as reusable templates.</p>
            </div>

            <div className="flex gap-2">
              <select
                value={selectedTemplateId}
                onChange={(e) => applyWorkoutTemplate(e.target.value)}
                className="rounded-md border border-border bg-input px-2 py-1 text-xs text-foreground outline-none"
              >
                <option value="">Load template</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>{template.name}</option>
                ))}
              </select>

              <button
                onClick={handleSaveWorkoutTemplate}
                className="rounded-md border border-border px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-secondary/60"
              >
                Save Template
              </button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <input
              placeholder="Workout name"
              value={workoutDraft.workoutName}
              onChange={(e) => updateWorkoutDraft('workoutName', e.target.value)}
              className="rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none"
            />
            <input
              type="date"
              value={workoutDraft.scheduledDate}
              onChange={(e) => updateWorkoutDraft('scheduledDate', e.target.value)}
              className="rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none"
            />
            <input
              placeholder="Duration (min)"
              value={workoutDraft.duration}
              onChange={(e) => updateWorkoutDraft('duration', e.target.value)}
              className="rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none"
            />
            <input
              placeholder="Calories (optional)"
              value={workoutDraft.calories}
              onChange={(e) => updateWorkoutDraft('calories', e.target.value)}
              className="rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none"
            />
            <select
              value={workoutDraft.workoutType}
              onChange={(e) => updateWorkoutDraft('workoutType', e.target.value as WorkoutType)}
              className="rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none"
            >
              {workoutTypeOptions.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              value={workoutDraft.intensity}
              onChange={(e) => updateWorkoutDraft('intensity', e.target.value as WorkoutIntensity)}
              className="rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none"
            >
              {workoutIntensityOptions.map((intensity) => (
                <option key={intensity} value={intensity}>{intensity}</option>
              ))}
            </select>
            <input
              placeholder="Location"
              value={workoutDraft.location}
              onChange={(e) => updateWorkoutDraft('location', e.target.value)}
              className="rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none"
            />
            <input
              placeholder="Equipment"
              value={workoutDraft.equipment}
              onChange={(e) => updateWorkoutDraft('equipment', e.target.value)}
              className="rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none"
            />
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                placeholder="Add tags like push, upper-body, gym"
                value={workoutTagInput}
                onChange={(e) => setWorkoutTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddWorkoutTag())}
                className="flex-1 rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none"
              />
              <button
                onClick={handleAddWorkoutTag}
                className="rounded-md border border-border px-3 py-2 text-xs text-foreground transition-colors hover:bg-secondary/60"
              >
                Add Tag
              </button>
            </div>
            {workoutDraft.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {workoutDraft.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => removeWorkoutTag(tag)}
                    className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    #{tag} ×
                  </button>
                ))}
              </div>
            )}
          </div>

          <textarea
            placeholder="Notes, energy level, recovery plan..."
            value={workoutDraft.notes}
            onChange={(e) => updateWorkoutDraft('notes', e.target.value)}
            rows={3}
            className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none"
          />

          <div className="space-y-3 rounded-md border border-border/70 p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Exercises</p>
              <button
                onClick={addWorkoutExercise}
                className="text-xs text-primary transition-colors hover:opacity-80"
              >
                + Add Exercise
              </button>
            </div>

            {workoutDraft.exercises.map((exercise, index) => (
              <div key={exercise.id} className="space-y-2 rounded-md border border-border/60 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Exercise {index + 1}</p>
                  <button
                    onClick={() => removeWorkoutExercise(exercise.id)}
                    className="text-xs text-muted-foreground transition-colors hover:text-destructive"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                  <input
                    placeholder="Name"
                    value={exercise.name}
                    onChange={(e) => updateWorkoutExercise(exercise.id, 'name', e.target.value)}
                    className="rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none"
                  />
                  <input
                    placeholder="Sets"
                    value={exercise.sets}
                    onChange={(e) => updateWorkoutExercise(exercise.id, 'sets', e.target.value)}
                    className="rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none"
                  />
                  <input
                    placeholder="Reps"
                    value={exercise.reps}
                    onChange={(e) => updateWorkoutExercise(exercise.id, 'reps', e.target.value)}
                    className="rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none"
                  />
                  <input
                    placeholder="Weight"
                    value={exercise.weight}
                    onChange={(e) => updateWorkoutExercise(exercise.id, 'weight', e.target.value)}
                    className="rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none"
                  />
                  <input
                    placeholder="Time"
                    value={exercise.time}
                    onChange={(e) => updateWorkoutExercise(exercise.id, 'time', e.target.value)}
                    className="rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none"
                  />
                  <input
                    placeholder="Distance"
                    value={exercise.distance}
                    onChange={(e) => updateWorkoutExercise(exercise.id, 'distance', e.target.value)}
                    className="rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none"
                  />
                </div>
                <input
                  placeholder="Exercise notes"
                  value={exercise.notes}
                  onChange={(e) => updateWorkoutExercise(exercise.id, 'notes', e.target.value)}
                  className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSaveWorkout}
              className="rounded-md bg-primary px-4 py-2 text-xs text-primary-foreground transition-opacity hover:opacity-90"
            >
              {editingWorkoutId ? 'Update Workout' : 'Save Workout'}
            </button>
            <button
              onClick={resetWorkoutDraft}
              className="rounded-md px-4 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {editingWorkoutId ? 'Cancel Edit' : 'Clear Form'}
            </button>
          </div>
        </div>

        {templates.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Templates</h3>
              <span className="text-xs text-muted-foreground">{templates.length} saved routines</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {templates.map((template) => (
                <div key={template.id} className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs">
                  <button onClick={() => applyWorkoutTemplate(template.id)} className="text-foreground transition-colors hover:text-primary">
                    {template.name}
                  </button>
                  <button onClick={() => removeWorkoutTemplate(template.id)} className="text-muted-foreground transition-colors hover:text-destructive">
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

          <div className="flex flex-wrap gap-2">
            {(['All', 'Today', 'This Week', 'Completed', 'Missed'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setWorkoutFilter(filter)}
                className={`interactive-button rounded-full px-3 py-1.5 text-xs transition-all ${workoutFilter === filter
                ? 'border border-primary/25 bg-primary/20 text-primary shadow-[inset_0_1px_0_rgba(255,240,226,0.16),0_0_0_1px_rgba(198,93,46,0.08)]'
                : 'border border-border bg-background/50 text-muted-foreground hover:border-primary/20 hover:text-foreground'
                }`}
              >
                {filter}
              </button>
            ))}

          <select
            value={workoutTypeFilter}
            onChange={(e) => setWorkoutTypeFilter(e.target.value as 'All' | WorkoutType)}
            className="focus-glow interactive-button rounded-full border border-border bg-background/50 px-3 py-1.5 text-xs text-foreground outline-none"
          >
            <option value="All">All types</option>
            {workoutTypeOptions.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          {filteredWorkouts.length === 0 ? (
            <EmptyState
              icon={Dumbbell}
              title="No workouts in this view"
              description="Try another filter or plan a new session to start building your weekly rhythm."
              actionLabel="Plan workout"
              onAction={() => setActiveTab('Workout')}
            />
          ) : filteredWorkouts.map((workout) => (
            <div key={workout.id} className="rounded-lg border border-border p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={workout.done}
                      onChange={() => toggleWorkout(workout.id)}
                      className="h-4 w-4 cursor-pointer rounded border-border accent-primary"
                    />
                    <p className={`text-sm font-semibold ${workout.done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                      {workout.workoutName}
                    </p>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${workoutTypeColors[workout.workoutType]}`}>
                      {workout.workoutType}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${workoutIntensityColors[workout.intensity]}`}>
                      {workout.intensity}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>{format(new Date(workout.scheduledDate), 'EEE, MMM d')}</span>
                    <span>{workout.duration} min</span>
                    {workout.calories ? <span>{workout.calories} cal</span> : null}
                    {workout.location ? <span>{workout.location}</span> : null}
                    {workout.equipment ? <span>{workout.equipment}</span> : null}
                  </div>

                  {workout.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {workout.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {workout.notes && (
                    <p className="text-sm text-muted-foreground">{workout.notes}</p>
                  )}

                  {workout.exercises.length > 0 && (
                    <div className="space-y-2 rounded-md border border-border/60 bg-secondary/10 p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Exercise Log</p>
                      {workout.exercises.map((exercise) => (
                        <div key={exercise.id} className="grid gap-2 text-xs text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
                          <span className="font-medium text-foreground">{exercise.name || 'Unnamed exercise'}</span>
                          <span>{exercise.sets ? `${exercise.sets} sets` : 'No sets logged'}</span>
                          <span>{exercise.reps ? `${exercise.reps} reps` : exercise.time ? exercise.time : 'No reps/time'}</span>
                          <span>{exercise.weight || exercise.distance || exercise.notes || 'No extra data'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className={`rounded-full px-2 py-1 ${workout.done ? 'bg-success/15 text-success' : 'bg-secondary/40 text-muted-foreground'}`}>
                    {workout.done
                      ? isToday(new Date(workout.completedAt ?? workout.scheduledDate))
                        ? `Done today${workout.completedAt ? ` at ${format(new Date(workout.completedAt), 'p')}` : ''}`
                        : `Completed ${format(new Date(workout.completedAt ?? workout.scheduledDate), 'MMM d')}`
                      : 'Planned'}
                  </span>
                  <button
                    onClick={() => startWorkoutEdit(workout)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeWorkout(workout.id)}
                    className="text-muted-foreground transition-colors hover:text-destructive"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMealContent = () => {
    if (mealsLoading) {
      return <div className="p-6 text-sm text-muted-foreground">Loading meals...</div>;
    }

    const today = startOfToday();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

    const filteredMeals = meals.filter((meal) => {
      const mealDate = new Date(meal.scheduledDate);
      const matchesType = mealTypeFilter === 'All' || meal.type === mealTypeFilter;

      if (!matchesType) return false;

      if (mealFilter === 'Today') return isSameDay(mealDate, today);
      if (mealFilter === 'This Week') return mealDate >= weekStart && mealDate <= weekEnd;
      if (mealFilter === 'Planned') return meal.status === 'planned';
      if (mealFilter === 'Prepared') return meal.status === 'prepared';
      if (mealFilter === 'Eaten') return meal.status === 'eaten';
      return true;
    });

    const weeklyMeals = meals.filter((meal) => {
      const mealDate = new Date(meal.scheduledDate);
      return mealDate >= weekStart && mealDate <= weekEnd;
    });

    const weeklyCalories = weeklyMeals.reduce((sum, meal) => sum + (meal.calories ?? 0), 0);
    const weeklyProtein = weeklyMeals.reduce((sum, meal) => sum + (meal.protein ?? 0), 0);
    const weeklyWater = weeklyMeals.reduce((sum, meal) => sum + (meal.waterMl ?? 0), 0);
    const eatenThisWeek = weeklyMeals.filter((meal) => meal.status === 'eaten').length;

    return (
      <div className="space-y-4 p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-border bg-secondary/20 p-3">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">This Week</div>
            <div className="mt-1 text-2xl font-semibold text-foreground">{weeklyMeals.length}</div>
            <div className="text-xs text-muted-foreground">planned meals</div>
          </div>
          <div className="rounded-lg border border-border bg-secondary/20 p-3">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Eaten</div>
            <div className="mt-1 text-2xl font-semibold text-foreground">{eatenThisWeek}</div>
            <div className="text-xs text-muted-foreground">meals logged this week</div>
          </div>
          <div className="rounded-lg border border-border bg-secondary/20 p-3">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Calories</div>
            <div className="mt-1 text-2xl font-semibold text-foreground">{weeklyCalories}</div>
            <div className="text-xs text-muted-foreground">weekly total</div>
          </div>
          <div className="rounded-lg border border-border bg-secondary/20 p-3">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Protein / Water</div>
            <div className="mt-1 text-sm font-medium text-foreground">{weeklyProtein}g protein • {weeklyWater}ml water</div>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-border/70 bg-gradient-to-br from-background/60 via-secondary/15 to-background/70 p-4 md:p-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">{editingMealId ? 'Edit Meal' : 'Plan Meal'}</h3>
              <p className="text-xs text-muted-foreground">Schedule meals, track nutrition, and save go-to dishes as templates.</p>
            </div>

            <div className="flex gap-2">
              <select
                value={selectedMealTemplateId}
                onChange={(e) => applyMealTemplate(e.target.value)}
                className="rounded-md border border-border bg-input px-2 py-1 text-xs text-foreground outline-none"
              >
                <option value="">Load template</option>
                {mealTemplates.map((template) => (
                  <option key={template.id} value={template.id}>{template.name}</option>
                ))}
              </select>
              <button
                onClick={handleSaveMealTemplate}
                className="rounded-md border border-border px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-secondary/60"
              >
                Save Template
              </button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <input
              placeholder="Meal name"
              value={mealDraft.name}
              onChange={(e) => updateMealDraft('name', e.target.value)}
              className="rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none"
            />
            <select
              value={mealDraft.type}
              onChange={(e) => updateMealDraft('type', e.target.value as MealType)}
              className="rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none"
            >
              {mealTypeOptions.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <input
              type="date"
              value={mealDraft.scheduledDate}
              onChange={(e) => updateMealDraft('scheduledDate', e.target.value)}
              className="rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none"
            />
            <select
              value={mealDraft.status}
              onChange={(e) => updateMealDraft('status', e.target.value as MealStatus)}
              className="rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none"
            >
              {mealStatusOptions.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <input
              placeholder="Time (optional)"
              value={mealDraft.mealTime}
              onChange={(e) => updateMealDraft('mealTime', e.target.value)}
              className="rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none"
            />
            <input
              placeholder="Calories"
              value={mealDraft.calories}
              onChange={(e) => updateMealDraft('calories', e.target.value)}
              className="rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none"
            />
            <input
              placeholder="Protein (g)"
              value={mealDraft.protein}
              onChange={(e) => updateMealDraft('protein', e.target.value)}
              className="rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none"
            />
            <input
              placeholder="Carbs (g)"
              value={mealDraft.carbs}
              onChange={(e) => updateMealDraft('carbs', e.target.value)}
              className="rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none"
            />
            <input
              placeholder="Fats (g)"
              value={mealDraft.fats}
              onChange={(e) => updateMealDraft('fats', e.target.value)}
              className="rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none"
            />
            <input
              placeholder="Water (ml)"
              value={mealDraft.waterMl}
              onChange={(e) => updateMealDraft('waterMl', e.target.value)}
              className="rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none"
            />
            <label className="flex items-center gap-2 rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={mealDraft.prepAhead}
                onChange={(e) => updateMealDraft('prepAhead', e.target.checked)}
                className="h-4 w-4 rounded border-border accent-primary"
              />
              Prep ahead
            </label>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                placeholder="Add tags like high-protein, quick, vegetarian"
                value={mealTagInput}
                onChange={(e) => setMealTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMealTag())}
                className="flex-1 rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none"
              />
              <button
                onClick={handleAddMealTag}
                className="rounded-md border border-border px-3 py-2 text-xs text-foreground transition-colors hover:bg-secondary/60"
              >
                Add Tag
              </button>
            </div>
            {mealDraft.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {mealDraft.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => removeMealTag(tag)}
                    className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    #{tag} ×
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                placeholder="Add ingredient"
                value={mealIngredientInput}
                onChange={(e) => setMealIngredientInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddIngredient())}
                className="flex-1 rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none"
              />
              <button
                onClick={handleAddIngredient}
                className="rounded-md border border-border px-3 py-2 text-xs text-foreground transition-colors hover:bg-secondary/60"
              >
                Add Ingredient
              </button>
            </div>
            {mealDraft.ingredients.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {mealDraft.ingredients.map((ingredient) => (
                  <button
                    key={ingredient}
                    onClick={() => removeIngredient(ingredient)}
                    className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {ingredient} ×
                  </button>
                ))}
              </div>
            )}
          </div>

          <textarea
            placeholder="Notes, prep reminders, post-workout pairing..."
            value={mealDraft.notes}
            onChange={(e) => updateMealDraft('notes', e.target.value)}
            rows={3}
            className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none"
          />

          <div className="flex gap-2">
            <button
              onClick={handleSaveMeal}
              className="rounded-md bg-primary px-4 py-2 text-xs text-primary-foreground transition-opacity hover:opacity-90"
            >
              {editingMealId ? 'Update Meal' : 'Save Meal'}
            </button>
            <button
              onClick={resetMealDraft}
              className="rounded-md px-4 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {editingMealId ? 'Cancel Edit' : 'Clear Form'}
            </button>
          </div>
        </div>

        {mealTemplates.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Templates</h3>
              <span className="text-xs text-muted-foreground">{mealTemplates.length} saved meals</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {mealTemplates.map((template) => (
                <div key={template.id} className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs">
                  <button onClick={() => applyMealTemplate(template.id)} className="text-foreground transition-colors hover:text-primary">
                    {template.name}
                  </button>
                  <button onClick={() => removeMealTemplate(template.id)} className="text-muted-foreground transition-colors hover:text-destructive">
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {(['All', 'Today', 'This Week', 'Planned', 'Prepared', 'Eaten'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setMealFilter(filter)}
              className={`interactive-button rounded-full px-3 py-1.5 text-xs transition-all ${mealFilter === filter
                ? 'border border-primary/25 bg-primary/20 text-primary shadow-[inset_0_1px_0_rgba(255,240,226,0.16),0_0_0_1px_rgba(198,93,46,0.08)]'
                : 'border border-border bg-background/50 text-muted-foreground hover:border-primary/20 hover:text-foreground'
                }`}
            >
              {filter}
            </button>
          ))}
          <select
            value={mealTypeFilter}
            onChange={(e) => setMealTypeFilter(e.target.value as 'All' | MealType)}
            className="focus-glow interactive-button rounded-full border border-border bg-background/50 px-3 py-1.5 text-xs text-foreground outline-none"
          >
            <option value="All">All types</option>
            {mealTypeOptions.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          {filteredMeals.length === 0 ? (
            <EmptyState
              icon={Salad}
              title="No meals for this filter"
              description="Switch the view or save a meal plan above to fill this part of your dashboard."
              actionLabel="Plan meal"
              onAction={() => {
                setMealFilter('All');
                setMealTypeFilter('All');
                resetMealDraft();
              }}
            />
          ) : filteredMeals.map((meal) => (
            <div key={meal.id} className="rounded-lg border border-border p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{meal.name}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${mealTypeColors[meal.type]}`}>{meal.type}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${mealStatusColors[meal.status]}`}>{meal.status}</span>
                    {meal.prepAhead ? (
                      <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">Prep ahead</span>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>{format(new Date(meal.scheduledDate), 'EEE, MMM d')}</span>
                    {meal.mealTime ? <span>{meal.mealTime}</span> : null}
                    {meal.waterMl ? <span>{meal.waterMl}ml water</span> : null}
                    {meal.eatenAt ? <span>Eaten {format(new Date(meal.eatenAt), 'MMM d, p')}</span> : null}
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    {meal.calories ? <span className="rounded-full border border-border px-2 py-0.5 text-muted-foreground">{meal.calories} cal</span> : null}
                    {meal.protein ? <span className="rounded-full border border-border px-2 py-0.5 text-muted-foreground">{meal.protein}g protein</span> : null}
                    {meal.carbs ? <span className="rounded-full border border-border px-2 py-0.5 text-muted-foreground">{meal.carbs}g carbs</span> : null}
                    {meal.fats ? <span className="rounded-full border border-border px-2 py-0.5 text-muted-foreground">{meal.fats}g fats</span> : null}
                  </div>

                  {meal.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {meal.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">#{tag}</span>
                      ))}
                    </div>
                  )}

                  {meal.ingredients.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {meal.ingredients.map((ingredient) => (
                        <span key={ingredient} className="rounded-full border border-border/70 bg-secondary/10 px-2 py-0.5 text-[11px] text-muted-foreground">{ingredient}</span>
                      ))}
                    </div>
                  )}

                  {meal.notes ? <p className="text-sm text-muted-foreground">{meal.notes}</p> : null}
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <select
                    value={meal.status}
                    onChange={(e) => updateMealStatus(meal.id, e.target.value as MealStatus)}
                    className="rounded-md border border-border bg-input px-2 py-1 text-xs text-foreground outline-none"
                  >
                    {mealStatusOptions.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => startMealEdit(meal)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeMeal(meal.id)}
                    className="text-muted-foreground transition-colors hover:text-destructive"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderJournalContent = () => {
    if (journalLoading) {
      return <div className="p-6 text-sm text-muted-foreground">Loading journal...</div>;
    }

    return (
      <div className="p-4 space-y-3">
        <div className="space-y-3 rounded-md border border-border p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {editingJournalId ? 'Edit Journal Entry' : 'New Journal Entry'}
            </p>
            <span className="text-[11px] text-muted-foreground">
              Ctrl+Enter / Cmd+Enter to save
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {journalMoodOptions.map((option) => {
              const isSelected = journalMood === option.label;

              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setJournalMood(isSelected ? null : option.label)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${isSelected
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-border text-muted-foreground hover:text-foreground'
                    }`}
                >
                  <span className="mr-1" aria-hidden="true">{option.emoji}</span>
                  {option.label}
                </button>
              );
            })}
          </div>

          <textarea
            placeholder="Write your thoughts..."
            value={journalContent}
            onChange={(e) => setJournalContent(e.target.value)}
            onKeyDown={handleJournalKeyDown}
            rows={5}
            className="w-full resize-none rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none"
          />

          <div className="flex gap-2">
            <button
              onClick={handleJournalSave}
              disabled={!journalContent.trim()}
              className="rounded-md bg-primary px-4 py-1.5 text-xs text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {editingJournalId ? 'Update Entry' : 'Save Entry'}
            </button>

            <button
              onClick={resetJournalComposer}
              className="px-4 py-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              {editingJournalId ? 'Cancel Edit' : 'Clear'}
            </button>
          </div>
        </div>

        {(entries || []).length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/70 bg-background/35 p-4 text-sm text-muted-foreground">
            Your first entry will appear here once you save something above.
          </div>
        ) : (entries || []).map((entry) => (
          <div key={entry.id} className="border border-border rounded-md p-3">
            {entry.mood && (
              <div className="mb-2 inline-flex rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                {journalMoodOptions.find((option) => option.label === entry.mood)?.emoji ?? '💭'} {entry.mood}
              </div>
            )}

            <p className="whitespace-pre-wrap text-sm text-foreground">{entry.content}</p>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>{formatJournalTimestamp(entry.createdAt)}</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => startJournalEdit(entry)}
                  className="transition-colors hover:text-foreground"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="transition-colors hover:text-destructive"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTabContent = () => {
    if (activeTab === 'Todo') return renderTodoContent();
    if (activeTab === 'Journal') return renderJournalContent();
    if (activeTab === 'Habits') return renderHabitContent();
    if (activeTab === 'Workout') return renderWorkoutContent();
    if (activeTab === 'Meal') return renderMealContent();

    return (
      <div className="p-6 text-sm text-muted-foreground">
        <div className="rounded-lg border border-border bg-secondary/20 p-4">
          <p className="mb-1 font-medium text-foreground">{activeTab}</p>
          <p>This tab is selected, but its content is not connected yet.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="glass-panel dashboard-card rounded-lg border border-border ambient-orb">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="text-base font-semibold text-foreground">Overview</h2>

        {activeTab === 'Todo' ? (
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="focus-glow interactive-button rounded-xl border border-border bg-input px-3 py-1.5 text-xs text-foreground outline-none"
          >
            <option value="All">All</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        ) : (
          <div className="text-xs text-muted-foreground">{activeTab}</div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border/70 bg-gradient-to-r from-background/70 via-secondary/20 to-background/70 px-4 pb-3 pt-3">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setShowAdd(false);
              setShowAddHabit(false);
              setShowAll(false);
              resetJournalComposer();
              resetWorkoutDraft();
              resetMealDraft();
              setEditing(null);
              setEditingHabit(null);
            }}
            className={`interactive-button rounded-xl px-3 py-2 text-xs font-medium transition-all ${activeTab === tab
              ? 'border border-primary/25 bg-gradient-to-b from-primary/25 to-primary/10 text-primary shadow-[inset_0_1px_0_rgba(255,240,226,0.18),0_10px_24px_rgba(198,93,46,0.08)]'
              : 'border border-transparent text-muted-foreground hover:border-border/70 hover:bg-secondary/35 hover:text-foreground'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {renderTabContent()}
    </div>
  );
}
