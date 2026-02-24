// src/app/(dashboard)/configuracion/workflows/page.tsx
"use client"

import { useState, useEffect } from 'react'
import { useWorkflow } from '@/modules/workflows/hooks/useWorkflow'
import { WorkflowStatusBadge } from '@/modules/workflows/components/workflow-status-badge'
import { Button } from '@/components/ui/button'
import {
  Workflow,
  Settings,
  Key,
  Shield,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

export default function PanelDeControlPage() {
  const { data: workflow, isLoading } = useWorkflow()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const userRole = localStorage.getItem('user_role')
    setIsAdmin(userRole === 'admin')
  }, [])

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="auth-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded border border-primary/40 bg-primary/10">
              <Workflow className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Panel de Control</h1>
              <p className="text-sm text-muted-foreground">
                Vista general de workflows y acceso rápido
              </p>
            </div>
          </div>

          {workflow && <WorkflowStatusBadge status={workflow.status} />}
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={<Activity className="h-5 w-5" />}
          label="Estado del Workflow"
          value={isLoading ? '--' : (workflow?.status === 'active' ? 'Activo' : 'Inactivo')}
          valueColor={workflow?.status === 'active' ? 'text-green-500' : 'text-muted-foreground'}
          trend={null}
        />

        <MetricCard
          icon={<Clock className="h-5 w-5" />}
          label="Última Ejecución"
          value={isLoading ? '--' : 'Hace 2 horas'}
          valueColor="text-foreground"
          trend={null}
        />

        <MetricCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Credenciales"
          value={isLoading ? '--' : 'Validadas'}
          valueColor="text-green-500"
          trend={null}
        />

        <MetricCard
          icon={<Workflow className="h-5 w-5" />}
          label="Versión Template"
          value={isLoading ? '--' : (workflow?.template_version || 'v1.0.0')}
          valueColor="text-foreground"
          trend={null}
        />
      </div>

      {/* Acceso Rápido */}
      <div className="auth-card p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground">Acceso Rápido</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Navega a las diferentes secciones de gestión
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <QuickAccessCard
            href="/configuracion/workflows/gestion"
            icon={<Settings className="h-6 w-6" />}
            title="Gestión"
            description="Configuración y estado del workflow individual"
            iconBg="bg-primary/10"
            iconBorder="border-primary/40"
            iconColor="text-primary"
          />

          <QuickAccessCard
            href="/configuracion/conexiones"
            icon={<Key className="h-6 w-6" />}
            title="Conexiones"
            description="Gestión de integraciones y credenciales"
            iconBg="bg-blue-500/10"
            iconBorder="border-blue-500/40"
            iconColor="text-blue-500"
          />

          {isAdmin && (
            <QuickAccessCard
              href="/configuracion/administracion"
              icon={<Shield className="h-6 w-6" />}
              title="Administración"
              description="Herramientas administrativas y migraciones"
              iconBg="bg-yellow-500/10"
              iconBorder="border-yellow-500/40"
              iconColor="text-yellow-500"
              badge="ADMIN"
            />
          )}
        </div>
      </div>

      {/* Información del Workflow Actual */}
      {workflow && (
        <div className="auth-card p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-6 w-6 text-primary" />
              <div>
                <h3 className="text-lg font-bold text-foreground">Workflow Actual</h3>
                <p className="text-sm text-muted-foreground">
                  Información básica del workflow configurado
                </p>
              </div>
            </div>

            <Link href="/configuracion/workflows/gestion">
              <Button variant="outline" size="sm" className="gap-2">
                Ver Detalles
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <InfoItem
              label="Nombre"
              value={workflow.workflow_name}
              mono={false}
            />
            <InfoItem
              label="N8n Workflow ID"
              value={workflow.n8n_workflow_id}
              mono={true}
            />
            <InfoItem
              label="Template Version"
              value={workflow.template_version}
              mono={true}
            />
          </div>
        </div>
      )}
    </div>
  )
}

interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: string
  valueColor: string
  trend: { value: string; positive: boolean } | null
}

function MetricCard({ icon, label, value, valueColor, trend }: MetricCardProps) {
  return (
    <div className="auth-card p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded border border-primary/40 bg-primary/10 text-primary">
            {icon}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={`text-lg font-bold font-mono ${valueColor}`}>{value}</p>
          </div>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs ${trend.positive ? 'text-green-500' : 'text-red-500'}`}>
            <TrendingUp className="h-3 w-3" />
            <span>{trend.value}</span>
          </div>
        )}
      </div>
    </div>
  )
}

interface QuickAccessCardProps {
  href: string
  icon: React.ReactNode
  title: string
  description: string
  iconBg: string
  iconBorder: string
  iconColor: string
  badge?: string
}

function QuickAccessCard({ href, icon, title, description, iconBg, iconBorder, iconColor, badge }: QuickAccessCardProps) {
  return (
    <Link href={href}>
      <div className="relative border border-border bg-card rounded-lg p-4 hover:border-primary/40 hover:bg-accent transition-all cursor-pointer group">
        <div className="flex items-start justify-between mb-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded border ${iconBorder} ${iconBg} ${iconColor}`}>
            {icon}
          </div>
          {badge && (
            <div className="rounded border border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5">
              <span className="text-[10px] font-mono text-yellow-500">{badge}</span>
            </div>
          )}
        </div>

        <h3 className="text-base font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground">
          {description}
        </p>

        <div className="mt-3 flex items-center gap-2 text-primary text-sm font-medium">
          <span>Acceder</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  )
}

interface InfoItemProps {
  label: string
  value: string
  mono: boolean
}

function InfoItem({ label, value, mono }: InfoItemProps) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`text-foreground ${mono ? 'font-mono' : 'font-medium'}`}>{value}</p>
    </div>
  )
}
