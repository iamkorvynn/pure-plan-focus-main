import { useState, useMemo } from 'react';
import { useTaskContext, type Task } from '@/contexts/TaskContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const categoryColors: Record<string, string> = {
  Work: 'text-primary',
  Life: 'text-info',
  Health: 'text-success',
  Personal: 'text-warning',
  Home: 'text-muted-foreground',
};

const priorityBg: Record<string, string> = {
  High: 'bg-primary/20 text-primary',
  Medium: 'bg-crimson-maroon/20 text-muted-foreground',
  Low: 'bg-muted text-muted-foreground',
};

export default function CalendarView() {
  const { tasks } = useTaskContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const days: { date: number; month: number; tasks: Task[] }[] = [];
    const prevLast = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) days.push({ date: prevLast - i, month: month - 1, tasks: [] });
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ date: d, month, tasks: tasks.filter(t => t.dueDate === dateStr) });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) days.push({ date: i, month: month + 1, tasks: [] });
    return days;
  }, [year, month, tasks]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());
  const monthName = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const today = new Date();
  const isToday = (d: number, m: number) => d === today.getDate() && m === today.getMonth() && year === today.getFullYear();

  const handleDateClick = (day: { date: number; month: number }) => {
    if (day.month !== month) return;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day.date).padStart(2, '0')}`;
    setSelectedDate(selectedDate === dateStr ? null : dateStr);
  };

  const selectedTasks = selectedDate ? tasks.filter(t => t.dueDate === selectedDate) : [];

  return (
    <div className="glass-panel rounded-lg border border-border">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-foreground font-semibold text-base">Calendar</h2>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-foreground font-medium text-sm">{monthName}</span>
          <div className="flex items-center gap-1">
            <button onClick={prevMonth} className="text-muted-foreground hover:text-foreground p-1 transition-colors"><ChevronLeft size={14} strokeWidth={1.5} /></button>
            <button onClick={goToday} className="text-xs text-muted-foreground hover:text-primary transition-colors px-2">Today</button>
            <button onClick={nextMonth} className="text-muted-foreground hover:text-foreground p-1 transition-colors"><ChevronRight size={14} strokeWidth={1.5} /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px">
          {dayNames.map(d => (
            <div key={d} className="text-center text-xs text-muted-foreground py-2 font-medium">{d}</div>
          ))}
          {calendarDays.map((day, i) => {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day.date).padStart(2, '0')}`;
            const isSelected = day.month === month && selectedDate === dateStr;
            return (
              <div
                key={i}
                onClick={() => handleDateClick(day)}
                className={`min-h-[72px] p-1 border border-border/20 rounded-sm text-xs cursor-pointer hover:bg-secondary/30 transition-colors ${
                  day.month !== month ? 'opacity-20' : ''
                } ${isSelected ? 'ring-1 ring-primary bg-primary/5' : ''}`}
              >
                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] mb-0.5 ${
                  isToday(day.date, day.month) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                }`}>{day.date}</span>
                <div className="space-y-0.5">
                  {day.tasks.slice(0, 2).map((t, ti) => (
                    <div key={ti} className="truncate">
                      <span className={`text-[9px] font-medium ${categoryColors[t.category] || 'text-muted-foreground'}`}>{t.name.slice(0, 8)}</span>
                    </div>
                  ))}
                  {day.tasks.length > 2 && <span className="text-[8px] text-muted-foreground">+{day.tasks.length - 2}</span>}
                </div>
              </div>
            );
          })}
        </div>

        {selectedDate && (
          <div className="mt-4 p-3 bg-secondary/30 rounded-lg border border-border/50">
            <h4 className="text-xs font-semibold text-foreground mb-2">
              Tasks for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </h4>
            {selectedTasks.length > 0 ? (
              <div className="space-y-1.5">
                {selectedTasks.map(t => (
                  <div key={t.id} className="flex items-center gap-2 text-xs">
                    <span className={`w-2 h-2 rounded-full ${t.completed ? 'bg-success' : 'bg-primary'}`} />
                    <span className={t.completed ? 'line-through text-muted-foreground' : 'text-foreground'}>{t.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${priorityBg[t.priority]}`}>{t.priority}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No tasks for this date.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
