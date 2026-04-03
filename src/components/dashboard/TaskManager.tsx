import { useState } from 'react';
import { useTaskContext, type Task } from '@/contexts/TaskContext';
import { Plus, Trash2, Pencil, X, Check } from 'lucide-react';

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

const tabs = ['Todo', 'Journal', 'Habits', 'Workout', 'Meal'];

export default function TaskManager() {
  const { tasks, toggleTask, removeTask, addTask, editTask } = useTaskContext();
  const [activeTab, setActiveTab] = useState('Todo');
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ name: '', category: 'Work' as Task['category'], priority: 'Medium' as Task['priority'], dueDate: '' });
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [showAll, setShowAll] = useState(false);

  const startEdit = (t: Task) => { setEditing(t.id); setEditName(t.name); };
  const saveEdit = (id: string) => { editTask(id, editName); setEditing(null); };

  const handleAdd = () => {
    if (!newTask.name || !newTask.dueDate) return;
    addTask(newTask);
    setNewTask({ name: '', category: 'Work', priority: 'Medium', dueDate: '' });
    setShowAdd(false);
  };

  const filtered = filterPriority === 'All' ? tasks : tasks.filter(t => t.priority === filterPriority);
  const displayed = showAll ? filtered : filtered.slice(0, 8);

  return (
    <div className="glass-panel rounded-lg border border-border">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-foreground font-semibold text-base">Overview</h2>
        <select
          value={filterPriority}
          onChange={e => setFilterPriority(e.target.value)}
          className="bg-input text-foreground text-xs rounded-md px-2 py-1 border border-border outline-none"
        >
          <option value="All">All</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      <div className="flex gap-2 px-4 pt-3 pb-2 border-b border-border">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === tab ? 'bg-primary/20 text-primary border border-primary/30' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground text-xs">
              <th className="text-left p-3 font-medium w-8"></th>
              <th className="text-left p-3 font-medium">Name</th>
              <th className="text-left p-3 font-medium">Category</th>
              <th className="text-left p-3 font-medium font-mono">Due Date</th>
              <th className="text-left p-3 font-medium">Priority</th>
              <th className="text-right p-3 font-medium w-20"></th>
            </tr>
          </thead>
          <tbody>
            {displayed.map(task => (
              <tr key={task.id} className="border-b border-border/30 hover:bg-secondary/50 transition-colors">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                  />
                </td>
                <td className="p-3">
                  {editing === task.id ? (
                    <div className="flex items-center gap-1">
                      <input value={editName} onChange={e => setEditName(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveEdit(task.id)} className="bg-input text-foreground px-2 py-0.5 rounded text-sm border border-border outline-none" autoFocus />
                      <button onClick={() => saveEdit(task.id)} className="text-success hover:opacity-80"><Check size={14} /></button>
                      <button onClick={() => setEditing(null)} className="text-muted-foreground hover:opacity-80"><X size={14} /></button>
                    </div>
                  ) : (
                    <span className={`text-foreground ${task.completed ? 'line-through opacity-40' : ''}`}>{task.name}</span>
                  )}
                </td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${categoryColors[task.category]}`}>{task.category}</span>
                </td>
                <td className="p-3 text-muted-foreground text-xs font-mono">
                  {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${priorityColors[task.priority]}`}>{task.priority}</span>
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => startEdit(task)} className="text-muted-foreground hover:text-foreground transition-colors p-1"><Pencil size={13} strokeWidth={1.5} /></button>
                    <button onClick={() => removeTask(task.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1"><Trash2 size={13} strokeWidth={1.5} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length > 8 && (
        <div className="p-3 border-t border-border/30 text-xs text-muted-foreground">
          <button onClick={() => setShowAll(!showAll)} className="hover:text-foreground transition-colors">
            {showAll ? 'Show less' : `Load more (${filtered.length - 8} remaining)`}
          </button>
        </div>
      )}

      {showAdd ? (
        <div className="p-4 border-t border-border space-y-2">
          <div className="flex gap-2">
            <input placeholder="Task name" value={newTask.name} onChange={e => setNewTask({ ...newTask, name: e.target.value })} onKeyDown={e => e.key === 'Enter' && handleAdd()} className="flex-1 bg-input text-foreground px-3 py-1.5 rounded-md text-sm border border-border outline-none" autoFocus />
            <select value={newTask.category} onChange={e => setNewTask({ ...newTask, category: e.target.value as Task['category'] })} className="bg-input text-foreground text-xs rounded-md px-2 py-1 border border-border outline-none">
              {['Work', 'Life', 'Health', 'Personal', 'Home'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })} className="bg-input text-foreground text-xs rounded-md px-2 py-1 border border-border outline-none">
              {['High', 'Medium', 'Low'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <input type="date" value={newTask.dueDate} onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })} className="bg-input text-foreground text-xs rounded-md px-2 py-1 border border-border outline-none font-mono" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="bg-primary text-primary-foreground text-xs px-4 py-1.5 rounded-md hover:opacity-90 transition-opacity">Add</button>
            <button onClick={() => setShowAdd(false)} className="text-muted-foreground text-xs px-4 py-1.5 hover:text-foreground transition-colors">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)} className="w-full p-3 text-left text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
          <Plus size={14} strokeWidth={1.5} /> New
        </button>
      )}
    </div>
  );
}
