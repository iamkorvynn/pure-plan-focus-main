export default function SpotifyWidget() {
  return (
    <div className="glass-panel rounded-lg border border-border overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-foreground font-semibold text-sm">Play Now</h3>
      </div>
      <div className="p-3">
        <iframe
          data-testid="embed-iframe"
          style={{ borderRadius: "12px" }}
          src="https://open.spotify.com/embed/playlist/7qgObDq693smm2V3V7bcLh?utm_source=generator"
          width="100%"
          height="352"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        ></iframe>
      </div>
    </div>
  );
}
