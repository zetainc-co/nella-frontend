"use client"

import { Button } from '@/components/ui/button'
import { GoogleIcon, AppleIcon } from './social-auth-icons'

export function SocialAuthButtons() {
  const handleGoogleLogin = () => {
    console.log('[OAuth] Google login clicked')
    // Will be implemented in OAuth hook
  }

  const handleAppleLogin = () => {
    console.log('[OAuth] Apple login clicked')
    // Will be implemented in OAuth hook
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        variant="outline"
        type="button"
        className="h-11"
        onClick={handleGoogleLogin}
      >
        <GoogleIcon />
        <span className="ml-2">Google</span>
      </Button>
      <Button
        variant="outline"
        type="button"
        className="h-11"
        onClick={handleAppleLogin}
      >
        <AppleIcon />
        <span className="ml-2">Apple</span>
      </Button>
    </div>
  )
}
