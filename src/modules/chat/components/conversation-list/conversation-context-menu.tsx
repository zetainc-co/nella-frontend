'use client'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { User, Tag, ChevronRight } from 'lucide-react'
import { AgentSelectorSubmenu } from '../shared/agent-selector-submenu'

interface ConversationContextMenuProps {
  conversationId: string
  position: { x: number; y: number }
  onClose: () => void
}

export function ConversationContextMenu({
  conversationId,
  position,
  onClose
}: ConversationContextMenuProps) {
  const [submenuOpen, setSubmenuOpen] = useState<string | null>(null)
  const [adjustedPosition, setAdjustedPosition] = useState(position)
  const menuRef = useRef<HTMLDivElement>(null)

  // Adjust position to prevent menu from going off-screen
  useEffect(() => {
    if (menuRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      let newX = position.x
      let newY = position.y

      // Adjust horizontal position if menu goes off right edge
      if (position.x + menuRect.width > viewportWidth) {
        newX = position.x - menuRect.width
      }

      // Adjust vertical position if menu goes off bottom edge
      if (position.y + menuRect.height > viewportHeight) {
        newY = viewportHeight - menuRect.height - 10
      }

      setAdjustedPosition({ x: newX, y: newY })
    }
  }, [position])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  // Close menu on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const menuContent = (
    <div
      ref={menuRef}
      className="
        fixed z-50
        min-w-[220px]
        bg-[#1a1a1a] border border-white/[0.1]
        rounded-lg shadow-xl
        py-1
      "
      style={{
        top: adjustedPosition.y,
        left: adjustedPosition.x,
      }}
    >
      {/* Asignar un agente */}
      <button
        onMouseEnter={() => setSubmenuOpen('agents')}
        className="
          w-full px-4 py-2 text-left
          text-sm text-[#f0f4ff]
          hover:bg-white/[0.05]
          transition-colors
          flex items-center justify-between gap-2
        "
      >
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-[#f0f4ff]/60" />
          <span>Asignar un agente</span>
        </div>
        <ChevronRight className="w-4 h-4 text-[#f0f4ff]/40" />
      </button>

      {/* Asignar etiqueta (disabled for now) */}
      <button
        disabled
        className="
          w-full px-4 py-2 text-left
          text-sm text-[#f0f4ff]/40
          cursor-not-allowed
          flex items-center justify-between gap-2
        "
      >
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-[#f0f4ff]/40" />
          <span>Asignar etiqueta</span>
        </div>
        <ChevronRight className="w-4 h-4 text-[#f0f4ff]/40" />
      </button>

      {/* Agent selector submenu */}
      {submenuOpen === 'agents' && (
        <AgentSelectorSubmenu
          conversationId={conversationId}
          onSelect={() => {
            setSubmenuOpen(null)
            onClose()
          }}
          position={{
            x: adjustedPosition.x - 320, // Menu width
            y: adjustedPosition.y - 300
          }}
        />
      )}
    </div>
  )

  return createPortal(menuContent, document.body)
}
