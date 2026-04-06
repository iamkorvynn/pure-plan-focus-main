export default function HeroBanner() {
  return (
    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-crimson-maroon/30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(0_100%_27%/0.15),_transparent_60%)]" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      <div className="absolute bottom-4 left-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/30 border border-primary/50 crimson-glow-sm" />
        <div>
          <p className="text-foreground font-semibold text-sm">Welcome back</p>
          <p className="text-muted-foreground text-xs">Plan your day with precision</p>
        </div>
      </div>
    </div>
  );
}
