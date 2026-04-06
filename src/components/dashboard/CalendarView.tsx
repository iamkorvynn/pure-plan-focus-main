import { useMemo, useState } from 'react';
import { endOfMonth, endOfWeek, format, isSameDay, isSameMonth, isToday, parseISO, startOfMonth, startOfWeek } from 'date-fns';
import { CalendarDays, ChevronLeft, ChevronRight, Dumbbell, Salad, Sparkles, Target } from 'lucide-react';
import { useTaskContext } from '@/contexts/TaskContext';
import { useMealContext, type MealType } from '@/contexts/MealContext';
import { useWorkoutContext, type WorkoutType } from '@/contexts/WorkoutContext';
import { useHabitContext } from '@/contexts/HabitContext';
import { useJournalContext } from '@/contexts/JournalContext';

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const calendarFilters = ['Tasks', 'Meals', 'Workouts', 'Habits', 'Journal'] as const;

type CalendarFilter = typeof calendarFilters[number];

const taskDotColors: Record<string, string> = {
  Work: 'bg-primary',
  Life: 'bg-info',
  Health: 'bg-success',
  Personal: 'bg-warning',
  Home: 'bg-muted-foreground',
};

const mealColors: Record<MealType, string> = {
  Breakfast: 'bg-warning/20 text-warning',
  Lunch: 'bg-success/20 text-success',
  Dinner: 'bg-primary/20 text-primary',
  Snack: 'bg-muted text-muted-foreground',
};

const workoutColors: Record<WorkoutType, string> = {
  Strength: 'bg-primary/15 text-primary',
  Cardio: 'bg-warning/20 text-warning',
  Mobility: 'bg-success/20 text-success',
  Recovery: 'bg-muted text-muted-foreground',
  Push: 'bg-crimson-maroon/30 text-primary',
  Pull: 'bg-primary/10 text-foreground',
  Legs: 'bg-success/15 text-success',
};

interface DayBucket {
  date: Date;
  key: string;
}

export default function CalendarView() {
  const { tasks } = useTaskContext();
  const { meals } = useMealContext();
  const { workouts } = useWorkoutContext();
  const { habits } = useHabitContext();
  const { entries } = useJournalContext();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [activeFilters, setActiveFilters] = useState<CalendarFilter[]>([...calendarFilters]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = useMemo(() => {
    const days: DayBucket[] = [];
    let cursor = gridStart;

    while (cursor <= gridEnd) {
      days.push({
        date: cursor,
        key: format(cursor, 'yyyy-MM-dd'),
      });
      cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1);
    }

    return days;
  }, [gridStart, gridEnd]);

  const selectedDay = parseISO(selectedDate);

  const selectedTasks = tasks.filter((task) => task.dueDate === selectedDate);
  const selectedMeals = meals.filter((meal) => meal.scheduledDate === selectedDate);
  const selectedWorkouts = workouts.filter((workout) => workout.scheduledDate === selectedDate);
  const selectedHabits = habits.filter((habit) => habit.day === format(selectedDay, 'EEEE'));
  const selectedEntries = entries.filter((entry) => format(new Date(entry.createdAt), 'yyyy-MM-dd') === selectedDate);

  const hasFilter = (filter: CalendarFilter) => activeFilters.includes(filter);

  const toggleFilter = (filter: CalendarFilter) => {
    setActiveFilters((prev) =>
      prev.includes(filter) ? prev.filter((item) => item !== filter) : [...prev, filter]
    );
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const goToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(format(today, 'yyyy-MM-dd'));
  };

  const monthName = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const getSummaryCount = (dayKey: string, filter: CalendarFilter) => {
    if (filter === 'Tasks') return tasks.filter((task) => task.dueDate === dayKey).length;
    if (filter === 'Meals') return meals.filter((meal) => meal.scheduledDate === dayKey).length;
    if (filter === 'Workouts') return workouts.filter((workout) => workout.scheduledDate === dayKey).length;
    if (filter === 'Habits') {
      const weekday = format(parseISO(`${dayKey}T00:00:00`.replace('T00:00:00', '')), 'EEEE');
      return habits.filter((habit) => habit.day === weekday).length;
    }
    return entries.filter((entry) => format(new Date(entry.createdAt), 'yyyy-MM-dd') === dayKey).length;
  };

  return (
    <div className="bento-panel ambient-orb">
      <div className="flex items-center justify-between border-b border-border/70 px-5 py-5">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Board timeline</p>
          <h2 className="mt-2 font-display text-3xl text-foreground">Calendar</h2>
          <p className="mt-1 text-sm text-muted-foreground">Plan across tasks, meals, workouts, habits, and journal check-ins.</p>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <span className="text-base font-semibold text-foreground">{monthName}</span>
          <div className="flex items-center gap-1">
            <button onClick={prevMonth} className="control-chip interactive-button focus-glow px-3 py-2 text-muted-foreground transition-colors hover:text-foreground">
              <ChevronLeft size={14} strokeWidth={1.5} />
            </button>
            <button onClick={goToday} className="control-chip interactive-button focus-glow px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-primary">
              Today
            </button>
            <button onClick={nextMonth} className="control-chip interactive-button focus-glow px-3 py-2 text-muted-foreground transition-colors hover:text-foreground">
              <ChevronRight size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {calendarFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => toggleFilter(filter)}
              className={`tab-pill focus-glow interactive-button ${hasFilter(filter) ? 'tab-pill-active' : ''}`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5 md:gap-2">
          {dayNames.map((day) => (
            <div key={day} className="py-2 text-center text-xs font-medium text-muted-foreground">
              {day}
            </div>
          ))}

          {calendarDays.map((day) => {
            const dayTasks = tasks.filter((task) => task.dueDate === day.key);
            const dayMeals = meals.filter((meal) => meal.scheduledDate === day.key);
            const dayWorkouts = workouts.filter((workout) => workout.scheduledDate === day.key);
            const weekday = format(day.date, 'EEEE');
            const dayHabits = habits.filter((habit) => habit.day === weekday);
            const dayEntries = entries.filter((entry) => format(new Date(entry.createdAt), 'yyyy-MM-dd') === day.key);
            const totalCount = dayTasks.length + dayMeals.length + dayWorkouts.length + dayHabits.length + dayEntries.length;
            const selected = selectedDate === day.key;

            return (
              <button
                key={day.key}
                onClick={() => setSelectedDate(day.key)}
                className={`interactive-card min-h-[96px] rounded-xl border p-2 text-left transition-colors md:min-h-[120px] ${selected
                  ? 'border-primary bg-primary/5'
                  : 'border-border/40 hover:bg-secondary/30'
                  } ${!isSameMonth(day.date, currentDate) ? 'opacity-35' : ''}`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${isToday(day.date)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground'
                    }`}>
                    {format(day.date, 'd')}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{totalCount > 0 ? `${totalCount} items` : ''}</span>
                </div>

                <div className="space-y-1">
                  {hasFilter('Tasks') && dayTasks.slice(0, 2).map((task) => (
                    <div key={task.id} className="flex items-center gap-1 truncate text-[10px] text-foreground">
                      <span className={`h-2 w-2 rounded-full ${taskDotColors[task.category] ?? 'bg-muted-foreground'}`} />
                      <span className="truncate">{task.name}</span>
                    </div>
                  ))}

                  {hasFilter('Meals') && dayMeals.slice(0, 1).map((meal) => (
                    <div key={meal.id} className={`truncate rounded px-1.5 py-0.5 text-[10px] font-medium ${mealColors[meal.type]}`}>
                      {meal.type}: {meal.name}
                    </div>
                  ))}

                  {hasFilter('Workouts') && dayWorkouts.slice(0, 1).map((workout) => (
                    <div key={workout.id} className={`truncate rounded px-1.5 py-0.5 text-[10px] font-medium ${workoutColors[workout.workoutType]}`}>
                      {workout.workoutName}
                    </div>
                  ))}

                  {hasFilter('Habits') && dayHabits.length > 0 && (
                    <div className="text-[10px] text-muted-foreground">
                      {dayHabits.filter((habit) => habit.done).length}/{dayHabits.length} habits
                    </div>
                  )}

                  {hasFilter('Journal') && dayEntries.length > 0 && (
                    <div className="text-[10px] text-primary">
                      Journal check-in
                    </div>
                  )}

                  {totalCount > 3 && (
                    <div className="text-[10px] text-muted-foreground">+ more in agenda</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-background/60 via-secondary/15 to-background/70 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Agenda for {format(selectedDay, 'EEEE, MMM d')}
              </h3>
              <p className="text-xs text-muted-foreground">Click a day to inspect everything scheduled there.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-2">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tasks</div>
              {selectedTasks.length > 0 ? selectedTasks.map((task) => (
                <div key={task.id} className="rounded-md border border-border/60 bg-background/40 p-3 text-xs">
                  <div className="font-medium text-foreground">{task.name}</div>
                  <div className="mt-1 text-muted-foreground">{task.category} • {task.priority}</div>
                </div>
              )) : (
                <div className="rounded-xl border border-dashed border-border/70 bg-background/35 p-4 text-center">
                  <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-secondary/40 text-primary">
                    <CalendarDays size={16} />
                  </div>
                  <p className="text-xs font-medium text-foreground">No tasks here</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">This day is open for planning.</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Meals</div>
              {selectedMeals.length > 0 ? selectedMeals.map((meal) => (
                <div key={meal.id} className="rounded-md border border-border/60 bg-background/40 p-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 ${mealColors[meal.type]}`}>{meal.type}</span>
                    <span className="font-medium text-foreground">{meal.name}</span>
                  </div>
                  <div className="mt-1 text-muted-foreground">
                    {meal.status} {meal.mealTime ? `• ${meal.mealTime}` : ''}
                  </div>
                </div>
              )) : (
                <div className="rounded-xl border border-dashed border-border/70 bg-background/35 p-4 text-center">
                  <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-secondary/40 text-warning">
                    <Salad size={16} />
                  </div>
                  <p className="text-xs font-medium text-foreground">No meals planned</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Nothing is scheduled for this date yet.</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Workouts</div>
              {selectedWorkouts.length > 0 ? selectedWorkouts.map((workout) => (
                <div key={workout.id} className="rounded-md border border-border/60 bg-background/40 p-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 ${workoutColors[workout.workoutType]}`}>{workout.workoutType}</span>
                    <span className="font-medium text-foreground">{workout.workoutName}</span>
                  </div>
                  <div className="mt-1 text-muted-foreground">
                    {workout.duration} min • {workout.intensity}
                  </div>
                </div>
              )) : (
                <div className="rounded-xl border border-dashed border-border/70 bg-background/35 p-4 text-center">
                  <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-secondary/40 text-primary">
                    <Dumbbell size={16} />
                  </div>
                  <p className="text-xs font-medium text-foreground">No workouts scheduled</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">This day is open for training or recovery.</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Habits</div>
              {selectedHabits.length > 0 ? selectedHabits.map((habit) => (
                <div key={habit.id} className="rounded-md border border-border/60 bg-background/40 p-3 text-xs">
                  <div className="font-medium text-foreground">{habit.habitName}</div>
                  <div className="mt-1 text-muted-foreground">{habit.done ? 'Done' : 'Pending'} • {habit.day}</div>
                </div>
              )) : (
                <div className="rounded-xl border border-dashed border-border/70 bg-background/35 p-4 text-center">
                  <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-secondary/40 text-success">
                    <Target size={16} />
                  </div>
                  <p className="text-xs font-medium text-foreground">No habits for this day</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Nothing repeats on this weekday yet.</p>
                </div>
              )}
            </div>

            <div className="space-y-2 md:col-span-2 xl:col-span-2">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Journal</div>
              {selectedEntries.length > 0 ? selectedEntries.map((entry) => (
                <div key={entry.id} className="rounded-md border border-border/60 bg-background/40 p-3 text-xs">
                  <div className="mb-1 font-medium text-foreground">
                    {entry.mood ? `${entry.mood} • ` : ''}{format(new Date(entry.createdAt), 'p')}
                  </div>
                  <p className="line-clamp-3 whitespace-pre-wrap text-muted-foreground">{entry.content}</p>
                </div>
              )) : (
                <div className="rounded-xl border border-dashed border-border/70 bg-background/35 p-4 text-center">
                  <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-secondary/40 text-primary">
                    <Sparkles size={16} />
                  </div>
                  <p className="text-xs font-medium text-foreground">Quiet day</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">No journal entry recorded yet.</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
            {calendarFilters.map((filter) => (
              <div key={filter} className="rounded-full border border-border px-3 py-1">
                {filter}: {getSummaryCount(selectedDate, filter)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
