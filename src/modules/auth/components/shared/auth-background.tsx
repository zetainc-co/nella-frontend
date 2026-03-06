'use client'

import { cn } from '@/lib/utils'

interface AuthBackgroundProps {
  children: React.ReactNode
  className?: string
}

/**
 * AuthBackground — wrapper centralizado del layout de auth.
 *
 * Proporciona:
 *  - Fondo oscuro neutro (#151515) sincronizado con el dashboard
 *  - Orbs animados (teal top-right, purple bottom-left) via keyframes en globals.css
 *  - CSS variables del scope auth (colores, borders, inputs) via clase auth-scope
 *  - Slot para children en z-10, por encima de los orbs
 */
export function AuthBackground({ children, className }: AuthBackgroundProps) {
  return (
    <div
      className={cn('auth-scope relative min-h-screen overflow-hidden', className)}
      style={{ backgroundColor: '#151515' }}
    >
      {/* Purple orb — top-right */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          top: '-18%',
          right: '-8%',
          width: '720px',
          height: '720px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 50% 50%, rgba(140,40,250,0.28) 0%, rgba(124,58,237,0.12) 38%, rgba(100,40,200,0.04) 60%, transparent 75%)',
          filter: 'blur(65px)',
          animation: 'orb-breathe 7s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Purple orb — bottom-left */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          bottom: '-18%',
          left: '-10%',
          width: '640px',
          height: '640px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 50% 50%, rgba(124,58,237,0.22) 0%, rgba(100,40,200,0.08) 42%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'orb-breathe-slow 9s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Contenido — siempre por encima de los orbs */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
