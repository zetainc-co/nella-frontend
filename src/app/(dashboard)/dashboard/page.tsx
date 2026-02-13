"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LabelList
} from "recharts"
import {
  Users,
  UserCheck,
  Zap,
  DollarSign,
  ArrowUpRight
} from "lucide-react"

// --- Data ---
const revenueData = [
  { month: "Ene", revenue: 25000 },
  { month: "Feb", revenue: 45000 },
  { month: "Mar", revenue: 35000 },
  { month: "Abr", revenue: 75000 },
  { month: "May", revenue: 65000 },
  { month: "Jun", revenue: 110000 },
  { month: "Jul", revenue: 95000 },
  { month: "Ago", revenue: 130800 },
  { month: "Sep", revenue: 105000 },
  { month: "Oct", revenue: 65000 },
  { month: "Nov", revenue: 85000 },
  { month: "Dic", revenue: 130000 },
]

const trafficData = [
  { name: "Instagram", value: 35, color: "#CEF25D" }, // Neon
  { name: "Referral", value: 30, color: "#a3c24a" }, // Dimmer Neon
  { name: "Web", value: 20, color: "#7a9136" }, // Even dimmer
  { name: "Ads", value: 15, color: "#333333" }, // Dark gray
]

const funnelData = [
  { stage: "Nuevo", count: 120 },
  { stage: "Contactado", count: 85 },
  { stage: "Propuesta", count: 45 },
  { stage: "Cierre", count: 18 },
]

const kpiData = [
  { title: "Total Leads", value: "353", change: "+12.5%", icon: Users },
  { title: "Leads Activos", value: "156", change: "+8.2%", icon: UserCheck },
  { title: "Conversiones", value: "42", change: "+15.3%", icon: Zap },
  { title: "Revenue Pipeline", value: "$127.5K", change: "+5.7%", icon: DollarSign },
]

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-8 pt-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
          <p className="text-muted-foreground mt-1 text-sm tracking-wide">Rendimiento en tiempo real.</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => (
          <div
            key={index}
            className="group glass-panel tech-glow relative p-6 rounded-2xl"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-lg bg-accent text-muted-foreground group-hover:text-foreground group-hover:bg-primary/20 transition-colors">
                <kpi.icon className="size-5" />
              </div>
              <span className="flex items-center text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full border border-primary/10">
                {kpi.change}
                <ArrowUpRight className="ml-1 size-3" />
              </span>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1 tracking-tight">{kpi.value}</div>
            <div className="text-sm text-muted-foreground font-medium">{kpi.title}</div>
          </div>
        ))}
      </div>

      {/* Charts Section (Bento Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">

        {/* Revenue Analytics (Left - Col Span 2) */}
        <div className="lg:col-span-2 glass-panel tech-glow rounded-2xl p-6 relative overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Análisis de Revenue</h3>
            <div className="flex gap-2">
              {/* Controls placeholder */}
            </div>
          </div>

          <div className="flex-1 min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#CEF25D" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#CEF25D" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value / 1000}K`}
                  dx={-10}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.5)"
                  }}
                  itemStyle={{ color: "hsl(var(--primary))" }}
                  labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                  formatter={(value) => [`${value}`, "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#CEF25D"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic Source (Right - Col Span 1) */}
        <div className="glass-panel tech-glow rounded-2xl p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-foreground mb-6">Fuentes de Tráfico</h3>

          <div className="relative flex-1 min-h-[250px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={trafficData}
                  cx="50%"
                  cy="50%"
                  innerRadius={90}
                  outerRadius={110}
                  dataKey="value"
                  stroke="none"
                  paddingAngle={0}
                >
                  {trafficData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))"
                  }}
                  itemStyle={{ color: "hsl(var(--foreground))" }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-bold text-foreground tracking-tighter">353</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium mt-1">Total Leads</span>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 space-y-3">
            {trafficData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-medium text-foreground">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sales Funnel (Bottom - Full Width) */}
      <div className="w-full glass-panel tech-glow rounded-2xl p-6 mt-2">
        <h3 className="text-lg font-semibold text-foreground mb-6">Embudo de Conversión</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={funnelData}
              margin={{ top: 0, right: 30, left: 20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
              <XAxis type="number" hide />
              <YAxis
                dataKey="stage"
                type="category"
                hide
                width={0}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--accent))' }}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))"
                }}
              />
              <Bar
                dataKey="count"
                fill="#CEF25D"
                radius={[0, 4, 4, 0]}
                barSize={48}
                activeBar={{ fill: "#badd4f" }}
              >
                <LabelList dataKey="stage" position="insideLeft" fill="#000" fontWeight="bold" fontSize={14} />
                <LabelList dataKey="count" position="right" fill="#fff" fontSize={14} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
