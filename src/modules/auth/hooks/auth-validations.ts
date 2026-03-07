import * as z from 'zod'
import type { CompanySize } from '@/modules/auth/types/auth-types'

// Login Schema
export const loginSchema = z.object({
  email: z.string().min(1, 'El email es requerido').email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// Registration Step 1 Schema
const companySizeValues: CompanySize[] = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']

export const registrationStep1Schema = z.object({
  companyName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede superar 100 caracteres'),
  industry: z.string().min(1, 'Selecciona una industria'),
  industryOther: z.string().optional(),
  companySize: z.enum(companySizeValues as [CompanySize, ...CompanySize[]], {
    message: 'Selecciona el tamaño de tu empresa',
  }),
  country: z.string().min(2, 'Selecciona tu país').max(2, 'Código de país inválido'),
})

// Registration Step 2 Schema
export const registrationStep2Schema = z.object({
  fullName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede superar 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/, 'El nombre solo puede contener letras, espacios, guiones y apóstrofes'),
  email: z.string().min(1, 'El email es requerido').email('Email inválido').toLowerCase(),
  phone: z
    .string()
    .min(10, 'El teléfono debe tener al menos 10 dígitos')
    .max(16, 'El teléfono no puede superar 16 caracteres')
    .regex(/^\+[1-9]\d{7,14}$/, 'Número de teléfono inválido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña no puede superar 100 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Debe contener al menos una mayúscula, una minúscula y un número'
    ),
  confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

// Registration Step 3 Schema
export const registrationStep3Schema = z.object({
  offeringType: z.enum(['product', 'service'], {
    message: 'Selecciona qué vendes',
  }),
  description: z.string().max(500, 'La descripción no puede superar 500 caracteres').optional(),
  priceRange: z.string().optional(),
  idealCustomer: z.string().max(1000, 'La descripción no puede superar 1000 caracteres').optional(),
})

// Registration Step 4 Schema
export const registrationStep4Schema = z.object({
  whatsappNumber: z
    .string()
    .min(1, 'El número de WhatsApp es requerido')
    .regex(/^\+[1-9]\d{1,14}$/, 'Formato E.164 requerido (ej: +573001234567)'),
})

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'El email es requerido').email('Email inválido'),
})

// Reset Password With Code Schema (forgot-password flow)
export const resetPasswordWithCodeSchema = z.object({
  code: z
    .string()
    .length(6, 'El código debe tener 6 dígitos')
    .regex(/^[0-9]+$/, 'El código solo puede contener números'),
  newPassword: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña no puede superar 100 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Debe contener al menos una mayúscula, una minúscula y un número'
    ),
  confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

// Reset Password Schema
export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña no puede superar 100 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Debe contener al menos una mayúscula, una minúscula y un número'
    ),
  confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

// Email Verification Schema
export const emailVerificationSchema = z.object({
  code: z
    .string()
    .length(6, 'El código debe tener 6 dígitos')
    .regex(/^[0-9]+$/, 'El código solo puede contener números'),
})

export type RegistrationStep1Data = z.infer<typeof registrationStep1Schema>
export type RegistrationStep2Data = z.infer<typeof registrationStep2Schema>
export type RegistrationStep3Data = z.infer<typeof registrationStep3Schema>
export type RegistrationStep4Data = z.infer<typeof registrationStep4Schema>
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordWithCodeData = z.infer<typeof resetPasswordWithCodeSchema>
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>
export type EmailVerificationData = z.infer<typeof emailVerificationSchema>

// Create Password Schema (used in create-password flow)
export const createPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

export type CreatePasswordFormData = z.infer<typeof createPasswordSchema>

// Password strength calculator
export function calculatePasswordStrength(password: string): number {
  let strength = 0
  if (password.length >= 8) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++
  return Math.min(strength, 3)
}
