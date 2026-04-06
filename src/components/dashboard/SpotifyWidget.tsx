export default function SpotifyWidget() {
  return (
    <div className="bento-panel overflow-hidden">
      <div className="border-b border-border/70 p-5">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Background focus</p>
        <h3 className="mt-2 font-display text-2xl text-foreground">Play Now</h3>
        <p className="mt-1 text-sm text-muted-foreground">Keep a steady soundtrack running alongside the board.</p>
      </div>
      <div className="p-4">
        <iframe 
          data-testid="embed-iframe" 
          style={{ borderRadius: '20px' }} 
          src="https://open.spotify.com/embed/playlist/1qjIZaxHfw7yTTuSi4XSxx?utm_source=generator" 
          width="100%" 
          height="352" 
          frameBorder="0" 
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
          allowFullScreen 
          loading="lazy"
        ></iframe>
      </div>
    </div>
  );
}
