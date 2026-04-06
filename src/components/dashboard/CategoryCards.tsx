import { BookOpen, CheckSquare, ClipboardList, DollarSign, Dumbbell, Film, Heart, HeartPulse, Pencil, Plane, Sparkles, Target } from 'lucide-react';

const cards = [
  {
    title: 'Daily',
    items: [
      { icon: ClipboardList, label: 'Planner' },
      { icon: CheckSquare, label: 'Habits' },
      { icon: Pencil, label: 'Journal' },
    ],
  },
  {
    title: 'Planners',
    items: [
      { icon: Heart, label: 'Meal Planner' },
      { icon: Plane, label: 'Travel Planner' },
      { icon: Dumbbell, label: 'Workout Planner' },
    ],
  },
  {
    title: 'Personal',
    items: [
      { icon: BookOpen, label: 'Bookshelf' },
      { icon: Film, label: 'Movies & Series' },
      { icon: DollarSign, label: 'Finance' },
    ],
  },
  {
    title: 'Goals',
    items: [
      { icon: Target, label: 'Goals' },
      { icon: Sparkles, label: 'Vision' },
      { icon: HeartPulse, label: 'Health' },
    ],
  },
];

export default function CategoryCards() {
  return (
    <section className="bento-panel p-4 md:p-5">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Launch lanes</p>
          <h2 className="font-display text-2xl text-foreground md:text-[2.1rem]">Everything you plan, in one board.</h2>
        </div>
        <p className="max-w-md text-sm text-muted-foreground">
          The same planner areas, now grouped into compact launcher tiles so the board reads faster at a glance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.title} className="bento-panel interactive-card group overflow-hidden p-4">
            <div className="mb-4 inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              {card.title}
            </div>
            <div className="space-y-2">
              {card.items.map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/45 px-3 py-2.5 text-sm text-muted-foreground transition-colors group-hover:text-foreground/85">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                    <item.icon size={15} strokeWidth={1.7} />
                  </div>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
