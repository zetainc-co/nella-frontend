'use client';

import type { SalesTeamTableProps } from '@/modules/dashboard/types/dashboard-types';

export function SalesTeamTable({ salesTeam, isLoading }: SalesTeamTableProps) {
  if (isLoading) {
    return (
      <div
        className="rounded-2xl p-6"
        style={{
          background: 'rgba(18, 18, 18, 0.85)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        }}
      >
        <div className="h-6 w-40 bg-white/10 rounded animate-pulse mb-2" />
        <div className="h-4 w-56 bg-white/5 rounded animate-pulse mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-white/5 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-6 transition-all duration-300 hover:translate-y-[-2px]"
      style={{
        background: 'rgba(18, 18, 18, 0.85)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold" style={{ color: '#f0f4ff' }}>
          Equipo de Ventas
        </h3>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(240,244,255,0.45)' }}>
          Rendimiento individual del equipo
        </p>
      </div>

      {/* Table */}
      <div>
        {/* Table Header */}
        <div className="grid grid-cols-4 gap-4 pb-3 mb-3 text-sm" style={{ color: 'rgba(240,244,255,0.5)' }}>
          <div>Vendedor</div>
          <div className="text-center">Ventas</div>
          <div className="text-center">Tasa %</div>
          <div className="text-right">Tiempo Respuesta</div>
        </div>

        {/* Table Rows */}
        {salesTeam.length === 0 ? (
          <div className="py-12 text-center">
            <p style={{ color: 'rgba(240,244,255,0.45)' }}>No hay datos del equipo de ventas</p>
          </div>
        ) : (
          <div className="space-y-0">
            {salesTeam.map((member, index) => (
              <div
                key={member.userId}
                className="grid grid-cols-4 gap-4 py-4 transition-colors duration-200"
                style={{
                  borderBottom: index < salesTeam.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}
              >
                <div className="font-medium" style={{ color: '#f0f4ff' }}>
                  {member.name}
                </div>
                <div className="text-center font-bold text-white">
                  {member.sales}
                </div>
                <div className="text-center font-semibold" style={{ color: '#10b981' }}>
                  {member.conversionRate.toFixed(1)}%
                </div>
                <div className="text-right" style={{ color: 'rgba(240,244,255,0.6)' }}>
                  {member.avgResponseTime} min
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
