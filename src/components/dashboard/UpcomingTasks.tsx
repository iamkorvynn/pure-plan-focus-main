import { useTaskContext } from '@/contexts/TaskContext';
import { useState } from 'react';

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

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today); nextWeek.setDate(nextWeek.getDate() + 7);

  const filteredTasks = filter === 'All' ? tasks : tasks.filter(t => t.priority === filter);

  const groups = [
    { label: 'Today', tasks: filteredTasks.filter(t => new Date(t.dueDate).toDateString() === today.toDateString()) },
    { label: 'Tomorrow', tasks: filteredTasks.filter(t => new Date(t.dueDate).toDateString() === tomorrow.toDateString()) },
    { label: 'Next 7 Days', tasks: filteredTasks.filter(t => { const d = new Date(t.dueDate); return d > tomorrow && d <= nextWeek; }) },
  ];

  const hasGroupedTasks = groups.some(g => g.tasks.length > 0);
  const allUpcoming = filteredTasks.filter(t => !t.completed).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).slice(0, 12);

  const handleQuickAdd = (dateLabel: string) => {
    if (!newName.trim()) return;
    const date = dateLabel === 'Today' ? today : dateLabel === 'Tomorrow' ? tomorrow : new Date(today.getTime() + 3 * 86400000);
    const dueDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    addTask({ name: newName.trim(), category: 'Work', priority: 'Medium', dueDate });
    setNewName(''); setShowNewInput(null);
  };

  const renderTask = (t: typeof tasks[0]) => (
    <div key={t.id} className="flex items-center justify-between group">
      <div className="flex items-center gap-2">
        <button
          onClick={() => toggleTask(t.id)}
          className={`w-3 h-3 rounded-full border-2 transition-colors ${t.completed ? 'bg-primary border-primary' : 'border-muted-foreground hover:border-primary'}`}
        />
        <span className={`text-xs ${t.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{t.name}</span>
      </div>
      <div className="flex items-center gap-2">
        {t.priority === 'High' && <span className={`text-[10px] px-1.5 py-0.5 rounded ${priorityBadge.High}`}>High</span>}
        <input type="checkbox" checked={t.completed} onChange={() => toggleTask(t.id)} className="w-3 h-3 accent-primary cursor-pointer" />
      </div>
    </div>
  );

  return (
    <div className="glass-panel rounded-lg border border-border">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-foreground font-semibold text-sm">Upcoming</h3>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="bg-input text-muted-foreground text-xs rounded-md px-2 py-0.5 border border-border outline-none cursor-pointer">
          <option value="All">All</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      <div className="p-3 space-y-4 max-h-[500px] overflow-y-auto scrollbar-thin">
        {hasGroupedTasks ? (
          groups.map(group =>
            group.tasks.length > 0 && (
              <div key={group.label}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-primary">● {group.label}</span>
                  <span className="text-[10px] text-muted-foreground">{group.tasks.length}</span>
                </div>
                <div className="space-y-1.5">
                  {group.tasks.map(renderTask)}
                  {showNewInput === group.label ? (
                    <div className="flex items-center gap-1">
                      <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleQuickAdd(group.label)} placeholder="Task name..." className="flex-1 bg-input text-foreground text-[10px] px-2 py-0.5 rounded border border-border outline-none" autoFocus />
                      <button onClick={() => handleQuickAdd(group.label)} className="text-[10px] text-primary hover:opacity-80">Add</button>
                      <button onClick={() => { setShowNewInput(null); setNewName(''); }} className="text-[10px] text-muted-foreground">✕</button>
                    </div>
                  ) : (
                    <button onClick={() => setShowNewInput(group.label)} className="text-[10px] text-muted-foreground hover:text-primary mt-1">+ New</button>
                  )}
                </div>
              </div>
            )
          )
        ) : (
          <div>
            <span className="text-xs font-semibold text-primary">● Upcoming</span>
            <div className="space-y-1.5 mt-2">
              {allUpcoming.map(renderTask)}
              {showNewInput === 'upcoming' ? (
                <div className="flex items-center gap-1">
                  <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleQuickAdd('Today')} placeholder="Task name..." className="flex-1 bg-input text-foreground text-[10px] px-2 py-0.5 rounded border border-border outline-none" autoFocus />
                  <button onClick={() => handleQuickAdd('Today')} className="text-[10px] text-primary hover:opacity-80">Add</button>
                  <button onClick={() => { setShowNewInput(null); setNewName(''); }} className="text-[10px] text-muted-foreground">✕</button>
                </div>
              ) : (
                <button onClick={() => setShowNewInput('upcoming')} className="text-[10px] text-muted-foreground hover:text-primary mt-1">+ New</button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
