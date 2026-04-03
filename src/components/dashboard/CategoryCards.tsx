import { ClipboardList, CheckSquare, Pencil, Heart, Plane, Dumbbell, BookOpen, Film, DollarSign, Target, Sparkles, HeartPulse } from 'lucide-react';

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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="group rounded-lg overflow-hidden glass-panel border border-border transition-all duration-200 hover:border-primary/40 hover:crimson-glow-sm cursor-pointer"
        >
          <div className="p-4">
            <h3 className="text-base font-bold text-foreground mb-3">{card.title}</h3>
            <div className="space-y-2">
              {card.items.map((item) => (
                <div key={item.label} className="flex items-center gap-2.5 text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">
                  <item.icon size={14} className="text-primary/70" strokeWidth={1.5} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
