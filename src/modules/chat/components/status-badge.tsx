import type { AgentMode } from '../types'
import { Bot, User } from 'lucide-react'

interface StatusBadgeProps {
  mode: AgentMode
  size?: 'sm' | 'md'
}

export function StatusBadge({ mode, size = 'sm' }: StatusBadgeProps) {
  const isAI = mode === 'ai'
  const styles = isAI
    ? {
        bg: 'rgba(158,255,0,0.10)',
        text: '#9EFF00',
        border: 'rgba(158,255,0,0.22)',
      }
    : {
        bg: 'rgba(251,146,60,0.10)',
        text: '#fb923c',
        border: 'rgba(251,146,60,0.22)',
      }

  const iconSize = size === 'sm' ? 10 : 12
  const padding = size === 'sm' ? '2px 7px' : '3px 9px'
  const fontSize = size === 'sm' ? 11 : 12

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding,
        borderRadius: 99,
        background: styles.bg,
        border: `1px solid ${styles.border}`,
        color: styles.text,
        fontSize,
        fontWeight: 600,
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
      }}
    >
      {isAI ? <Bot size={iconSize} /> : <User size={iconSize} />}
      {isAI ? 'IA Activa' : 'Humano'}
    </span>
  )
}
