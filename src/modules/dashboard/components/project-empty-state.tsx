"use client";

import { Sparkles, TrendingUp, Target, Users, LucideIcon } from "lucide-react";

interface ProjectEmptyStateProps {
  onCreateClick: () => void;
}

export function ProjectEmptyState({ onCreateClick }: ProjectEmptyStateProps) {
  return (
    // Aseguramos centrado total en el viewport
    <div className="flex flex-1 items-center justify-center min-h-screen font-sans p-4">
      <div className="flex flex-col items-center bg-gradient-to-bl from-[#1E1C26] via-[#151518] to-[#151518] border border-[#222222] rounded-2xl pt-10 px-8 max-w-md w-full gap-6 text-center">
        {/* Ícono superior */}
        <div className="rounded-xl bg-[#212124] border border-[#2c2c2f] p-4">
          <Sparkles className="size-10 text-[#a3ff12] stroke-2" />
        </div>

        {/* Textos - Eliminamos alturas fijas y ajustamos espacios */}
        <div className="flex flex-col items-center max-w-[320px]">
          <h2 className="text-2xl font-bold text-white">
            ¡Bienvenido a NellaSales!
          </h2>
          <p className="text-sm font-normal text-white/90 max-w-full mt-2 mb-6 ">
            Crea tu primer proyecto para comenzar a visualizar <br></br>
            información en tiempo real
          </p>
          {/* Eliminamos h-3 y justify-center, usamos leading para mejor legibilidad */}
          <p className="text-[12px] font-normal text-gray-400 max-w-full leading-snug">
            Tu dashboard se llenará de métricas, gráficos y estadísticas{" "}
            <br></br> tan pronto como configures tu primer proyecto de ventas
          </p>
        </div>

        {/* Botón */}
        <button
          onClick={onCreateClick}
          className="bg-[#a3ff12] flex items-center justify-center shadow-[0_10px_20px_-5px_rgba(163,255,18,0.4)] font-bold px-6 py-3 gap-2 rounded-lg transition-all hover:brightness-110 text-black mt-2"
        >
          <Sparkles className="size-4" />
          Crear Primer Proyecto
        </button>

        {/* Footer - Alineación perfecta */}
        <div className="flex justify-between w-full border-t border-[#222222] pt-6 pb-6 px-2">
          <FeatureIcon icon={TrendingUp} label="Métricas en tiempo real" />
          <FeatureIcon icon={Target} label="Pipeline automatizado" />
          <FeatureIcon icon={Users} label="CRM inteligente" />
        </div>
      </div>
    </div>
  );
}

function FeatureIcon({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  // Ajustamos el ancho del label para que el texto fluya naturalmente
  return (
    <div className="flex flex-col items-center gap-2 text-gray-400 flex-1">
      <Icon className="size-6 text-[#a3ff12]" />
      <span className="text-[11px] leading-tight text-center max-w-[70px]">
        {label}
      </span>
    </div>
  );
}
