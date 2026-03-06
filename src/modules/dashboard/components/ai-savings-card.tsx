'use client';

import { Sparkles } from 'lucide-react';
import type { AiSavingsCardProps } from '@/modules/dashboard/types/dashboard-types';

export function AiSavingsCard({ aiSavings, isLoading }: AiSavingsCardProps) {
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
        <div className="h-12 w-12 bg-white/10 rounded-full animate-pulse mb-4" />
        <div className="h-6 w-32 bg-white/10 rounded animate-pulse mb-2" />
        <div className="h-4 w-40 bg-white/5 rounded animate-pulse mb-6" />
        <div className="space-y-4">
          <div className="h-16 bg-white/5 rounded animate-pulse" />
          <div className="h-16 bg-white/5 rounded animate-pulse" />
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
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
        style={{
          background: 'rgba(140,40,250,0.12)',
          border: '1px solid rgba(140,40,250,0.3)',
        }}
      >
        <Sparkles className="w-6 h-6" style={{ color: '#8C28FA' }} />
      </div>

      {/* Title */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold" style={{ color: '#f0f4ff' }}>
          Ahorro con IA
        </h3>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(240,244,255,0.45)' }}>
          Optimización automática
        </p>
      </div>

      {/* Metrics */}
      <div className="space-y-6">
        {/* Time Saved */}
        <div>
          <div className="text-4xl font-bold mb-1" style={{ color: '#10b981' }}>
            {aiSavings.timesSavedHours} hrs
          </div>
          <p className="text-sm" style={{ color: 'rgba(240,244,255,0.6)' }}>
            Tiempo ahorrado este mes
          </p>
        </div>

        {/* Leads Filtered */}
        <div>
          <div className="text-4xl font-bold mb-1" style={{ color: '#10b981' }}>
            {aiSavings.leadsFiltered}
          </div>
          <p className="text-sm" style={{ color: 'rgba(240,244,255,0.6)' }}>
            Interacciones automatizadas
          </p>
        </div>
      </div>

      {/* Footer */}
      <p className="text-sm italic mt-6" style={{ color: 'rgba(240,244,255,0.4)' }}>
        La IA ha filtrado leads no calificados, ahorrando tiempo valioso al equipo
      </p>
    </div>
  );
}
