'use client'

import { useState } from 'react'

export function useLoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      // TODO: Conectar con Supabase
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simular delay

      setMessage({ type: 'success', text: 'Conexión exitosa! Usuario: ' + email })
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
