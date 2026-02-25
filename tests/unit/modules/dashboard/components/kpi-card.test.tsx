import { render, screen } from '@testing-library/react'
import { KpiCard } from '@/modules/dashboard/components/kpi-card'
import { Users } from 'lucide-react'

describe('KpiCard', () => {
  it('renders title and value', () => {
    render(<KpiCard title="Total Leads" value="142" icon={Users} />)
    expect(screen.getByText('Total Leads')).toBeInTheDocument()
    expect(screen.getByText('142')).toBeInTheDocument()
  })

  it('shows skeleton when loading and hides value', () => {
    render(<KpiCard title="Total Leads" value="142" icon={Users} loading />)
    expect(screen.queryByText('142')).not.toBeInTheDocument()
    expect(screen.getByText('Total Leads')).toBeInTheDocument()
  })
})
