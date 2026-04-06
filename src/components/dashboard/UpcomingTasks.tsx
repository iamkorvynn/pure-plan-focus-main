import { useState } from 'react';
import { format, isToday, isTomorrow } from 'date-fns';
import { Flame, Inbox, Sparkles } from 'lucide-react';
import { useTaskContext } from '@/contexts/TaskContext';

const priorityBadge: Record<string, string> = {
  High: 'bg-primary/20 text-primary',
  Medium: 'bg-crimson-maroon/30 text-muted-foreground',
  Low: 'bg-muted text-muted-foreground',
};

export default function UpcomingTasks() {
  const { tasks, toggleTask, addTask } = useTaskContext();
  const [filter, setFilter] = useState('All');
  const [showNewInput, setShowNewInput] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  const filteredTasks = filter === 'All' ? tasks : tasks.filter((task) => task.priority === filter);
  const openTasks = filteredTasks.filter((task) => !task.completed);

  const groups = [
    {
      label: 'Today',
      accent: 'text-primary',
      tasks: openTasks.filter((task) => isToday(new Date(task.dueDate))),
      dueDate: new Date(),
    },
    {
      label: 'Tomorrow',
      accent: 'text-warning',
      tasks: openTasks.filter((task) => isTomorrow(new Date(task.dueDate))),
      dueDate: new Date(Date.now() + 86400000),
    },
    {
      label: 'Soon',
      accent: 'text-success',
      tasks: openTasks.filter((task) => {
        const dueDate = new Date(task.dueDate);
        return !isToday(dueDate) && !isTomorrow(dueDate);
      }).slice(0, 5),
      dueDate: new Date(Date.now() + 3 * 86400000),
    },
  ];

  const completionPct = filteredTasks.length > 0
    ? Math.round((filteredTasks.filter((task) => task.completed).length / filteredTasks.length) * 100)
    : 0;

  const handleQuickAdd = (date: Date, groupKey: string) => {
    if (!newName.trim()) return;

    const dueDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    addTask({ name: newName.trim(), category: 'Work', priority: 'Medium', dueDate });
    setNewName('');
    setShowNewInput(null);
  };

  return (
    <section className="bento-panel">
      <div className="border-b border-border/70 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Momentum queue</p>
            <h3 className="mt-2 font-display text-2xl text-foreground">Upcoming</h3>
            <p className="mt-1 text-sm text-muted-foreground">Focus queue for the next few days.</p>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="control-chip focus-glow interactive-button text-xs text-muted-foreground outline-none transition-colors hover:border-primary/25"
          >
            <option value="All">All</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{filteredTasks.filter((task) => task.completed).length}/{filteredTasks.length || 0} cleared</span>
            <span>{completionPct}%</span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-secondary/80">
            <div className="h-2 rounded-full bg-gradient-to-r from-primary via-warning to-success transition-all duration-500" style={{ width: `${completionPct}%` }} />
          </div>
        </div>
      </div>

      <div className="max-h-[880px] space-y-4 overflow-y-auto p-4 scrollbar-thin">
        {groups.map((group) => (
          <div key={group.label} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] ${group.accent}`}>
                {group.label === 'Today' ? <Flame size={12} /> : group.label === 'Tomorrow' ? <Sparkles size={12} /> : <Inbox size={12} />}
                {group.label}
              </div>
              <span className="rounded-full border border-border bg-background/70 px-2 py-0.5 text-[10px] text-muted-foreground">
                {group.tasks.length}
              </span>
            </div>

            <div className="space-y-2">
              {group.tasks.length > 0 ? group.tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className="w-full rounded-xl border border-border/60 bg-background/55 px-3 py-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:bg-secondary/40 active:scale-[0.99]"
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 h-3.5 w-3.5 rounded-full border-2 transition-colors ${task.completed ? 'border-primary bg-primary' : 'border-muted-foreground/70'}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-medium ${task.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                          {task.name}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] ${priorityBadge[task.priority]}`}>{task.priority}</span>
                      </div>
                      <div className="mt-1 text-[10px] text-muted-foreground">
                        {format(new Date(task.dueDate), 'EEE, MMM d')}
                      </div>
                    </div>
                  </div>
                </button>
              )) : (
                <div className="rounded-xl border border-dashed border-border/70 px-3 py-4 text-center">
                  <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-secondary/35 text-primary">
                    {group.label === 'Today' ? <Flame size={16} /> : group.label === 'Tomorrow' ? <Sparkles size={16} /> : <Inbox size={16} />}
                  </div>
                  <p className="text-xs font-medium text-foreground">Nothing queued for {group.label.toLowerCase()}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Add one quick task to keep momentum going.</p>
                </div>
              )}

              {showNewInput === group.label ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd(group.dueDate, group.label)}
                      placeholder={`Add ${group.label.toLowerCase()} task...`}
                      className="flex-1 rounded-xl border border-border bg-input px-3 py-2 text-xs text-foreground outline-none transition-colors focus:border-primary/35"
                      autoFocus
                    />
                    <button onClick={() => handleQuickAdd(group.dueDate, group.label)} className="rounded-xl bg-primary px-3 py-2 text-xs text-primary-foreground transition-transform duration-150 hover:opacity-90 active:scale-95">
                      Add
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setShowNewInput(null);
                      setNewName('');
                    }}
                    className="px-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowNewInput(group.label)}
                  className="rounded-xl border border-border/70 bg-secondary/40 px-3 py-2 text-[11px] text-muted-foreground transition-all duration-200 hover:border-primary/25 hover:text-primary active:scale-[0.99]"
                >
                  + Quick add to {group.label.toLowerCase()}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
