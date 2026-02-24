// src/lib/countries-latam.ts

import { Country, Industry } from '@/modules/auth/types/auth-types'

export const LATAM_COUNTRIES: Country[] = [
  { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷', placeholder: '11 2345 6789' },
  { code: 'BO', name: 'Bolivia', dialCode: '+591', flag: '🇧🇴', placeholder: '712 34567' },
  { code: 'BR', name: 'Brasil', dialCode: '+55', flag: '🇧🇷', placeholder: '11 91234 5678' },
  { code: 'CL', name: 'Chile', dialCode: '+56', flag: '🇨🇱', placeholder: '9 1234 5678' },
  { code: 'CO', name: 'Colombia', dialCode: '+57', flag: '🇨🇴', placeholder: '300 123 4567' },
  { code: 'CR', name: 'Costa Rica', dialCode: '+506', flag: '🇨🇷', placeholder: '8312 3456' },
  { code: 'CU', name: 'Cuba', dialCode: '+53', flag: '🇨🇺', placeholder: '5 123 4567' },
  { code: 'DO', name: 'República Dominicana', dialCode: '+1-809', flag: '🇩🇴', placeholder: '234 5678' },
  { code: 'EC', name: 'Ecuador', dialCode: '+593', flag: '🇪🇨', placeholder: '99 123 4567' },
  { code: 'SV', name: 'El Salvador', dialCode: '+503', flag: '🇸🇻', placeholder: '7123 4567' },
  { code: 'GT', name: 'Guatemala', dialCode: '+502', flag: '🇬🇹', placeholder: '5123 4567' },
  { code: 'HN', name: 'Honduras', dialCode: '+504', flag: '🇭🇳', placeholder: '9123 4567' },
  { code: 'MX', name: 'México', dialCode: '+52', flag: '🇲🇽', placeholder: '55 1234 5678' },
  { code: 'NI', name: 'Nicaragua', dialCode: '+505', flag: '🇳🇮', placeholder: '8123 4567' },
  { code: 'PA', name: 'Panamá', dialCode: '+507', flag: '🇵🇦', placeholder: '6123 4567' },
  { code: 'PY', name: 'Paraguay', dialCode: '+595', flag: '🇵🇾', placeholder: '981 123456' },
  { code: 'PE', name: 'Perú', dialCode: '+51', flag: '🇵🇪', placeholder: '912 345 678' },
  { code: 'PR', name: 'Puerto Rico', dialCode: '+1-787', flag: '🇵🇷', placeholder: '234 5678' },
  { code: 'UY', name: 'Uruguay', dialCode: '+598', flag: '🇺🇾', placeholder: '94 123 456' },
  { code: 'VE', name: 'Venezuela', dialCode: '+58', flag: '🇻🇪', placeholder: '412 1234567' },
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
  { value: '1-10', label: '1-10' },
  { value: '11-50', label: '11-50' },
  { value: '51-200', label: '51-200' },
  { value: '201-500', label: '201-500' },
  { value: '501-1000', label: '501-1000' },
  { value: '1000+', label: '1000+' },
]
