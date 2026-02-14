// src/lib/registration-validations.ts

import { z } from 'zod'

// Step 1: Datos de Empresa
export const step1Schema = z.object({
  companyName: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'Máximo 100 caracteres'),

  industry: z.string()
    .min(1, 'Selecciona una industria'),

  industryOther: z.string().optional(),

  companySize: z.enum(['1-10', '11-50', '51-200', '200+'], {
    message: 'Selecciona el tamaño de tu empresa'
  }),

  country: z.string()
    .min(1, 'Selecciona un país')
}).refine(
  (data) => {
    // Si selecciona "Otro", debe especificar
    if (data.industry === 'other' && !data.industryOther) {
      return false
    }
    return true
  },
  {
    message: 'Especifica tu industria',
    path: ['industryOther']
  }
)

// Step 2: Datos del Admin
export const step2Schema = z.object({
  fullName: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'Máximo 100 caracteres'),

  email: z.string()
    .email('Email inválido')
    .toLowerCase(),

  phone: z.string()
    .min(10, 'El teléfono debe tener al menos 10 dígitos')
    .regex(/^[0-9+\s()-]+$/, 'Solo números y símbolos válidos'),

  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),

  confirmPassword: z.string()
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword']
  }
)

// Step 3: Configuración de Producto
export const step3Schema = z.object({
  offeringType: z.enum(['product', 'service'], {
    message: 'Selecciona qué vendes'
  }),

  description: z.string()
    .max(500, 'Máximo 500 caracteres')
    .optional(),

  priceRange: z.string()
    .max(50, 'Máximo 50 caracteres')
    .optional(),

  idealCustomer: z.string()
    .max(1000, 'Máximo 1000 caracteres')
    .optional()
})

// Step 4: Conexión WhatsApp
export const step4Schema = z.object({
  whatsappNumber: z.string()
    .regex(/^\+[1-9]\d{1,14}$/, 'Formato inválido. Debe ser +[código][número]'),

  whatsappToken: z.string()
    .min(200, 'El token debe tener al menos 200 caracteres')
    .max(500, 'El token no debe exceder 500 caracteres')
})

// Schema completo
export const registrationSchema = z.object({
  ...step1Schema.shape,
  ...step2Schema.shape,
  ...step3Schema.shape,
  ...step4Schema.shape
})

// Función para calcular fuerza de contraseña
export function calculatePasswordStrength(password: string): number {
  let strength = 0

  if (password.length >= 8) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++ // Caracteres especiales

  return Math.min(strength, 3) // Max 3
}
