"use client";

import { mockBilling } from "@/lib/mock-data/settings";
import {
  SettingsPageHeader,
  SettingsCard,
  SettingsGhostButton,
  SettingsLimeBadge,
} from "@/modules/settings/components/settings-ui";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
  });
};

export default function FacturacionPage() {
  return (
    <div className="p-6 md:p-6 space-y-6 max-w-5xl mx-auto">
      <SettingsPageHeader
        title="Facturación"
        subtitle="Gestiona tu plan y métodos de pago"
      />

      <SettingsCard
        title="Plan Actual"
        tealGradient
        action={<SettingsLimeBadge>{mockBilling.plan}</SettingsLimeBadge>}
      >
        <p className="text-sm" style={{ color: "rgba(240,244,255,0.4)" }}>
          Tu suscripción activa
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className="rounded-xl p-4"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <p className="text-xs" style={{ color: "rgba(240,244,255,0.4)" }}>
              Precio Mensual
            </p>
            <p className="text-2xl font-bold mt-1" style={{ color: "#f0f4ff" }}>
              {formatCurrency(mockBilling.price)}
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "rgba(240,244,255,0.4)" }}
            >
              {mockBilling.currency}
            </p>
          </div>

          <div
            className="rounded-xl p-4"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <p className="text-xs" style={{ color: "rgba(240,244,255,0.4)" }}>
              Licencias Incluidas
            </p>
            <p className="text-2xl font-bold mt-1" style={{ color: "#f0f4ff" }}>
              {mockBilling.licenses.total}
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "rgba(240,244,255,0.4)" }}
            >
              usuarios
            </p>
          </div>

          <div
            className="rounded-xl p-4"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <p className="text-xs" style={{ color: "rgba(240,244,255,0.4)" }}>
              Próxima Factura
            </p>
            <p className="text-2xl font-bold mt-1" style={{ color: "#f0f4ff" }}>
              {formatDate(mockBilling.nextBilling)}
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "rgba(240,244,255,0.4)" }}
            >
              2026
            </p>
          </div>
        </div>

        <SettingsGhostButton fullWidth>Cambiar Plan</SettingsGhostButton>
      </SettingsCard>

      <SettingsCard title="Método de Pago">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="bg-[#3b82f6] rounded px-2 py-1 text-white text-xs font-bold uppercase">
              {mockBilling.paymentMethod.type}
            </span>
            <div>
              <p className="text-sm font-medium" style={{ color: "#f0f4ff" }}>
                {"···· ···· ···· "}
                {mockBilling.paymentMethod.last4}
              </p>
              <p className="text-xs" style={{ color: "rgba(240,244,255,0.4)" }}>
                Vence {mockBilling.paymentMethod.expiresAt}
              </p>
            </div>
          </div>
          <button
            className="text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: "#9EFF00", background: "none", border: "none" }}
          >
            Actualizar
          </button>
        </div>
      </SettingsCard>
    </div>
  );
}
