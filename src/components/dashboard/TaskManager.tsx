import { useState } from 'react';
import { useTaskContext, type Task } from '@/contexts/TaskContext';
import { useMealContext } from '@/contexts/MealContext';
import { useHabitContext } from '@/contexts/HabitContext';
import { useWorkoutContext } from '@/contexts/WorkoutContext';
import { Plus, Trash2, Pencil, X, Check } from 'lucide-react';
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

const tabs = ['Todo', 'Journal', 'Habits', 'Workout', 'Meal'];

export default function TaskManager() {
  const { tasks, loading, toggleTask, removeTask, addTask, editTask } = useTaskContext();
  const { meals, loading: mealsLoading, addMeal, removeMeal, editMeal } = useMealContext();
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
  } = useWorkoutContext();
  const { entries, loading: journalLoading, addEntry, deleteEntry } = useJournalContext();

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

  const [editingMeal, setEditingMeal] = useState<string | null>(null);
  const [editMealName, setEditMealName] = useState('');
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [newMeal, setNewMeal] = useState({
    name: '',
    type: 'Breakfast' as 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack',
    day: '',
  });

  const [editingHabit, setEditingHabit] = useState<string | null>(null);
  const [editHabitName, setEditHabitName] = useState('');
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabit, setNewHabit] = useState({
    habitName: '',
    day: '',
  });

  const [editingWorkout, setEditingWorkout] = useState<string | null>(null);
  const [editWorkoutName, setEditWorkoutName] = useState('');
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [newWorkout, setNewWorkout] = useState({
    workoutName: '',
    day: '',
    duration: '',
  });
  const [showAddJournal, setShowAddJournal] = useState(false);
  const [journalContent, setJournalContent] = useState('');
  const [journalMood, setJournalMood] = useState('');

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

  const startMealEdit = (meal: { id: string; name: string }) => {
    setEditingMeal(meal.id);
    setEditMealName(meal.name);
  };

  const saveMealEdit = (id: string) => {
    editMeal(id, editMealName);
    setEditingMeal(null);
  };

  const handleAddMeal = () => {
    if (!newMeal.name || !newMeal.day) return;
    addMeal(newMeal);
    setNewMeal({
      name: '',
      type: 'Breakfast',
      day: '',
    });
    setShowAddMeal(false);
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

  const startWorkoutEdit = (workout: { id: string; workoutName: string }) => {
    setEditingWorkout(workout.id);
    setEditWorkoutName(workout.workoutName);
  };

  const saveWorkoutEdit = (id: string) => {
    editWorkout(id, editWorkoutName);
    setEditingWorkout(null);
  };

  const handleAddWorkout = () => {
    if (!newWorkout.workoutName || !newWorkout.day || !newWorkout.duration) return;
    addWorkout(newWorkout);
    setNewWorkout({
      workoutName: '',
      day: '',
      duration: '',
    });
    setShowAddWorkout(false);
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
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
            <div className="flex gap-2">
              <input
                placeholder="Task name"
                value={newTask.name}
                onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                className="flex-1 rounded-md border border-border bg-input px-3 py-1.5 text-sm text-foreground outline-none"
                autoFocus
              />

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

            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="rounded-md bg-primary px-4 py-1.5 text-xs text-primary-foreground transition-opacity hover:opacity-90"
              >
                Add
              </button>
              <button
                onClick={() => setShowAdd(false)}
                className="px-4 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="flex w-full items-center gap-1 p-3 text-left text-xs text-muted-foreground transition-colors hover:text-primary"
          >
            <Plus size={14} strokeWidth={1.5} /> New
          </button>
        )}
      </>
    );
  };

  const renderHabitContent = () => {
    if (habitsLoading) {
      return <div className="p-6 text-sm text-muted-foreground">Loading habits...</div>;
    }

    return (
      <>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
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

        {showAddHabit ? (
          <div className="space-y-2 border-t border-border p-4">
            <div className="flex gap-2">
              <input
                placeholder="Habit name"
                value={newHabit.habitName}
                onChange={(e) => setNewHabit({ ...newHabit, habitName: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()}
                className="flex-1 rounded-md border border-border bg-input px-3 py-1.5 text-sm text-foreground outline-none"
                autoFocus
              />

              <input
                placeholder="Day"
                value={newHabit.day}
                onChange={(e) => setNewHabit({ ...newHabit, day: e.target.value })}
                className="rounded-md border border-border bg-input px-2 py-1 text-xs text-foreground outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddHabit}
                className="rounded-md bg-primary px-4 py-1.5 text-xs text-primary-foreground transition-opacity hover:opacity-90"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddHabit(false)}
                className="px-4 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddHabit(true)}
            className="flex w-full items-center gap-1 p-3 text-left text-xs text-muted-foreground transition-colors hover:text-primary"
          >
            <Plus size={14} strokeWidth={1.5} /> New Habit
          </button>
        )}
      </>
    );
  };

  const renderWorkoutContent = () => {
    if (workoutsLoading) {
      return <div className="p-6 text-sm text-muted-foreground">Loading workouts...</div>;
    }

    return (
      <>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="w-8 p-3 text-left font-medium"></th>
                <th className="p-3 text-left font-medium">Workout</th>
                <th className="p-3 text-left font-medium">Day</th>
                <th className="p-3 text-left font-medium">Duration</th>
                <th className="w-20 p-3 text-right font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {workouts.map((workout) => (
                <tr
                  key={workout.id}
                  className="border-b border-border/30 transition-colors hover:bg-secondary/50"
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={workout.done}
                      onChange={() => toggleWorkout(workout.id)}
                      className="h-4 w-4 cursor-pointer rounded border-border accent-primary"
                    />
                  </td>

                  <td className="p-3">
                    {editingWorkout === workout.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          value={editWorkoutName}
                          onChange={(e) => setEditWorkoutName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && saveWorkoutEdit(workout.id)}
                          className="rounded border border-border bg-input px-2 py-0.5 text-sm text-foreground outline-none"
                          autoFocus
                        />
                        <button onClick={() => saveWorkoutEdit(workout.id)} className="text-success hover:opacity-80">
                          <Check size={14} />
                        </button>
                        <button onClick={() => setEditingWorkout(null)} className="text-muted-foreground hover:opacity-80">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <span className={`text-foreground ${workout.done ? 'line-through opacity-40' : ''}`}>
                        {workout.workoutName}
                      </span>
                    )}
                  </td>

                  <td className="p-3 text-xs text-muted-foreground">{workout.day}</td>
                  <td className="p-3 text-xs text-muted-foreground">{workout.duration}</td>

                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => startWorkoutEdit(workout)}
                        className="p-1 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <Pencil size={13} strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => removeWorkout(workout.id)}
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

        {showAddWorkout ? (
          <div className="space-y-2 border-t border-border p-4">
            <div className="flex gap-2">
              <input
                placeholder="Workout name"
                value={newWorkout.workoutName}
                onChange={(e) => setNewWorkout({ ...newWorkout, workoutName: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleAddWorkout()}
                className="flex-1 rounded-md border border-border bg-input px-3 py-1.5 text-sm text-foreground outline-none"
                autoFocus
              />

              <input
                placeholder="Day"
                value={newWorkout.day}
                onChange={(e) => setNewWorkout({ ...newWorkout, day: e.target.value })}
                className="rounded-md border border-border bg-input px-2 py-1 text-xs text-foreground outline-none"
              />

              <input
                placeholder="Duration"
                value={newWorkout.duration}
                onChange={(e) => setNewWorkout({ ...newWorkout, duration: e.target.value })}
                className="rounded-md border border-border bg-input px-2 py-1 text-xs text-foreground outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddWorkout}
                className="rounded-md bg-primary px-4 py-1.5 text-xs text-primary-foreground transition-opacity hover:opacity-90"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddWorkout(false)}
                className="px-4 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddWorkout(true)}
            className="flex w-full items-center gap-1 p-3 text-left text-xs text-muted-foreground transition-colors hover:text-primary"
          >
            <Plus size={14} strokeWidth={1.5} /> New Workout
          </button>
        )}
      </>
    );
  };

  const renderMealContent = () => {
    if (mealsLoading) {
      return <div className="p-6 text-sm text-muted-foreground">Loading meals...</div>;
    }

    return (
      <>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="p-3 text-left font-medium">Meal</th>
                <th className="p-3 text-left font-medium">Type</th>
                <th className="p-3 text-left font-medium">Day</th>
                <th className="w-20 p-3 text-right font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {meals.map((meal) => (
                <tr
                  key={meal.id}
                  className="border-b border-border/30 transition-colors hover:bg-secondary/50"
                >
                  <td className="p-3">
                    {editingMeal === meal.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          value={editMealName}
                          onChange={(e) => setEditMealName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && saveMealEdit(meal.id)}
                          className="rounded border border-border bg-input px-2 py-0.5 text-sm text-foreground outline-none"
                          autoFocus
                        />
                        <button onClick={() => saveMealEdit(meal.id)} className="text-success hover:opacity-80">
                          <Check size={14} />
                        </button>
                        <button onClick={() => setEditingMeal(null)} className="text-muted-foreground hover:opacity-80">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-foreground">{meal.name}</span>
                    )}
                  </td>

                  <td className="p-3">
                    <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${mealTypeColors[meal.type]}`}>
                      {meal.type}
                    </span>
                  </td>

                  <td className="p-3 text-xs text-muted-foreground">{meal.day}</td>

                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => startMealEdit(meal)}
                        className="p-1 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <Pencil size={13} strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => removeMeal(meal.id)}
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

        {showAddMeal ? (
          <div className="space-y-2 border-t border-border p-4">
            <div className="flex gap-2">
              <input
                placeholder="Meal name"
                value={newMeal.name}
                onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleAddMeal()}
                className="flex-1 rounded-md border border-border bg-input px-3 py-1.5 text-sm text-foreground outline-none"
                autoFocus
              />

              <select
                value={newMeal.type}
                onChange={(e) =>
                  setNewMeal({
                    ...newMeal,
                    type: e.target.value as 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack',
                  })
                }
                className="rounded-md border border-border bg-input px-2 py-1 text-xs text-foreground outline-none"
              >
                {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <input
                placeholder="Day"
                value={newMeal.day}
                onChange={(e) => setNewMeal({ ...newMeal, day: e.target.value })}
                className="rounded-md border border-border bg-input px-2 py-1 text-xs text-foreground outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddMeal}
                className="rounded-md bg-primary px-4 py-1.5 text-xs text-primary-foreground transition-opacity hover:opacity-90"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddMeal(false)}
                className="px-4 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddMeal(true)}
            className="flex w-full items-center gap-1 p-3 text-left text-xs text-muted-foreground transition-colors hover:text-primary"
          >
            <Plus size={14} strokeWidth={1.5} /> New Meal
          </button>
        )}
      </>
    );
  };

  const renderJournalContent = () => {
    if (journalLoading) {
      return <div className="p-6 text-sm text-muted-foreground">Loading journal...</div>;
    }

    const handleSave = () => {
      if (!journalContent.trim()) return;

      addEntry(journalContent.trim(), journalMood || undefined);
      setJournalContent('');
      setJournalMood('');
      setShowAddJournal(false);
    };

    return (
      <div className="p-4 space-y-3">
        {showAddJournal ? (
          <div className="space-y-3 rounded-md border border-border p-3">
            <input
              type="text"
              placeholder="Mood (optional)"
              value={journalMood}
              onChange={(e) => setJournalMood(e.target.value)}
              className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none"
            />

            <textarea
              placeholder="Write your thoughts..."
              value={journalContent}
              onChange={(e) => setJournalContent(e.target.value)}
              rows={5}
              className="w-full resize-none rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none"
              autoFocus
            />

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="rounded-md bg-primary px-4 py-1.5 text-xs text-primary-foreground hover:opacity-90"
              >
                Save
              </button>

              <button
                onClick={() => {
                  setShowAddJournal(false);
                  setJournalContent('');
                  setJournalMood('');
                }}
                className="px-4 py-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddJournal(true)}
            className="text-xs text-primary"
          >
            + New Entry
          </button>
        )}

        {(entries || []).map((entry) => (
          <div key={entry.id} className="border border-border rounded-md p-3">
            {entry.mood && (
              <div className="mb-1 text-xs text-primary">
                Mood: {entry.mood}
              </div>
            )}

            <p className="whitespace-pre-wrap text-sm text-foreground">{entry.content}</p>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
              <button onClick={() => deleteEntry(entry.id)}>Delete</button>
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
    <div className="glass-panel rounded-lg border border-border">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="text-base font-semibold text-foreground">Overview</h2>

        {activeTab === 'Todo' ? (
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="rounded-md border border-border bg-input px-2 py-1 text-xs text-foreground outline-none"
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

      <div className="flex gap-2 border-b border-border px-4 pb-2 pt-3">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setShowAdd(false);
              setShowAddMeal(false);
              setShowAddHabit(false);
              setShowAddWorkout(false);
              setShowAddJournal(false);
              setShowAll(false);
              setJournalContent('');
              setJournalMood('');
              setEditing(null);
              setEditingMeal(null);
              setEditingHabit(null);
              setEditingWorkout(null);
            }}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${activeTab === tab
              ? 'border border-primary/30 bg-primary/20 text-primary'
              : 'text-muted-foreground hover:text-foreground'
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
