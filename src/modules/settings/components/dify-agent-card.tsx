"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckCircle2, Circle, Loader2, Plus, Trash2, Zap } from "lucide-react";
import { Modal } from "@/shared/components/modal/modal";
import { useAuthStore } from "@/core/store/auth-store";
import {
  useValidateDifyAgent,
  useConnectDifyAgent,
  useRemoveDifyAgent,
  useGetDifyAgents,
  type DifyAgentInfo,
  type DifyAgent,
} from "@/modules/settings/hooks/use-dify-agent";
import { SettingsGhostButton } from "@/modules/settings/components/settings-ui";

type ModalStep = "input" | "validating" | "found" | "connecting";

const DIFY_COLORS = {
  text: "#A78BFA",
  background: "rgba(167,139,250,0.08)",
  border: "rgba(167,139,250,0.2)",
};

const IMAGE_SIZE = 130;

function AgentMiniCard({
  agent,
  onRemove,
  isRemoving,
}: {
  agent: DifyAgent;
  onRemove: () => void;
  isRemoving: boolean;
}) {
  return (
    <div
      className="relative flex flex-col items-center rounded-2xl p-4 min-w-[140px]"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Imagen del agente: sin borde, centrada */}
      <div className="relative flex justify-center items-center ">
        <div
          className="rounded-xl overflow-hidden flex items-center justify-center shrink-0"
          style={{ width: IMAGE_SIZE, height: IMAGE_SIZE }}
        >
          <Image
            src="/agent.png"
            alt={agent.agent_name}
            width={IMAGE_SIZE}
            height={IMAGE_SIZE}
            className="object-cover w-full h-full"
          />
        </div>
        <div
          className="absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full"
          style={{
            width: 22,
            height: 22,
            background: "#8C28FA",
            border: "2px solid rgba(20,20,20,0.9)",
          }}
        >
          <CheckCircle2 className="size-2.5 text-white" />
        </div>
      </div>

      {/* Tag modo */}
      <span
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium mt-2"
        style={{
          background: "rgba(167,139,250,0.08)",
          border: "1px solid rgba(167,139,250,0.25)",
          color: "#A78BFA",
        }}
      >
        <Zap className="size-3 shrink-0" />
        <span className="truncate max-w-[100px]"> {agent.agent_name.trim() || "Agente"}</span>
      </span>

      {/* Botón borrar: visible y abajo de la card */}
      <button
        onClick={onRemove}
        disabled={isRemoving}
        title="Desvincular agente"
        className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
        style={{
          background: "rgba(248,113,113,0.12)",
          border: "1px solid rgba(248,113,113,0.35)",
          color: "#f87171",
        }}
        onMouseEnter={(e) => {
          if (!isRemoving) {
            e.currentTarget.style.background = "rgba(248,113,113,0.2)";
            e.currentTarget.style.borderColor = "rgba(248,113,113,0.5)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(248,113,113,0.12)";
          e.currentTarget.style.borderColor = "rgba(248,113,113,0.35)";
        }}
      >
        {isRemoving ? (
          <Loader2 className="size-3.5 animate-spin shrink-0" />
        ) : (
          <Trash2 className="size-3.5 shrink-0" />
        )}
        <span>{isRemoving ? "Desvinculando..." : "Desvincular"}</span>
      </button>
    </div>
  );
}

export function DifyAgentCard() {
  const session = useAuthStore((s) => s.session);
  const tenantId = session?.tenantId ?? "";

  const { data: agents, isLoading: isLoadingAgents } = useGetDifyAgents(tenantId);
  const activeAgents = agents ?? [];

  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState<ModalStep>("input");
  const [appKey, setAppKey] = useState("");
  const [foundAgent, setFoundAgent] = useState<DifyAgentInfo | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const validate = useValidateDifyAgent();
  const connect = useConnectDifyAgent();
  const remove = useRemoveDifyAgent();

  function handleOpenModal() {
    setStep("input");
    setAppKey("");
    setFoundAgent(null);
    validate.reset();
    connect.reset();
    setModalOpen(true);
  }

  async function handleValidate() {
    if (!appKey.trim()) return;
    setStep("validating");
    const result = await validate.mutateAsync(appKey.trim()).catch(() => null);
    if (result?.success && result.agent) {
      setFoundAgent(result.agent);
      setStep("found");
    } else {
      setStep("input");
    }
  }

  async function handleConnect() {
    if (!foundAgent || !tenantId) return;
    setStep("connecting");
    const result = await connect
      .mutateAsync({ tenant_id: tenantId, dify_app_key: appKey.trim() })
      .catch(() => null);
    if (result?.success) {
      setModalOpen(false);
    } else {
      setStep("found");
    }
  }

  const hasAgents = activeAgents.length > 0;

  return (
    <>
      {/* Banner card */}
      <div
        className="rounded-2xl p-7 relative overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {isLoadingAgents ? (
          <div className="flex items-center gap-2 py-4">
            <Loader2 className="size-4 animate-spin" style={{ color: "rgba(240,244,255,0.3)" }} />
            <span className="text-sm" style={{ color: "rgba(240,244,255,0.4)" }}>
              Cargando agentes...
            </span>
          </div>
        ) : !hasAgents ? (
          /* Sin agentes: texto intro + botón Agregar agente */
          <>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="rounded-full shrink-0 overflow-hidden"
                  style={{
                    width: 48,
                    height: 48,
                    border: `1px solid ${DIFY_COLORS.border}`,
                  }}
                >
                  <Image
                    src="/agent.png"
                    alt="AI Agent"
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: "#f0f4ff" }}>
                    Agentes de IA
                  </h3>
                  <p className="text-sm mt-0.5" style={{ color: "rgba(240,244,255,0.4)" }}>
                    Conecta uno o más agentes IA para empezar a captar leads
                  </p>
                </div>
              </div>
              <div className="shrink-0 ml-4">
                <SettingsGhostButton
                  icon={<Plus className="size-3.5" />}
                  onClick={handleOpenModal}
                >
                  Agregar agente
                </SettingsGhostButton>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Circle className="size-4" style={{ color: "rgba(240,244,255,0.3)" }} />
              <span className="text-sm" style={{ color: "rgba(240,244,255,0.4)" }}>
                No conectado
              </span>
            </div>
          </>
        ) : (
          /* Con agentes: título izquierda + Agregar más derecha + cards */
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold" style={{ color: "#f0f4ff" }}>
                Agentes IA
              </h3>
              <SettingsGhostButton
                icon={<Plus className="size-3.5" />}
                onClick={handleOpenModal}
              >
                Agregar nuevo agente
              </SettingsGhostButton>
            </div>
            <div className="flex flex-wrap gap-5">
              {activeAgents.map((agent) => (
                <AgentMiniCard
                  key={agent.id}
                  agent={agent}
                  onRemove={() => {
                    setRemovingId(agent.id);
                    remove.mutate(
                      { tenantId, agentId: agent.id },
                      { onSettled: () => setRemovingId(null) }
                    );
                  }}
                  isRemoving={removingId === agent.id}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        size="sm"
        title={step === "found" || step === "connecting" ? undefined : "Conectar Agente IA"}
        description={
          step === "input"
            ? "Ingresa el App Key de tu agente en Dify para validarlo"
            : undefined
        }
        footer={
          step === "input" ? (
            <>
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm rounded-lg transition-colors"
                style={{ color: "rgba(240,244,255,0.5)" }}
              >
                Cancelar
              </button>
              <button
                onClick={handleValidate}
                disabled={!appKey.trim()}
                className="px-5 py-2 text-sm font-semibold rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "#8C28FA", color: "#ffffff" }}
              >
                Buscar agente
              </button>
            </>
          ) : step === "found" ? (
            <>
              <button
                onClick={() => setStep("input")}
                className="px-4 py-2 text-sm rounded-lg transition-colors"
                style={{ color: "rgba(240,244,255,0.5)" }}
              >
                Atrás
              </button>
              <button
                onClick={handleConnect}
                className="px-5 py-2 text-sm font-semibold rounded-lg transition-all"
                style={{ background: "#8C28FA", color: "#ffffff" }}
              >
                Conectar agente
              </button>
            </>
          ) : null
        }
      >
        {step === "input" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label
                className="text-xs font-medium"
                style={{ color: "rgba(240,244,255,0.5)" }}
              >
                App Key de tu agente
              </label>
              <input
                type="text"
                value={appKey}
                onChange={(e) => setAppKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleValidate()}
                placeholder="app-xxxxxxxxxxxxxxxxxxxx"
                className="w-full px-3 py-2.5 rounded-lg text-sm font-mono outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#f0f4ff",
                  caretColor: "#A78BFA",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(167,139,250,0.4)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                }}
                autoFocus
              />
            </div>
          </div>
        )}

        {step === "validating" && (
          <div className="flex flex-col items-center justify-center py-10 gap-4">
            <Loader2
              className="size-8 animate-spin"
              style={{ color: "#A78BFA" }}
            />
            <p className="text-sm" style={{ color: "rgba(240,244,255,0.5)" }}>
              Espera un momento...
            </p>
          </div>
        )}

        {(step === "found" || step === "connecting") && foundAgent && (
          <div className="flex flex-col items-center text-center pt-2 pb-4 gap-5">
            {/* Robot visual */}
            <div className="relative">
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  width: 110, 
                  height: 110,
                  boxShadow: "0 0 40px -8px rgba(158,255,0,0.3)",
                }}
              >
                <Image
                  src="/agent.png"
                  alt="AI Agent"
                  width={120}
                  height={120}
                  className="object-cover w-full h-full"
                />
              </div>
              <div
                className="absolute -top-1.5 -right-1.5 flex items-center justify-center rounded-full"
                style={{
                  width: 24,
                  height: 24,
                  background: "#8C28FA",
                  border: "2px solid #1C1C1D",
                }}
              >
                <CheckCircle2 className="size-3.5 text-white" />
              </div>
            </div>

            {/* Agent info */}
            <div className="space-y-1.5">
              <h3 className="text-xl font-bold" style={{ color: "#f0f4ff" }}>
                {foundAgent.name}
              </h3>
              <div className="flex items-center justify-center gap-2">
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    background: "rgba(167,139,250,0.1)",
                    border: "1px solid rgba(167,139,250,0.2)",
                    color: "#A78BFA",
                  }}
                >
                  <Zap className="size-2.5" />
                  {foundAgent.mode}
                </span>
              </div>
              {foundAgent.description && (
                <p
                  className="text-sm max-w-xs"
                  style={{ color: "rgba(240,244,255,0.45)" }}
                >
                  {foundAgent.description}
                </p>
              )}
            </div>

            {step === "connecting" && (
              <div className="flex items-center gap-2 pt-1">
                <Loader2
                  className="size-4 animate-spin"
                  style={{ color: "#A78BFA" }}
                />
                <span className="text-sm" style={{ color: "rgba(240,244,255,0.5)" }}>
                  Conectando...
                </span>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
