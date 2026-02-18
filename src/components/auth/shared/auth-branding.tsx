interface AuthBrandingProps {
  subtitle: string
}

export function AuthBranding({ subtitle }: AuthBrandingProps) {
  return (
    <div className="text-center space-y-1.5 mb-6">
      <h1 className="text-3xl font-bold tracking-tight text-white">
        Nella<span style={{ color: '#9EFF00' }}>Sales</span>
      </h1>
      <p className="text-sm" style={{ color: 'rgba(240,244,255,0.5)' }}>{subtitle}</p>
    </div>
  )
}
