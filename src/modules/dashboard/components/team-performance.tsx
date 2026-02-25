"use client";

interface TeamMember {
  id: string;
  name: string;
  sales: number;
  conversionRate: number;
  responseTime: string;
  avatar: string;
}

interface TeamPerformanceProps {
  data: TeamMember[];
}

export function TeamPerformance({ data }: TeamPerformanceProps) {
  return (
    <div
      className="p-6 rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <h3
        className="text-lg font-bold mb-1"
        style={{ color: "#f0f4ff" }}
      >
        Equipo de Ventas
      </h3>
      <p
        className="text-xs mb-6"
        style={{ color: "rgba(240,244,255,0.55)" }}
      >
        Rendimiento individual del equipo
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <th
                className="text-left py-3 px-4 font-semibold"
                style={{ color: "rgba(240,244,255,0.55)" }}
              >
                Vendedor
              </th>
              <th
                className="text-right py-3 px-4 font-semibold"
                style={{ color: "rgba(240,244,255,0.55)" }}
              >
                Ventas
              </th>
              <th
                className="text-right py-3 px-4 font-semibold"
                style={{ color: "rgba(240,244,255,0.55)" }}
              >
                Tasa %
              </th>
              <th
                className="text-right py-3 px-4 font-semibold"
                style={{ color: "rgba(240,244,255,0.55)" }}
              >
                Tiempo Respuesta
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((member) => (
              <tr
                key={member.id}
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <td
                  className="py-3 px-4"
                  style={{ color: "#f0f4ff" }}
                >
                  {member.name}
                </td>
                <td
                  className="py-3 px-4 text-right font-semibold"
                  style={{ color: "#f0f4ff" }}
                >
                  {member.sales}
                </td>
                <td
                  className="py-3 px-4 text-right font-semibold"
                  style={{ color: "#9EFF00" }}
                >
                  {member.conversionRate}%
                </td>
                <td
                  className="py-3 px-4 text-right"
                  style={{ color: "rgba(240,244,255,0.55)" }}
                >
                  {member.responseTime}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
