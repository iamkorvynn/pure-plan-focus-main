import { CalendarDays, Flame, Lock, Sparkles } from 'lucide-react';

export default function HeroBanner() {
  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <section className="bento-panel bento-panel--feature hero-surface min-h-[340px] p-6 md:min-h-[390px] md:p-8">
      <div className="absolute inset-y-0 right-0 hidden w-[42%] md:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_44%)]" />
        <div className="absolute right-8 top-10 h-40 w-40 rounded-full border border-white/10 bg-white/5 blur-3xl" />
        <div className="absolute bottom-8 right-8 w-[82%] rounded-[2rem] border border-white/10 bg-black/20 p-4 shadow-[0_30px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-white/55">
            <span>Daily balance</span>
            <span>Live board</span>
          </div>
          <div className="mt-6 space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-[11px] uppercase tracking-[0.16em] text-white/55">Focus lane</div>
              <div className="mt-2 text-lg font-semibold text-white">Tasks, habits, meals, and notes</div>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div className="h-2 w-3/5 rounded-full bg-gradient-to-r from-primary via-warning to-success" />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-[11px] uppercase tracking-[0.16em] text-white/55">Calm capture</div>
                <div className="mt-2 text-sm text-white/80">One private place for reflection and routine.</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-[11px] uppercase tracking-[0.16em] text-white/55">Today</div>
                <div className="mt-2 text-sm text-white/80">{todayLabel}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex h-full flex-col justify-between gap-8">
        <div className="flex flex-wrap gap-2">
          <span className="section-kicker">Welcome back</span>
          <span className="metric-chip"><CalendarDays size={14} className="text-primary" /> {todayLabel}</span>
          <span className="metric-chip"><Lock size={14} className="text-primary" /> Private by default</span>
        </div>

        <div className="max-w-3xl space-y-5">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Dark-luxury planner</p>
            <h1 className="font-display text-4xl leading-[0.95] text-foreground md:text-5xl xl:text-6xl">
              Shape the day before the day shapes you.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              Move from planning to action with one premium board for tasks, meals, workouts, habits, and journal check-ins.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/55">
                <Flame size={14} className="text-warning" />
                Focus
              </div>
              <p className="mt-3 text-sm text-white/82">Keep today&apos;s most important work visible without leaving the board.</p>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/55">
                <Sparkles size={14} className="text-primary" />
                Rituals
              </div>
              <p className="mt-3 text-sm text-white/82">Track recurring routines and progress through a calmer, cleaner layout.</p>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/55">
                <Lock size={14} className="text-info" />
                Reflection
              </div>
              <p className="mt-3 text-sm text-white/82">Capture journal notes and day plans in one private space with less visual noise.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
