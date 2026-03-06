"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SettingsPageHeader,
  SettingsCard,
  SettingsCTAButton,
} from "@/modules/settings/components/settings-ui";
import { OrganizationCardSkeleton } from "@/modules/settings/components/settings-skeleton";
import {
  useOrganization,
  useUpdateOrganization,
} from "@/modules/settings/hooks/use-organization";
import type { UpdateOrganizationDto } from "@/modules/settings/hooks/use-organization";
import { useAuthStore } from "@/core/store/auth-store";
import { INDUSTRIES } from "@/lib/countries-latam";
import { Loader2 } from "lucide-react";

const inputStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#f0f4ff",
};

const inputEditableStyle = {
  ...inputStyle,
  border: "1px solid rgba(255,255,255,0.15)",
};

const labelStyle = { color: "rgba(240,244,255,0.55)" };

export default function OrganizacionPage() {
  const { data: org, isLoading } = useOrganization();
  const updateOrg = useUpdateOrganization();
  const role = useAuthStore((s) => s.session?.role);
  const isAdmin = role === "admin";

  const [form, setForm] = useState<UpdateOrganizationDto>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (org) {
      setForm({
        name: org.name,
        nit: org.nit,
        industry: org.industry,
        phone: org.phone,
        address: org.address,
        email: org.email,
        country: org.country,
        description: org.description,
      });
    }
  }, [org]);

  function handleChange(field: keyof UpdateOrganizationDto, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  }

  function handleSave() {
    if (!hasChanges) return;
    updateOrg.mutate(form, {
      onSuccess: () => setHasChanges(false),
    });
  }

  const currentInputStyle = isAdmin ? inputEditableStyle : inputStyle;

  return (
    <div className="p-6 md:p-6 space-y-6 max-w-5xl mx-auto">
      <SettingsPageHeader
        title="Organizacion"
        subtitle="Informacion de tu empresa"
      />

      <SettingsCard title="Datos de la Empresa">
        {isLoading || !org ? (
          <OrganizationCardSkeleton />
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[13px] font-semibold" style={labelStyle}>
                  Nombre de la Empresa
                </Label>
                <Input
                  className="h-11 rounded-xl"
                  value={form.name ?? ""}
                  readOnly
                  style={inputStyle}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[13px] font-semibold" style={labelStyle}>
                  NIT / ID Fiscal
                </Label>
                <Input
                  className="h-11 rounded-xl"
                  value={form.nit ?? ""}
                  readOnly={!isAdmin}
                  onChange={(e) => handleChange("nit", e.target.value)}
                  style={currentInputStyle}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[13px] font-semibold" style={labelStyle}>
                  Industria
                </Label>
                <Select
                  value={form.industry ?? ""}
                  onValueChange={(v) => handleChange("industry", v)}
                  disabled={!isAdmin}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl" style={currentInputStyle}>
                    <SelectValue placeholder="Seleccionar industria" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="w-[var(--radix-select-trigger-width)]">
                    {INDUSTRIES.map((ind) => (
                      <SelectItem key={ind.value} value={ind.value}>
                        {ind.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[13px] font-semibold" style={labelStyle}>
                  Telefono
                </Label>
                <Input
                  className="h-11 rounded-xl"
                  value={form.phone ?? ""}
                  readOnly={!isAdmin}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  style={currentInputStyle}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[13px] font-semibold" style={labelStyle}>
                  Email de contacto
                </Label>
                <Input
                  className="h-11 rounded-xl"
                  value={form.email ?? ""}
                  readOnly={!isAdmin}
                  onChange={(e) => handleChange("email", e.target.value)}
                  style={currentInputStyle}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[13px] font-semibold" style={labelStyle}>
                  Pais
                </Label>
                <Input
                  className="h-11 rounded-xl"
                  value={form.country ?? ""}
                  readOnly={!isAdmin}
                  onChange={(e) => handleChange("country", e.target.value)}
                  style={currentInputStyle}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[13px] font-semibold" style={labelStyle}>
                Direccion
              </Label>
              <Input
                className="h-11 rounded-xl"
                value={form.address ?? ""}
                readOnly={!isAdmin}
                onChange={(e) => handleChange("address", e.target.value)}
                style={currentInputStyle}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[13px] font-semibold" style={labelStyle}>
                Descripcion
              </Label>
              <Input
                className="h-11 rounded-xl"
                value={form.description ?? ""}
                readOnly={!isAdmin}
                onChange={(e) => handleChange("description", e.target.value)}
                style={currentInputStyle}
              />
            </div>
          </div>
        )}

        {isAdmin && (
          <div className="flex justify-end pt-4">
            <SettingsCTAButton
              onClick={handleSave}
              className={!hasChanges ? "opacity-50 cursor-not-allowed" : ""}
            >
              {updateOrg.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </SettingsCTAButton>
          </div>
        )}
      </SettingsCard>
    </div>
  );
}
