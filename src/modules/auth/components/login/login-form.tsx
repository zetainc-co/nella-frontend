"use client"

import { useState } from 'react'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, LogIn } from 'lucide-react'
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
import { Separator } from '@/components/ui/separator'
import { SocialAuthButtons } from './social-auth-buttons'
import { loginSchema, type LoginFormData } from '@/lib/auth/auth-validations'
import { useLogin } from '@/modules/auth/hooks/useLogin'
import { toast } from 'sonner'

interface LoginFormProps {
  tenantSlug?: string
}

export function LoginForm({ tenantSlug }: LoginFormProps) {
  const loginMutation = useLogin()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(
      { email: data.email, password: data.password },
      {
        onSuccess: ({ session }) => {
          toast.success('Bienvenido', {
            description: `Sesión iniciada como ${session.fullName}`,
          })
          // Full URL redirect to the tenant subdomain dashboard
          const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost'
          const port = window.location.port
          const portSuffix = port ? `:${port}` : ''
          const protocol = window.location.protocol
          window.location.href = `${protocol}//${session.tenantSlug}.${appDomain}${portSuffix}/dashboard`
        },
      }
    )
  }

  return (
    <div className="auth-card p-8">
      {/* Branding — inside card */}
      <div className="text-center space-y-1.5 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Nella<span style={{ color: '#9EFF00' }}>Sales</span>
        </h1>
        <p className="text-sm" style={{ color: 'rgba(240,244,255,0.5)' }}>
          Inicia sesión en tu cuenta
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

          <FormField
            control={form.control}
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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Contraseña <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Ingresa tu contraseña"
                      className="auth-input pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="text-right">
            <a
              href="/forgot-password"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <Button type="submit" className="btn-login" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? (
              'Cargando...'
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Iniciar Sesión
              </>
            )}
          </Button>

          <div className="relative my-5">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              o continúa con
            </span>
          </div>

          <SocialAuthButtons />

          {/* Footer link — inside card */}
          <div className="text-center text-sm pt-2">
            <span style={{ color: 'rgba(240,244,255,0.5)' }}>¿No tienes una cuenta? </span>
            <Link
              href="/register"
              className="font-medium hover:underline transition-colors"
              style={{ color: '#9EFF00' }}
            >
              Regístrate aquí
            </Link>
          </div>
        </form>
      </Form>
    </div>
  )
}
