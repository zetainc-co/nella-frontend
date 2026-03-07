import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      className="auth-scope relative flex min-h-screen items-center justify-center overflow-hidden p-4"
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

      {/* Content */}
      <div className="relative z-10 w-full max-w-md" style={{ animation: 'fadeIn 0.35s ease-out' }}>
        <div className="auth-card p-10 text-center">
          {/* 404 number */}
          <div
            className="text-8xl font-black tracking-tighter"
            style={{
              background: 'linear-gradient(135deg, #8C28FA 0%, #af6dff 50%, #8C28FA 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1,
            }}
          >
            404
          </div>

          {/* Message */}
          <h1 className="mt-5 text-xl font-bold" style={{ color: '#f0f4ff' }}>
            Página no encontrada
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'rgba(240,244,255,0.45)' }}>
            La página que buscas no existe o fue movida.
          </p>

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3">
            <Link href="/dashboard" className="btn-login no-underline">
              Ir al Dashboard
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium transition-colors hover:underline"
              style={{ color: '#8C28FA' }}
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
