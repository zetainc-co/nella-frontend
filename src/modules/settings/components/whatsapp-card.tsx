"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Loader2,
  Lock,
  MessageSquare,
  Phone,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import { Modal } from "@/shared/components/modal/modal";
import {
  useWhatsappConfig,
  useConnectWhatsapp,
  useUpdateWhatsapp,
  useDisconnectWhatsapp,
  type WhatsappConfigData,
} from "@/modules/settings/hooks/use-whatsapp";
import { SettingsGhostButton } from "@/modules/settings/components/settings-ui";

type ModalStep = "input" | "connecting";

const WA = {
  text:       "#25D366",
  background: "rgba(37,211,102,0.08)",
  border:     "rgba(37,211,102,0.2)",
};

export function WhatsappCard() {
  const { data: config, isLoading } = useWhatsappConfig();

  const [modalOpen, setModalOpen]         = useState(false);
  const [step, setStep]                   = useState<ModalStep>("input");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [metaToken, setMetaToken]         = useState("");
  const [appSecret, setAppSecret]         = useState("");

  const connect    = useConnectWhatsapp();
  const update     = useUpdateWhatsapp();
  const disconnect = useDisconnectWhatsapp();

  const isConnected = !isLoading && !!config;

  function handleOpenModal() {
    setStep("input");
    connect.reset();
    update.reset();

    if (isConnected && config) {
      // Pre-fill phone_number_id (not sensitive); leave tokens empty
      setPhoneNumberId(config.phone_number_id);
      setMetaToken("");
      setAppSecret("");
    } else {
      setPhoneNumberId("");
      setMetaToken("");
      setAppSecret("");
    }

    setModalOpen(true);
  }

  async function handleSubmit() {
    setStep("connecting");

    if (isConnected) {
      // PATCH — only send changed fields; empty token = keep existing
      const payload: Record<string, string> = {};
      if (phoneNumberId.trim()) payload.phone_number_id = phoneNumberId.trim();
      if (metaToken.trim())     payload.meta_token      = metaToken.trim();
      if (appSecret.trim())     payload.app_secret      = appSecret.trim();

      const result = await update.mutateAsync(payload).catch(() => null);
      if (result?.success) {
        setModalOpen(false);
      } else {
        setStep("input");
      }
    } else {
      // POST — full connect, all fields required
      if (!phoneNumberId.trim() || !metaToken.trim() || !appSecret.trim()) {
        setStep("input");
        return;
      }
      const result = await connect
        .mutateAsync({
          phone_number_id: phoneNumberId.trim(),
          meta_token:      metaToken.trim(),
          app_secret:      appSecret.trim(),
        })
        .catch(() => null);

      if (result?.success) {
        setModalOpen(false);
      } else {
        setStep("input");
      }
    }
  }

  // Disable submit only for new connect (all required); edit allows partial
  const submitDisabled = isConnected
    ? !phoneNumberId.trim()
    : !phoneNumberId.trim() || !metaToken.trim() || !appSecret.trim();

  const activeError = isConnected ? update.error : connect.error;
  const isError     = isConnected ? update.isError : connect.isError;

  return (
    <>
      <div
        className="rounded-2xl p-7 relative overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.03)",
          border:     "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Header row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className="rounded-full shrink-0 flex items-center justify-center"
              style={{
                width:      48,
                height:     48,
                background: WA.background,
                border:     `1px solid ${WA.border}`,
              }}
            >
              <MessageSquare className="size-5" style={{ color: WA.text }} />
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: "#f0f4ff" }}>
                WhatsApp API
              </h3>
              <p className="text-sm mt-0.5" style={{ color: "rgba(240,244,255,0.4)" }}>
                Conecta tu cuenta de WhatsApp para gestionar conversaciones
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 shrink-0 ml-4">
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" style={{ color: "rgba(240,244,255,0.3)" }} />
            ) : isConnected ? (
              <>
                <SettingsGhostButton
                  icon={<Lock className="size-3.5" />}
                  onClick={handleOpenModal}
                >
                  Editar credenciales
                </SettingsGhostButton>
                <SettingsGhostButton
                  variant="danger"
                  onClick={() => disconnect.mutate()}
                  disabled={disconnect.isPending}
                >
                  {disconnect.isPending ? "Desconectando..." : "Desconectar"}
                </SettingsGhostButton>
              </>
            ) : (
              <SettingsGhostButton
                icon={<Phone className="size-3.5" />}
                onClick={handleOpenModal}
              >
                Conectar
              </SettingsGhostButton>
            )}
          </div>
        </div>

        {/* Status + details */}
        <div className="mt-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" style={{ color: "rgba(240,244,255,0.3)" }} />
              <span className="text-sm" style={{ color: "rgba(240,244,255,0.4)" }}>Cargando...</span>
            </div>
          ) : isConnected ? (
            <ConnectedDetails config={config} />
          ) : (
            <div className="flex items-center gap-2">
              <Circle className="size-4" style={{ color: "rgba(240,244,255,0.3)" }} />
              <span className="text-sm" style={{ color: "rgba(240,244,255,0.4)" }}>No conectado</span>
            </div>
          )}
        </div>
      </div>

      {/* Connect / Edit Modal */}
      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        size="sm"
        title={isConnected ? "Editar credenciales" : "Conectar WhatsApp Business"}
        description={
          step === "input"
            ? isConnected
              ? "Modifica solo los campos que quieres cambiar. Los tokens en blanco se mantienen."
              : "Ingresa las credenciales de Meta Business para conectar tu número"
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
                onClick={handleSubmit}
                disabled={submitDisabled}
                className="px-5 py-2 text-sm font-semibold rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: WA.text, color: "#0a1015" }}
              >
                {isConnected ? "Guardar cambios" : "Conectar"}
              </button>
            </>
          ) : null
        }
      >
        {step === "input" && (
          <div className="space-y-4">
            <InputField
              label="Phone Number ID"
              value={phoneNumberId}
              onChange={setPhoneNumberId}
              placeholder="185205345129634"
              autoFocus
            />
            <SecretField
              label="Meta Token (permanent)"
              value={metaToken}
              onChange={setMetaToken}
              hasExistingValue={isConnected}
              placeholder={isConnected ? "" : "EAABsbCS1iHgBO..."}
            />
            <SecretField
              label="App Secret"
              value={appSecret}
              onChange={setAppSecret}
              hasExistingValue={isConnected}
              placeholder={isConnected ? "" : "a1b2c3d4e5f6..."}
            />

            {isConnected && (
              <div
                className="flex items-start gap-2 px-3 py-2.5 rounded-lg"
                style={{
                  background: "rgba(37,211,102,0.05)",
                  border:     "1px solid rgba(37,211,102,0.15)",
                }}
              >
                <ShieldCheck className="size-3.5 mt-0.5 shrink-0" style={{ color: WA.text }} />
                <p className="text-xs" style={{ color: "rgba(240,244,255,0.5)" }}>
                  Los tokens actuales se conservan si dejas los campos en blanco.
                  Solo se actualizan los valores que escribas.
                </p>
              </div>
            )}

            {isError && (
              <p className="text-xs px-3 py-2 rounded-lg" style={{
                background: "rgba(248,113,113,0.08)",
                border:     "1px solid rgba(248,113,113,0.2)",
                color:      "#f87171",
              }}>
                {(activeError as Error)?.message ?? "Error al guardar las credenciales"}
              </p>
            )}
          </div>
        )}

        {step === "connecting" && (
          <div className="flex flex-col items-center justify-center py-10 gap-4">
            <Loader2 className="size-8 animate-spin" style={{ color: WA.text }} />
            <p className="text-sm" style={{ color: "rgba(240,244,255,0.5)" }}>
              {isConnected ? "Actualizando credenciales..." : "Validando credenciales y configurando..."}
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}

/* ── Connected details ── */
function ConnectedDetails({ config }: { config: WhatsappConfigData }) {
  const maskedId = config.phone_number_id
    ? `${config.phone_number_id.slice(0, 4)}...${config.phone_number_id.slice(-4)}`
    : "—";

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="size-4 text-[#8C28FA]" />
        <span className="text-sm font-medium text-[#8C28FA]">Conectado</span>
      </div>

      {config.verified_name && (
        <div className="flex items-center gap-2">
          <Phone className="size-3.5" style={{ color: "rgba(240,244,255,0.4)" }} />
          <span className="text-sm font-mono" style={{ color: "rgba(240,244,255,0.5)" }}>
            {config.verified_name}
          </span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Lock className="size-3.5" style={{ color: "rgba(240,244,255,0.4)" }} />
        <span className="text-sm font-mono" style={{ color: "rgba(240,244,255,0.5)" }}>
          ID: {maskedId}
        </span>
      </div>

      <div
        className="p-3 rounded-lg mt-1"
        style={{
          background: "rgba(59,130,246,0.05)",
          border:     "1px solid rgba(59,130,246,0.15)",
        }}
      >
        <p className="text-xs" style={{ color: "rgba(240,244,255,0.5)" }}>
          <span className="font-semibold" style={{ color: "#60a5fa" }}>Nota:</span>{" "}
          La conexión con WhatsApp Business API requiere una cuenta verificada de Meta Business.
          Los mensajes se sincronizarán automáticamente con tu bandeja de entrada.
        </p>
      </div>
    </div>
  );
}

/* ── Plain input field ── */
function InputField({
  label,
  value,
  onChange,
  placeholder,
  autoFocus = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoFocus?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium" style={{ color: "rgba(240,244,255,0.5)" }}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full px-3 py-2.5 rounded-lg text-sm font-mono outline-none transition-all"
        style={{
          background: "rgba(255,255,255,0.04)",
          border:     "1px solid rgba(255,255,255,0.1)",
          color:      "#f0f4ff",
          caretColor: "#25D366",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "rgba(37,211,102,0.4)";
          e.currentTarget.style.background  = "rgba(255,255,255,0.07)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
          e.currentTarget.style.background  = "rgba(255,255,255,0.04)";
        }}
      />
    </div>
  );
}

/* ── Secret field — shows "••••••••" placeholder when value exists, empty otherwise ── */
function SecretField({
  label,
  value,
  onChange,
  hasExistingValue,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hasExistingValue: boolean;
  placeholder: string;
}) {
  const [showSecret, setShowSecret] = useState(false);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium" style={{ color: "rgba(240,244,255,0.5)" }}>
          {label}
        </label>
        {hasExistingValue && (
          <span
            className="flex items-center gap-1 text-xs"
            style={{ color: "rgba(37,211,102,0.7)" }}
          >
            <ShieldCheck className="size-3" />
            Configurado
          </span>
        )}
      </div>
      <div className="relative">
        <input
          type={showSecret ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={hasExistingValue ? "••••••••  (dejar en blanco para conservar)" : placeholder}
          className="w-full px-3 py-2.5 pr-12 rounded-lg text-sm font-mono outline-none transition-all"
          style={{
            background: "rgba(255,255,255,0.04)",
            border:     "1px solid rgba(255,255,255,0.1)",
            color:      "#f0f4ff",
            caretColor: "#25D366",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "rgba(37,211,102,0.4)";
            e.currentTarget.style.background  = "rgba(255,255,255,0.07)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            e.currentTarget.style.background  = "rgba(255,255,255,0.04)";
          }}
        />
        <button
          type="button"
          onClick={() => setShowSecret(!showSecret)}
          className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
          style={{ color: "rgba(240,244,255,0.4)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "rgba(240,244,255,0.7)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(240,244,255,0.4)";
          }}
          tabIndex={-1}
        >
          {showSecret ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
