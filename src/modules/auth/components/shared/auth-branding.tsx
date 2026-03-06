interface AuthBrandingProps {
  subtitle: string
}

export function AuthBranding({ subtitle }: AuthBrandingProps) {
  return (
    <div className="text-center space-y-3 mb-6">
      <img src="/logo.png" alt="NellaUp" className="h-10 mx-auto" />
      <p className="text-sm" style={{ color: 'rgba(240,244,255,0.5)' }}>{subtitle}</p>
    </div>
  )
}
