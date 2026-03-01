'use client'
import { useAgents } from '../../hooks/use-agents'
import { useAssignAgent } from '../../hooks/use-assign-agent'
import { User, Loader2 } from 'lucide-react'

interface AgentSelectorSubmenuProps {
  conversationId: number
  onSelect: () => void
  position?: { x: number; y: number }
}

export function AgentSelectorSubmenu({
  conversationId,
  onSelect,
  position = { x: 0, y: 0 }
}: AgentSelectorSubmenuProps) {
  const { data: agents, isLoading } = useAgents()
  const { assignAgent, isAssigning } = useAssignAgent(conversationId)

  const handleSelect = (agentId: number | null) => {
    assignAgent(agentId)
    onSelect()
  }

  return (
    <div
      className="
        absolute z-50
        min-w-[200px]
        bg-[#1a1a1a] border border-white/[0.1]
        rounded-lg shadow-xl
        py-1
      "
      style={{
        top: position.y,
        left: position.x + 10, // Offset to right of main menu
      }}
    >
      {/* None option - unassign */}
      <button
        onClick={() => handleSelect(null)}
        disabled={isAssigning}
        className="
          w-full px-4 py-2 text-left
          text-sm text-[#f0f4ff]/60
          hover:bg-white/[0.05]
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
        "
      >
        None
      </button>

      <div className="border-t border-white/[0.06] my-1" />

      {/* Agent list */}
      {isLoading ? (
        <div className="px-4 py-2 flex items-center gap-2 text-[#f0f4ff]/40">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Cargando agentes...</span>
        </div>
      ) : agents && agents.length > 0 ? (
        agents.map(agent => (
          <button
            key={agent.id}
            onClick={() => handleSelect(agent.id)}
            disabled={isAssigning}
            className="
              w-full px-4 py-2 text-left
              text-sm text-[#f0f4ff]
              hover:bg-white/[0.05]
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
              flex items-center gap-2
            "
          >
            <User className="w-4 h-4 text-[#f0f4ff]/60" />
            <span>{agent.name}</span>
          </button>
        ))
      ) : (
        <div className="px-4 py-2 text-sm text-[#f0f4ff]/40">
          No hay agentes disponibles
        </div>
      )}
    </div>
  )
}
