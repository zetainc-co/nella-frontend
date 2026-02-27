import { useState, useRef, useCallback } from 'react'

interface UseMessageInputProps {
  onSend: (content: string) => void
  isPending: boolean
}

export function useMessageInput({ onSend, isPending }: UseMessageInputProps) {
  const [value, setValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || isPending) return

    onSend(trimmed)
    setValue('')

    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    textareaRef.current?.focus()
  }, [value, isPending, onSend])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  const handleInput = useCallback((e: React.FormEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [])

  return {
    value,
    setValue,
    isFocused,
    setIsFocused,
    textareaRef,
    handleSend,
    handleKeyDown,
    handleInput,
  }
}
