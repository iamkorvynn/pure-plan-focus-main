import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LogOut, User, Settings } from 'lucide-react';
import { useHabitContext } from '@/contexts/HabitContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function UserHeader() {
  const { user, signOut } = useAuth();
  const { habits, toggleHabit } = useHabitContext();
  const [profile, setProfile] = useState<{ display_name: string | null; avatar_url: string | null } | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data);
      });
  }, [user]);

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = profile?.avatar_url;
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaysHabits = habits.filter((habit) => habit.day === todayName);
  const completedToday = todaysHabits.filter((habit) => habit.done).length;
  const habitPct = todaysHabits.length > 0 ? Math.round((completedToday / todaysHabits.length) * 100) : 0;

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Life Planner</h1>
        <p className="text-muted-foreground text-sm mt-1">| All your thoughts in one private place.</p>
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="dashboard-card interactive-button ambient-orb px-4 py-2 text-left focus-glow">
              <div className="flex items-center gap-3">
                <div className="w-10">
                  <div className="h-1.5 w-full rounded-full bg-secondary">
                    <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${habitPct}%` }} />
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Habits</div>
                  <div className="text-sm font-medium text-foreground">{completedToday}/{todaysHabits.length || 0} today</div>
                </div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-foreground">Today&apos;s Habits</p>
              <p className="text-xs text-muted-foreground">{todayName} • {habitPct}% complete</p>
            </div>
            <DropdownMenuSeparator />
            {todaysHabits.length > 0 ? todaysHabits.map((habit) => (
              <DropdownMenuItem key={habit.id} onSelect={(e) => { e.preventDefault(); toggleHabit(habit.id); }} className="gap-2 cursor-pointer">
                <input type="checkbox" readOnly checked={habit.done} className="h-3.5 w-3.5 accent-primary" />
                <span className={habit.done ? 'line-through text-muted-foreground' : 'text-foreground'}>{habit.habitName}</span>
              </DropdownMenuItem>
            )) : (
              <div className="px-3 py-2 text-xs text-muted-foreground">No habits scheduled for today.</div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="dashboard-card interactive-button flex items-center gap-3 px-4 py-2 focus-glow">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover border border-border" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <User size={16} className="text-primary" />
                </div>
              )}
              <span className="text-sm text-foreground font-medium hidden sm:block">{displayName}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium text-foreground">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Settings size={14} />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
              <LogOut size={14} />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
