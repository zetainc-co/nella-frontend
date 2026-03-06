'use client'

import React from 'react'
import type { MetricCardProps } from '@/modules/dashboard/types/dashboard-types'

export function MetricCard({
  title,
  value,
  unit = '',
  change,
  icon: Icon,
  iconColor = '#10b981', // default green for icon border
  glowColor // will use iconColor if not provided
}: MetricCardProps) {
  const spotlightColor = glowColor || iconColor // use glowColor if provided, else iconColor
  const isPositive = change.startsWith('+')
  const changeColor = isPositive ? '#8C28FA' : '#ef4444' // purple for positive, red for negative

  return (
    <div
      className="relative rounded-2xl p-6 transition-all"
      style={{
        background: `
          radial-gradient(circle at 90% 10%, ${spotlightColor}22 0%, transparent 50%),
          linear-gradient(135deg, rgba(30,30,30,0.9) 0%, rgba(20,20,20,0.95) 100%)
        `,
        border: `1.5px solid rgba(255,255,255,0.07)`,
        boxShadow: `
          0 4px 6px -1px rgba(0,0,0,0.3),
          0 2px 4px -2px rgba(0,0,0,0.3),
          inset -1px -1px 2px ${iconColor}22,
          inset 1px 1px 2px ${iconColor}11
        `,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `
          0 8px 20px -4px ${spotlightColor}40,
          0 4px 6px -1px rgba(0,0,0,0.3),
          0 2px 4px -2px rgba(0,0,0,0.3),
          inset -1px -1px 2px ${iconColor}22,
          inset 1px 1px 2px ${iconColor}11
        `;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `
          0 4px 6px -1px rgba(0,0,0,0.3),
          0 2px 4px -2px rgba(0,0,0,0.3),
          inset -1px -1px 2px ${iconColor}22,
          inset 1px 1px 2px ${iconColor}11
        `;
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        {/* Title */}
        <h3
          className="text-sm font-medium text-gray-300"
        >
          {title}
        </h3>

        {/* Icon */}
        <div
          className="flex items-center justify-center rounded-full p-2"
          style={{
            background: 'rgba(0,0,0,0.4)',
            border: `1px solid ${iconColor}`,
          }}
        >
          <Icon
            className="size-4"
            style={{ color: '#ffffff' }}
          />
        </div>
      </div>

      {/* Value */}
      <div className="mb-2">
        <span
          className="text-4xl font-bold"
          style={{ color: '#f0f4ff' }}
        >
          {value}
        </span>
        {unit && (
          <span
            className="text-xl font-semibold ml-1"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            {unit}
          </span>
        )}
      </div>

      {/* Change indicator */}
      <div
        className="text-sm font-medium text-[#af98f4]"
      >
        {change} vs mes anterior
      </div>
    </div>
  )
}
