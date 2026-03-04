'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createPasswordSchema, calculatePasswordStrength, CreatePasswordFormData } from '@/lib/validations/create-password-schema';
import { ChevronRight, Eye, EyeOff } from 'lucide-react';

interface CreatePasswordFormProps {
  token: string;
  email: string;
}

export function CreatePasswordForm({ token, email }: CreatePasswordFormProps) {
  const router = useRouter();
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreatePasswordFormData>({
    resolver: zodResolver(createPasswordSchema),
  });

  const password = watch('password');

  // Calculate password strength
  useEffect(() => {
    if (password) {
      setPasswordStrength(calculatePasswordStrength(password));
    } else {
      setPasswordStrength(0);
    }
  }, [password]);

  const onSubmit = async (data: CreatePasswordFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 410) {
          setTokenExpired(true);
          setError('El link de activación expiró');
        } else if (response.status === 409) {
          router.push('/login?message=account-already-activated');
        } else {
          setError(result.message || 'Error al crear la contraseña');
        }
        return;
      }

      // Success - redirect to tenant login
      const { tenantSlug } = result.data;
      if (!tenantSlug) {
        setError('Error al obtener información del tenant');
        return;
      }

      // Build tenant-specific login URL
      const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost';
      const port = appDomain === 'localhost' ? ':3001' : '';
      const protocol = appDomain === 'localhost' ? 'http' : 'https';
      const loginUrl = `${protocol}://${tenantSlug}.${appDomain}${port}/login?email=${encodeURIComponent(email)}&message=account-activated`;

      // Redirect to tenant login
      window.location.href = loginUrl;
    } catch (err) {
      setError('Error de conexión. Intenta nuevamente');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendActivation = async () => {
    try {
      const response = await fetch('/api/auth/resend-activation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        router.push(`/login?message=activation-resent&email=${encodeURIComponent(email)}`);
      }
    } catch (err) {
      setError('Error al reenviar el email');
    }
  };

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
              onClick={() => setShowPassword(!showPassword)}
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
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
