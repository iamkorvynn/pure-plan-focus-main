export default function HeroBanner() {
  return (
    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
      <img
        src="/banner-butterflies.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/30 to-background/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/15 to-transparent" />
      <div className="absolute bottom-4 left-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/30 border border-primary/50 crimson-glow-sm flex items-center justify-center text-xl">
          <span aria-hidden="true">🌻</span>
        </div>
        <div>
          <p className="text-foreground font-semibold text-sm">Welcome back</p>
          <p className="text-muted-foreground text-xs">Plan your day with precision</p>
        </div>
      </div>
    </div>
  );
}
