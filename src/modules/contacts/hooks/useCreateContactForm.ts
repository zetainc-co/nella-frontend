'use client'

import { useState, useEffect } from 'react'
import { useCreateContact, useUpdateContact } from '@/modules/contacts/hooks/useContacts'
import { useProjectStore } from '@/core/store/project-store'
import type { ContactDetail } from '@/modules/contacts/types/contact-types'

const EMPTY_FORM = {
  name: '', email: '', phone: '', channel: '',
}

export function useCreateContactForm(
  open: boolean,
  contact: ContactDetail | null | undefined,
  onOpenChange: (open: boolean) => void
) {
  const createContact = useCreateContact()
  const updateContact = useUpdateContact()
  const isEditMode = !!contact

  const [form, setForm] = useState(EMPTY_FORM)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    if (open && contact) {
      setForm({
        name: contact.name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        channel: contact.channel || '',
      })
      setTags(contact.tags || [])
    } else if (open && !contact) {
      setForm(EMPTY_FORM)
      setTags([])
    }
  }, [open, contact])

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const addTag = () => {
    const trimmed = tagInput.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const isPending = createContact.isPending || updateContact.isPending

  const handleSubmit = () => {
    const onSuccess = () => {
      onOpenChange(false)
      setForm(EMPTY_FORM)
      setTags([])
    }

    const selectedProjectId = useProjectStore.getState().selectedProjectId

    if (isEditMode) {
      updateContact.mutate(
        {
          id: Number(contact!.id),
          payload: {
            name: form.name || undefined,
            email: form.email || undefined,
            tags: tags.length > 0 ? tags : undefined,
          },
        },
        { onSuccess }
      )
    } else {
      createContact.mutate(
        {
          phone: form.phone,
          name: form.name || undefined,
          email: form.email || undefined,
          tags: tags.length > 0 ? tags : undefined,
          project_id: selectedProjectId || undefined,
        },
        { onSuccess }
      )
    }
  }

  return {
    form,
    tags,
    tagInput,
    setTagInput,
    isEditMode,
    isPending,
    updateField,
    addTag,
    removeTag,
    handleTagKeyDown,
    handleSubmit,
  }
}
