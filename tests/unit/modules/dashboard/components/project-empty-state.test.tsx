import { render, screen, fireEvent } from '@testing-library/react'
import { ProjectEmptyState } from '@/components/dashboard/project-empty-state'

describe('ProjectEmptyState', () => {
  it('renders heading and CTA button', () => {
    const handleClick = vi.fn()
    render(<ProjectEmptyState onCreateClick={handleClick} />)
    expect(screen.getByText('Aún no tienes proyectos')).toBeInTheDocument()
    expect(screen.getByText('Crear Primer Proyecto')).toBeInTheDocument()
  })

  it('calls onCreateClick when button is clicked', () => {
    const handleClick = vi.fn()
    render(<ProjectEmptyState onCreateClick={handleClick} />)
    fireEvent.click(screen.getByText('Crear Primer Proyecto'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
