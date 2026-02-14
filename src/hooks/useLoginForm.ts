'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@/types'
import { createSession } from '@/lib/registration-storage'

const STORAGE_KEYS = {
  USERS: 'nella_users',
  SESSION: 'nella_session',
}

export function useLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Buscar usuario en localStorage
      const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]')
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())

      if (!user) {
        setMessage({ type: 'error', text: 'Email no registrado' })
        return
      }

      // Validar contraseña
      if (user.password !== password) {
        setMessage({ type: 'error', text: 'Contraseña incorrecta' })
        return
      }

      // Verificar email verificado
      if (!user.emailVerified) {
        setMessage({
          type: 'error',
          text: 'Debes verificar tu email antes de iniciar sesión'
        })
        return
      }

      // Crear sesión
      createSession(user)

      // Redirigir a dashboard
      setMessage({ type: 'success', text: 'Inicio de sesión exitoso' })

      setTimeout(() => {
        router.push('/dashboard')
      }, 500)
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Error: ' + error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      // TODO: Conectar con Supabase
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simular delay

      setMessage({ type: 'success', text: 'Usuario registrado! Verifica tu email.' })
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Error: ' + error.message })
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async () => {
    setLoading(true)
    setMessage(null)

    try {
      // TODO: Conectar con Supabase
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simular delay

      setMessage({
        type: 'success',
        text: 'Conexión a Supabase OK! Sin sesión activa (modo demo)',
      })
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Error de conexión: ' + error.message })
    } finally {
      setLoading(false)
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    message,
    handleLogin,
    handleSignUp,
    testConnection,
  }
}
