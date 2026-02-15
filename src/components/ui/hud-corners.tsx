// src/components/ui/hud-corners.tsx
export function HudCorners() {
  return (
    <>
      {/* Top-left */}
      <div className="absolute top-0 left-0 w-6 h-6 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-primary/60 to-transparent" />
        <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-primary/60 to-transparent" />
      </div>

      {/* Top-right */}
      <div className="absolute top-0 right-0 w-6 h-6 pointer-events-none">
        <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-l from-primary/60 to-transparent" />
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-primary/60 to-transparent" />
      </div>

      {/* Bottom-left */}
      <div className="absolute bottom-0 left-0 w-6 h-6 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-primary/60 to-transparent" />
        <div className="absolute bottom-0 left-0 w-px h-full bg-gradient-to-t from-primary/60 to-transparent" />
      </div>

      {/* Bottom-right */}
      <div className="absolute bottom-0 right-0 w-6 h-6 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-primary/60 to-transparent" />
        <div className="absolute bottom-0 right-0 w-px h-full bg-gradient-to-t from-primary/60 to-transparent" />
      </div>
    </>
  )
}
