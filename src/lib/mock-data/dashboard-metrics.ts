// src/lib/mock-data/dashboard-metrics.ts

export const MOCK_TEAM = [
  {
    id: '1',
    name: 'Carlos Mendez',
    sales: 47,
    conversionRate: 18.5,
    responseTime: '8 min',
    avatar: 'CM',
  },
  {
    id: '2',
    name: 'Maria Garcia',
    sales: 42,
    conversionRate: 16.2,
    responseTime: '12 min',
    avatar: 'MG',
  },
  {
    id: '3',
    name: 'Luis Rodriguez',
    sales: 38,
    conversionRate: 15.1,
    responseTime: '15 min',
    avatar: 'LR',
  },
  {
    id: '4',
    name: 'Ana Martinez',
    sales: 35,
    conversionRate: 14.8,
    responseTime: '10 min',
    avatar: 'AM',
  },
  {
    id: '5',
    name: 'Pedro Sanchez',
    sales: 27,
    conversionRate: 12.3,
    responseTime: '18 min',
    avatar: 'PS',
  },
];

export const MOCK_TRENDS = [
  { week: 'Sem 1', revenue: 130000, leads: 120 },
  { week: 'Sem 2', revenue: 135000, leads: 135 },
  { week: 'Sem 3', revenue: 142000, leads: 150 },
  { week: 'Sem 4', revenue: 150000, leads: 165 },
];

export const MOCK_AI_SAVINGS = {
  hourssaved: 247,
  leadsQualified: 823,
  description: 'La IA ha filtrado leads no calificados, ahorrando tiempo valioso al equipo',
};

export function calculatePipelineValue(revenue: number): number {
  return Math.round(revenue * 1.5);
}

export function calculateRoas(revenue: number): string {
  return (revenue / 20000).toFixed(1);
}
