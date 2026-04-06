import { useEffect, useState } from 'react';
import { LogOut, Settings, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useHabitContext } from '@/contexts/HabitContext';
import { supabase } from '@/integrations/supabase/client';
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
  const longDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const todaysHabits = habits.filter((habit) => habit.day === todayName);
  const completedToday = todaysHabits.filter((habit) => habit.done).length;
  const habitPct = todaysHabits.length > 0 ? Math.round((completedToday / todaysHabits.length) * 100) : 0;

  return (
    <div className="topbar-shell px-4 py-4 md:px-5">
      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/25 bg-primary/12 text-sm font-semibold text-primary crimson-glow-sm">
            LP
          </div>

          <div className="space-y-2">
            <div className="section-kicker">Private focus system</div>
            <div>
              <p className="font-display text-2xl text-foreground md:text-3xl">Life Planner</p>
              <p className="mt-1 text-sm text-muted-foreground">A calm board for planning, habits, workouts, meals, and notes.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="metric-chip">{longDate}</span>
              <span className="metric-chip">One place for your full day</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden rounded-full border border-border/70 bg-background/55 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground lg:inline-flex">
            Daily command board
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="control-chip interactive-button text-left focus-glow">
                <div className="w-12">
                  <div className="h-1.5 w-full rounded-full bg-secondary/90">
                    <div className="h-1.5 rounded-full bg-gradient-to-r from-primary via-warning to-success transition-all" style={{ width: `${habitPct}%` }} />
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Habits</div>
                  <div className="text-sm font-medium text-foreground">{completedToday}/{todaysHabits.length || 0} complete</div>
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
              <button className="control-chip interactive-button focus-glow">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="h-10 w-10 rounded-2xl object-cover border border-border" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/25 bg-primary/12 text-primary">
                    <User size={16} />
                  </div>
                )}
                <div className="hidden text-left sm:block">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Workspace</div>
                  <div className="text-sm font-medium text-foreground">{displayName}</div>
                </div>
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
    </div>
  );
}
