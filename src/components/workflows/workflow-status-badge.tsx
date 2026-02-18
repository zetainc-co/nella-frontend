// src/components/workflows/workflow-status-badge.tsx
interface WorkflowStatusBadgeProps {
  status?: 'active' | 'inactive'
}

export function WorkflowStatusBadge({ status = 'active' }: WorkflowStatusBadgeProps) {
  return (
    <span className={`
      inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium
      ${status === 'active'
        ? 'bg-green-500/10 text-green-600 border border-green-500/30'
        : 'bg-gray-500/10 text-gray-600 border border-gray-500/30'
      }
    `}>
      <span className={`size-2 rounded-full ${status === 'active' ? 'bg-green-500' : 'bg-gray-500'} animate-pulse`} />
      {status === 'active' ? 'Activo' : 'Inactivo'}
    </span>
  )
}
