'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import { useCreateProject } from '@/modules/dashboard/hooks/useProjects'
import { toast } from 'sonner'

export function useCreateProjectForm(onClose: () => void, onCreated: (projectId: string) => void) {
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState('')
  const [emailEntries, setEmailEntries] = useState([{ id: crypto.randomUUID(), value: '' }])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { mutateAsync: createProject } = useCreateProject()

  function resetAndClose() {
    setName('')
    setNameError('')
    setEmailEntries([{ id: crypto.randomUUID(), value: '' }])
    onClose()
  }

  function addEmailField() {
    if (emailEntries.length < 5) setEmailEntries(prev => [...prev, { id: crypto.randomUUID(), value: '' }])
  }

  function updateEmail(id: string, value: string) {
    setEmailEntries(prev => prev.map(e => e.id === id ? { ...e, value } : e))
  }

  function removeEmail(id: string) {
    if (emailEntries.length === 1) { setEmailEntries([{ id: crypto.randomUUID(), value: '' }]); return }
    setEmailEntries(prev => prev.filter(e => e.id !== id))
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setNameError('')
    if (!name.trim()) { setNameError('El nombre es requerido'); return }

    setIsSubmitting(true)
    try {
      const project = await createProject(name.trim())

      const validEmails = emailEntries.map(e => e.value.trim()).filter(Boolean)
      if (validEmails.length > 0) {
        // TODO: POST /api/projects/:id/invite when endpoint is ready
        await new Promise(r => setTimeout(r, 200))
        toast.success('¡Invitaciones enviadas!', {
          description: `Se notificará a ${validEmails.length} vendedor${validEmails.length > 1 ? 'es' : ''}.`,
        })
      }

      onCreated(project.id)
      resetAndClose()
    } catch {
      setNameError('Error al crear el proyecto. Intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleSkip() {
    resetAndClose()
  }

  return {
    name,
    setName,
    nameError,
    emailEntries,
    isSubmitting,
    resetAndClose,
    addEmailField,
    updateEmail,
    removeEmail,
    handleSubmit,
    handleSkip,
  }
}
