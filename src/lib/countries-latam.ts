// src/lib/countries-latam.ts

import { Country, Industry } from '@/types'

export const LATAM_COUNTRIES: Country[] = [
  { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷' },
  { code: 'BO', name: 'Bolivia', dialCode: '+591', flag: '🇧🇴' },
  { code: 'BR', name: 'Brasil', dialCode: '+55', flag: '🇧🇷' },
  { code: 'CL', name: 'Chile', dialCode: '+56', flag: '🇨🇱' },
  { code: 'CO', name: 'Colombia', dialCode: '+57', flag: '🇨🇴' },
  { code: 'CR', name: 'Costa Rica', dialCode: '+506', flag: '🇨🇷' },
  { code: 'CU', name: 'Cuba', dialCode: '+53', flag: '🇨🇺' },
  { code: 'DO', name: 'República Dominicana', dialCode: '+1-809', flag: '🇩🇴' },
  { code: 'EC', name: 'Ecuador', dialCode: '+593', flag: '🇪🇨' },
  { code: 'SV', name: 'El Salvador', dialCode: '+503', flag: '🇸🇻' },
  { code: 'GT', name: 'Guatemala', dialCode: '+502', flag: '🇬🇹' },
  { code: 'HN', name: 'Honduras', dialCode: '+504', flag: '🇭🇳' },
  { code: 'MX', name: 'México', dialCode: '+52', flag: '🇲🇽' },
  { code: 'NI', name: 'Nicaragua', dialCode: '+505', flag: '🇳🇮' },
  { code: 'PA', name: 'Panamá', dialCode: '+507', flag: '🇵🇦' },
  { code: 'PY', name: 'Paraguay', dialCode: '+595', flag: '🇵🇾' },
  { code: 'PE', name: 'Perú', dialCode: '+51', flag: '🇵🇪' },
  { code: 'PR', name: 'Puerto Rico', dialCode: '+1-787', flag: '🇵🇷' },
  { code: 'UY', name: 'Uruguay', dialCode: '+598', flag: '🇺🇾' },
  { code: 'VE', name: 'Venezuela', dialCode: '+58', flag: '🇻🇪' },
]

export const INDUSTRIES: Industry[] = [
  { value: 'real-estate', label: 'Real Estate / Inmobiliaria' },
  { value: 'education', label: 'Educación' },
  { value: 'health', label: 'Salud y Wellness' },
  { value: 'marketing', label: 'Marketing y Agencias' },
  { value: 'saas', label: 'SaaS / Tecnología' },
  { value: 'ecommerce', label: 'E-commerce / Retail' },
  { value: 'professional-services', label: 'Servicios Profesionales' },
  { value: 'construction', label: 'Construcción' },
  { value: 'automotive', label: 'Automotriz' },
  { value: 'tourism', label: 'Turismo y Hospitalidad' },
  { value: 'insurance', label: 'Seguros' },
  { value: 'finance', label: 'Finanzas' },
  { value: 'legal', label: 'Legal' },
  { value: 'other', label: 'Otro (especificar)' },
]

export const COMPANY_SIZES = [
  { value: '1-10', label: '1-10 empleados' },
  { value: '11-50', label: '11-50 empleados' },
  { value: '51-200', label: '51-200 empleados' },
  { value: '200+', label: 'Más de 200 empleados' },
]
