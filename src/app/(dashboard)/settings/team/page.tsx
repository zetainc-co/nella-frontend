"use client";

import { useState, useMemo } from "react";
import { UserPlus, Trash2, ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { useAuthStore } from "@/core/store/auth-store";
import { useAgents, useDeleteAgent, useUpdateAgent } from "@/modules/team/hooks/useAgents";
import { InviteMemberModal } from "@/modules/team/components/invite-member-modal";
import { DeleteAgentModal } from "@/modules/team/components/delete-agent-modal";
import { EditAgentModal } from "@/modules/team/components/edit-agent-modal";
import {
  SettingsPageHeader,
  SettingsCard,
  SettingsCTAButton,
  SettingsLimeBadge,
  SettingsStatusDot,
} from "@/modules/settings/components/settings-ui";
import type { Agent } from "@/modules/team/types/team-types";

const ITEMS_PER_PAGE = 5;

export default function EquipoPage() {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<{ id: string; name: string } | null>(null);
  const [agentToEdit, setAgentToEdit] = useState<Agent | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const role = useAuthStore((s) => s.session?.role);
  const isAdmin = role === "admin";
  const { data: agents = [], isLoading } = useAgents();
  const deleteAgent = useDeleteAgent();
  const updateAgent = useUpdateAgent();

  // Paginación
  const { paginatedAgents, totalPages } = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return {
      paginatedAgents: agents.slice(startIndex, endIndex),
      totalPages: Math.ceil(agents.length / ITEMS_PER_PAGE),
    };
  }, [agents, currentPage]);

  // Calcular licencias basado en agents reales
  const licensesTotal = 5; // Esto debería venir de la configuración del tenant
  const licensesUsed = agents.length;
  const licensePercentage = (licensesUsed / licensesTotal) * 100;

  const handleEdit = (agent: Agent) => {
    setAgentToEdit(agent);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (agentId: string, data: { full_name?: string; role?: 'admin' | 'agent' | 'viewer'; is_active?: boolean }) => {
    await updateAgent.mutateAsync({ agentId, data });
    setEditModalOpen(false);
    setAgentToEdit(null);
  };

  const handleDelete = (agentId: string, agentName: string) => {
    setAgentToDelete({ id: agentId, name: agentName });
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!agentToDelete) return;

    try {
      await deleteAgent.mutateAsync(agentToDelete.id);
      // Si eliminamos el último item de la página actual, ir a la anterior
      if (paginatedAgents.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } finally {
      setDeleteConfirmOpen(false);
      setAgentToDelete(null);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
        <SettingsPageHeader
          title="Equipo y Permisos"
          subtitle="Gestiona quién tiene acceso a tus chats y leads"
        />

        {/* Licencias Usadas */}
        <SettingsCard title="Licencias Usadas">
          <div className="flex items-center justify-between">
            <p className="text-sm" style={{ color: "rgba(240,244,255,0.4)" }}>
              Estás usando{" "}
              <span className="font-bold" style={{ color: "#f0f4ff" }}>
                {licensesUsed}
              </span>{" "}
              de {licensesTotal} licencias disponibles
            </p>

            <div className="flex flex-col items-end gap-1">
              <div
                className="relative h-2 w-40 overflow-hidden rounded-full"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <div
                  className="absolute h-full rounded-full bg-[#7C3AED]"
                  style={{ width: `${licensePercentage}%` }}
                />
              </div>
              <span
                className="text-xs"
                style={{ color: "rgba(240,244,255,0.4)" }}
              >
                {licensesUsed}/{licensesTotal}
              </span>
            </div>
          </div>
        </SettingsCard>

        {/* Miembros del Equipo */}
        <SettingsCard
          title="Miembros del Equipo"
          action={
            isAdmin ? (
              <SettingsCTAButton onClick={() => setIsInviteModalOpen(true)}>
                <UserPlus className="size-4" /> Invitar Miembro
              </SettingsCTAButton>
            ) : undefined
          }
        >
          {isLoading ? (
            <div className="py-8 text-center" style={{ color: "rgba(240,244,255,0.4)" }}>
              Cargando...
            </div>
          ) : agents.length === 0 ? (
            <div className="py-8 text-center" style={{ color: "rgba(240,244,255,0.4)" }}>
              No hay miembros en el equipo. Invita al primero.
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr>
                    <th
                      className="pb-3 text-left text-xs font-medium"
                      style={{ color: "rgba(240,244,255,0.4)" }}
                    >
                      Usuario
                    </th>
                    <th
                      className="pb-3 text-left text-xs font-medium"
                      style={{ color: "rgba(240,244,255,0.4)" }}
                    >
                      Rol
                    </th>
                    <th
                      className="pb-3 text-left text-xs font-medium"
                      style={{ color: "rgba(240,244,255,0.4)" }}
                    >
                      Estado
                    </th>
                    {isAdmin && (
                      <th
                        className="pb-3 text-right text-xs font-medium"
                        style={{ color: "rgba(240,244,255,0.4)" }}
                      >
                        Acciones
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {paginatedAgents.map((agent) => (
                    <tr
                      key={agent.id}
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      {/* Usuario */}
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex shrink-0 items-center justify-center rounded-full text-sm font-bold"
                            style={{
                              width: 36,
                              height: 36,
                              background: "#7C3AED",
                              color: "#ffffff",
                            }}
                          >
                            {getInitials(agent.full_name || agent.email)}
                          </div>
                          <div>
                            <p
                              className="text-sm font-semibold"
                              style={{ color: "#f0f4ff" }}
                            >
                              {agent.full_name || agent.email}
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: "rgba(240,244,255,0.4)" }}
                            >
                              {agent.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Rol */}
                      <td className="py-4">
                        <SettingsLimeBadge
                          variant={
                            agent.role === "admin" ? "lime" : "outlined"
                          }
                        >
                          {agent.role === "admin"
                            ? "Administrador"
                            : agent.role === "agent"
                            ? "Agente"
                            : "Viewer"}
                        </SettingsLimeBadge>
                      </td>

                      {/* Estado */}
                      <td className="py-4">
                        <SettingsStatusDot
                          status={agent.is_active ? "active" : "pending"}
                        />
                      </td>

                      {/* Acciones (solo admin) */}
                      {isAdmin && (
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(agent)}
                              className="rounded-lg p-2 transition-colors hover:bg-white/5"
                              title="Editar miembro"
                            >
                              <Pencil className="size-4" style={{ color: "rgba(240,244,255,0.6)" }} />
                            </button>
                            <button
                              onClick={() => handleDelete(agent.id, agent.full_name || agent.email)}
                              disabled={deleteAgent.isPending}
                              className="rounded-lg p-2 transition-colors hover:bg-white/5 disabled:opacity-50"
                              title="Eliminar miembro"
                            >
                              <Trash2 className="size-4" style={{ color: "#ef4444" }} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Paginación */}
              {totalPages > 1 && (
                <div
                  className="flex items-center justify-between pt-4"
                  style={{ borderColor: "rgba(255,255,255,0.06)" }}
                >
                  <p className="text-sm" style={{ color: "rgba(240,244,255,0.4)" }}>
                    Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} a{" "}
                    {Math.min(currentPage * ITEMS_PER_PAGE, agents.length)} de{" "}
                    {agents.length} miembros
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-30"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        color: "#f0f4ff",
                      }}
                    >
                      <ChevronLeft className="size-4" />
                      Anterior
                    </button>

                    <span className="text-sm" style={{ color: "rgba(240,244,255,0.6)" }}>
                      Página {currentPage} de {totalPages}
                    </span>

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-30"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        color: "#f0f4ff",
                      }}
                    >
                      Siguiente
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </SettingsCard>
      </div>

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />

      <EditAgentModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setAgentToEdit(null);
        }}
        onSave={handleSaveEdit}
        agent={agentToEdit}
        isSaving={updateAgent.isPending}
      />

      <DeleteAgentModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        agentName={agentToDelete?.name || ''}
        isDeleting={deleteAgent.isPending}
      />
    </>
  );
}
