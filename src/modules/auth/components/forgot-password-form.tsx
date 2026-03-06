"use client"

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, ArrowLeft, Mail, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { forgotPasswordSchema, resetPasswordWithCodeSchema, type ForgotPasswordData, type ResetPasswordWithCodeData } from '@/modules/auth/hooks/auth-validations'
import { useForgotPassword } from '@/modules/auth/hooks/useForgotPassword'
import { useResetPassword } from '@/modules/auth/hooks/useResetPassword'
import { calculatePasswordStrength } from '@/modules/auth/hooks/auth-validations'

export function ForgotPasswordForm() {
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const forgotMutation = useForgotPassword()
  const resetMutation = useResetPassword()

  const emailForm = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const codeForm = useForm<ResetPasswordWithCodeData>({
    resolver: zodResolver(resetPasswordWithCodeSchema),
    defaultValues: { code: '', newPassword: '', confirmPassword: '' },
  })

  const newPasswordValue = codeForm.watch('newPassword')
  const passwordStrength = useMemo(
    () => (newPasswordValue ? calculatePasswordStrength(newPasswordValue) : 0),
    [newPasswordValue]
  )

  const onEmailSubmit = (data: ForgotPasswordData) => {
    forgotMutation.mutate(data.email, {
      onSuccess: () => {
        setSubmittedEmail(data.email)
        setStep('code')
      },
    })
  }

  const onCodeSubmit = (data: ResetPasswordWithCodeData) => {
    resetMutation.mutate({
      email: submittedEmail,
      code: data.code,
      newPassword: data.newPassword,
    })
  }

  const handleRequestNewCode = () => {
    codeForm.reset()
    setStep('email')
  }

  if (step === 'email') {
    return (
      <div className="auth-card p-8">
        <div className="text-center space-y-3 mb-8">
          <img src="/logo.png" alt="NellaUp" className="h-10 mx-auto" />
          <p className="text-sm" style={{ color: 'rgba(240,244,255,0.5)' }}>
            Recupera tu contraseña
          </p>
        </div>

        <Form {...emailForm}>
          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
            <FormField
              control={emailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="tu@empresa.com"
                      className="auth-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <p className="text-xs text-muted-foreground" >
              Te enviaremos un código de 6 dígitos a tu correo. Válido por 15 minutos.
            </p>

            <Button
              type="submit"
              className="btn-login"
              disabled={forgotMutation.isPending}
            >
              {forgotMutation.isPending ? (
                'Enviando...'
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  Enviar código
                </>
              )}
            </Button>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Volver al inicio de sesión
              </Link>
            </div>
          </form>
        </Form>
      </div>
    )
  }

  return (
    <div className="auth-card p-8">
      <div className="text-center space-y-3 mb-8">
        <img src="/logo.png" alt="NellaUp" className="h-10 mx-auto" />
          <p className="text-sm text-muted-foreground">
          Ingresa el código de verificación
        </p>
      </div>

      <div
        className="rounded-lg px-4 py-3 mb-6 text-xs"
        style={{
          background: 'rgba(140,40,250,0.08)',
          border: '1px solid rgba(140,40,250,0.2)',
          color: 'rgba(240,244,255,0.7)',
        }}
      >
        Si <span className="font-medium text-white">{submittedEmail}</span> está registrado,
        recibirás un código de verificación en tu correo. Revisa también la carpeta de spam.
      </div>

      <Form {...codeForm}>
        <form onSubmit={codeForm.handleSubmit(onCodeSubmit)} className="space-y-4">
          <FormField
            control={codeForm.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Código de verificación <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="000000"
                    maxLength={6}
                    className="auth-input tracking-[0.5em] text-center text-lg font-mono"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                      field.onChange(value)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={codeForm.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Nueva contraseña <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Mínimo 8 caracteres"
                      className="auth-input pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                {newPasswordValue && (
                  <div className="space-y-1 pt-1">
                    <div className="flex gap-1">
                      <div
                        className={`h-1 flex-1 rounded transition-colors ${
                          passwordStrength >= 1 ? 'bg-destructive' : 'bg-muted'
                        }`}
                      />
                      <div
                        className={`h-1 flex-1 rounded transition-colors ${
                          passwordStrength >= 2 ? 'bg-yellow-500' : 'bg-muted'
                        }`}
                      />
                      <div
                        className={`h-1 flex-1 rounded transition-colors ${
                          passwordStrength >= 3 ? 'bg-green-500' : 'bg-muted'
                        }`}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {passwordStrength === 1 && 'Débil'}
                      {passwordStrength === 2 && 'Media'}
                      {passwordStrength === 3 && 'Fuerte'}
                    </p>
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={codeForm.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Confirmar contraseña <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Repite tu nueva contraseña"
                      className="auth-input pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="btn-login"
            disabled={resetMutation.isPending}
          >
            {resetMutation.isPending ? (
              'Restableciendo...'
            ) : (
              <>
                <KeyRound className="h-4 w-4" />
                Restablecer contraseña
              </>
            )}
          </Button>

          <div className="text-center pt-2 space-y-2">
            <button
              type="button"
              onClick={handleRequestNewCode}
              className="block w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ¿No recibiste el código? Solicitar uno nuevo
            </button>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver al inicio de sesión
            </Link>
          </div>
        </form>
      </Form>
    </div>
  )
}
