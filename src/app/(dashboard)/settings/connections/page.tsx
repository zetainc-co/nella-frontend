"use client";

import { mockConnections } from "@/lib/mock-data/settings";
import {
  SettingsPageHeader,
  SettingsGhostButton,
} from "@/modules/settings/components/settings-ui";
import { DifyAgentCard } from "@/modules/settings/components/dify-agent-card";
import { WhatsappCard } from "@/modules/settings/components/whatsapp-card";
import {
  Instagram,
  Facebook,
  Calendar,
  CheckCircle2,
  Circle,
  Lock,
} from "lucide-react";

const iconMap = {
  instagram: Instagram,
  facebook: Facebook,
  calendar: Calendar,
};

const colorMap = {
  instagram: {
    text: "#ec4899",
    background: "rgba(236,72,153,0.1)",
    border: "rgba(236,72,153,0.2)",
  },
  facebook: {
    text: "#3b82f6",
    background: "rgba(59,130,246,0.1)",
    border: "rgba(59,130,246,0.2)",
  },
  calendar: {
    text: "#a855f7",
    background: "rgba(168,85,247,0.1)",
    border: "rgba(168,85,247,0.2)",
  },
};

export default function ConexionesPage() {
  return (
    <div className="p-6 md:p-6 space-y-6 max-w-5xl mx-auto">
      <SettingsPageHeader
        title="Conexiones"
        subtitle="Administra tus integraciones con canales de comunicación"
      />

      <div className="space-y-4">
        <DifyAgentCard />
        <WhatsappCard />
        {mockConnections.map((connection) => {
          const Icon = iconMap[connection.icon as keyof typeof iconMap];
          const connectionColors =
            colorMap[connection.icon as keyof typeof colorMap];

          return (
            <div
              key={connection.id}
              className="rounded-2xl p-7 relative overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {/* Top row: icon + title on left, buttons on right */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="flex items-center justify-center rounded-full shrink-0"
                    style={{
                      width: 48,
                      height: 48,
                      background: connectionColors.background,
                      border: `1px solid ${connectionColors.border}`,
                    }}
                  >
                    <Icon
                      className="size-5"
                      style={{ color: connectionColors.text }}
                    />
                  </div>
                  <div>
                    <h3
                      className="text-lg font-bold"
                      style={{ color: "#f0f4ff" }}
                    >
                      {connection.name}
                    </h3>
                    <p
                      className="text-sm mt-0.5"
                      style={{ color: "rgba(240,244,255,0.4)" }}
                    >
                      {connection.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0 ml-4">
                  {connection.connected ? (
                    <>
                      <SettingsGhostButton icon={<Lock className="size-3.5" />}>
                        Editar Token
                      </SettingsGhostButton>
                      <SettingsGhostButton variant="danger">
                        Desconectar
                      </SettingsGhostButton>
                    </>
                  ) : (
                    <SettingsGhostButton>Conectar</SettingsGhostButton>
                  )}
                </div>
              </div>

              {/* Status + details below */}
              <div className="mt-4 space-y-3">
                {connection.connected ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-[#8C28FA]" />
                    <span className="text-sm font-medium text-[#8C28FA]">
                      Conectado
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Circle
                      className="size-4"
                      style={{ color: "rgba(240,244,255,0.3)" }}
                    />
                    <span
                      className="text-sm"
                      style={{ color: "rgba(240,244,255,0.4)" }}
                    >
                      No conectado
                    </span>
                  </div>
                )}

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
