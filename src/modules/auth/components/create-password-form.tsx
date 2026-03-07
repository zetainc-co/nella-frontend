'use client';

import { Button } from '@/components/ui/button';
import { ChevronRight, Eye, EyeOff } from 'lucide-react';
import { useCreatePassword } from '@/modules/auth/hooks/useCreatePassword';

import type { CreatePasswordFormProps } from '@/modules/auth/types/auth-types'

export function CreatePasswordForm({ token, email }: CreatePasswordFormProps) {
  const {
    form,
    passwordStrength,
    isSubmitting,
    error,
    tokenExpired,
    showPassword,
    showConfirmPassword,
    password,
    onSubmit,
    handleResendActivation,
    toggleShowPassword,
    toggleShowConfirmPassword,
  } = useCreatePassword(token, email)

  const { register, handleSubmit, formState: { errors } } = form

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{error}</p>
          {tokenExpired && (
            <Button
              type="button"
              variant="outline"
              className="mt-3 w-full"
              onClick={handleResendActivation}
            >
              Reenviar email de activación
            </Button>
          )}
        </div>
      )}

      <div className="space-y-4">
        {/* Email (readonly) */}
        <div className="space-y-2">
          <label htmlFor="email" className="tech-label">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            disabled
            className="tech-input opacity-60 cursor-not-allowed"
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label htmlFor="password" className="tech-label">
            Contraseña <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              placeholder="••••••••"
              className={`tech-input pr-12 ${errors.password ? 'border-destructive' : ''}`}
            />
            <button
              type="button"
              onClick={toggleShowPassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}

          {/* Password strength indicator */}
          {password && (
            <div className="space-y-1">
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
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="tech-label">
            Confirmar contraseña <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              {...register('confirmPassword')}
              placeholder="••••••••"
              className={`tech-input pr-12 ${errors.confirmPassword ? 'border-destructive' : ''}`}
            />
            <button
              type="button"
              onClick={toggleShowConfirmPassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full gap-2"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Creando contraseña...' : 'Crear contraseña'}
        {!isSubmitting && <ChevronRight className="h-4 w-4" />}
      </Button>
    </form>
  );
}
