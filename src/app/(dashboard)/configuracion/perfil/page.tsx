// src/app/(dashboard)/configuracion/perfil/page.tsx
"use client"

import { useState } from 'react'
import { mockUserProfile } from '@/lib/mock-data/settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Bell, Volume2, Lock } from 'lucide-react'
import { HudCorners } from '@/components/ui/hud-corners'

export default function MiPerfilPage() {
  const [profile, setProfile] = useState(mockUserProfile)

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mi Perfil</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestiona tu información personal y preferencias
        </p>
      </div>

      {/* Foto de Perfil */}
      <div className="relative border border-primary/20 bg-black/40 p-6 backdrop-blur-sm">
        <HudCorners />
        <h2 className="text-lg font-bold text-white mb-4">Foto de Perfil</h2>

        <div className="flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary/40 bg-primary/10 text-2xl font-bold text-primary">
            {profile.avatar}
          </div>
          <div>
            <p className="text-sm text-white mb-1">Actualiza tu foto de perfil</p>
            <p className="text-xs text-gray-400">JPG, PNG o GIF. Máximo 2MB</p>
          </div>
        </div>
      </div>

      {/* Información Personal */}
      <div className="relative border border-primary/20 bg-black/40 p-6 backdrop-blur-sm">
        <HudCorners />

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Información Personal</h2>
          <Button variant="outline" size="sm">Editar</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-gray-400">Nombre Completo</Label>
            <Input
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="bg-black/20 border-primary/20 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-400">Correo Electrónico</Label>
            <Input
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="bg-black/20 border-primary/20 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-400">Cargo / Rol</Label>
            <Input
              value={profile.role}
              onChange={(e) => setProfile({ ...profile, role: e.target.value })}
              className="bg-black/20 border-primary/20 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-400">Contraseña</Label>
            <div className="relative">
              <Input
                type="password"
                value="••••••••"
                disabled
                className="bg-black/20 border-primary/20 text-white"
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Preferencias */}
      <div className="relative border border-primary/20 bg-black/40 p-6 backdrop-blur-sm">
        <HudCorners />
        <h2 className="text-lg font-bold text-white mb-6">Preferencias</h2>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-white">Notificaciones de escritorio</p>
                <p className="text-xs text-gray-400">Recibe alertas en tu navegador</p>
              </div>
            </div>
            <Switch
              checked={profile.notifications}
              onCheckedChange={(checked) => setProfile({ ...profile, notifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-white">Sonidos de chat</p>
                <p className="text-xs text-gray-400">Reproduce sonido al recibir mensajes</p>
              </div>
            </div>
            <Switch
              checked={profile.sounds}
              onCheckedChange={(checked) => setProfile({ ...profile, sounds: checked })}
            />
          </div>
        </div>
      </div>

      {/* Guardar */}
      <div className="flex justify-end">
        <Button className="bg-[#9EFF00] text-black hover:bg-[#8FEE00]">
          Guardar Cambios
        </Button>
      </div>
    </div>
  )
}
