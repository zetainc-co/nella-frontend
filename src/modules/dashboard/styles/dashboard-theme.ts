export const DASHBOARD_COLORS = {
  primary: '#9EFF00',
  darkBg: '#1a1a1a',
  darkBg2: '#0a0a0a',
  textPrimary: '#f0f4ff',
  textSecondary: 'rgba(240,244,255,0.55)',
  textTertiary: 'rgba(240,244,255,0.6)',
  cardBg: 'rgba(255,255,255,0.03)',
  cardBorder: 'rgba(255,255,255,0.07)',
  accentHover: 'rgba(158,255,0,0.08)',
  accentBorder: 'rgba(158,255,0,0.18)',
  iconMuted: 'rgba(255,255,255,0.4)',
  iconAccent: '#9EFF00',
};

export const CARD_STYLES = {
  base: {
    background: DASHBOARD_COLORS.cardBg,
    border: `1px solid ${DASHBOARD_COLORS.cardBorder}`,
  },
  hover: {
    background: DASHBOARD_COLORS.accentHover,
    border: `1px solid ${DASHBOARD_COLORS.accentBorder}`,
  },
};

export const PERIODS = [
  { label: 'Últimos 30 días', value: '30d' },
  { label: 'Mes anterior', value: 'prev_month' },
  { label: 'Trimestre', value: 'quarter' },
  { label: 'Año', value: 'year' },
  { label: 'Todo', value: 'all' },
] as const;
