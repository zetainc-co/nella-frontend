"use client";

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
import { useOrganization } from "@/modules/settings/hooks/use-organization";

const inputStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#f0f4ff",
};

const labelStyle = { color: "rgba(240,244,255,0.55)" };

export default function OrganizacionPage() {
  const { data: org, isLoading } = useOrganization();

  return (
    <div className="p-6 md:p-6 space-y-6 max-w-5xl mx-auto">
      <SettingsPageHeader
        title="Organizaci&#243;n"
        subtitle="Informaci&#243;n de tu empresa"
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
                  value={org.name}
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
                  value={org.nit}
                  readOnly
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[13px] font-semibold" style={labelStyle}>
                  Industria
                </Label>
                <Select value={org.industry} disabled>
                  <SelectTrigger className="h-11 rounded-xl" style={inputStyle}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tecnolog&#237;a">
                      {"Tecnolog\u00eda"}
                    </SelectItem>
                    <SelectItem value="Retail">Retail</SelectItem>
                    <SelectItem value="Servicios">Servicios</SelectItem>
                    <SelectItem value="Manufactura">Manufactura</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[13px] font-semibold" style={labelStyle}>
                  {"Tel\u00e9fono"}
                </Label>
                <Input
                  className="h-11 rounded-xl"
                  value={org.phone}
                  readOnly
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[13px] font-semibold" style={labelStyle}>
                {"Direcci\u00f3n"}
              </Label>
              <Input
                className="h-11 rounded-xl"
                value={org.address}
                readOnly
                style={inputStyle}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <SettingsCTAButton>Guardar Cambios</SettingsCTAButton>
        </div>
      </SettingsCard>
    </div>
  );
}
