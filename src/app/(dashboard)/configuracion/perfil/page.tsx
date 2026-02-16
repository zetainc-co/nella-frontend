// src/app/(dashboard)/configuracion/perfil/page.tsx
"use client"

import { useState } from 'react'
import { mockUserProfile } from '@/lib/mock-data/settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Bell, Volume2, Lock } from 'lucide-react'

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
      <div className="auth-card p-6">
        <h2 className="text-lg font-bold text-foreground mb-4">Foto de Perfil</h2>

        <div className="flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary/40 bg-primary/10 text-2xl font-bold text-primary">
            {profile.avatar}
          </div>
          <div>
            <p className="text-sm text-foreground mb-1">Actualiza tu foto de perfil</p>
            <p className="text-xs text-muted-foreground">JPG, PNG o GIF. Máximo 2MB</p>
          </div>
        </div>
      </div>

      {/* Información Personal */}
      <div className="auth-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-foreground">Información Personal</h2>
          <Button variant="outline" size="sm">Editar</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nombre Completo</Label>
            <Input
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="auth-input"
            />
          </div>

          <div className="space-y-2">
            <Label>Correo Electrónico</Label>
            <Input
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="auth-input"
            />
          </div>

          <div className="space-y-2">
            <Label>Cargo / Rol</Label>
            <Input
              value={profile.role}
              onChange={(e) => setProfile({ ...profile, role: e.target.value })}
              className="auth-input"
            />
          </div>

          <div className="space-y-2">
            <Label>Contraseña</Label>
            <div className="relative">
              <Input
                type="password"
                value="••••••••"
                disabled
                className="auth-input"
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* Preferencias */}
      <div className="auth-card p-6">
        <h2 className="text-lg font-bold text-foreground mb-6">Preferencias</h2>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Notificaciones de escritorio</p>
                <p className="text-xs text-muted-foreground">Recibe alertas en tu navegador</p>
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
                <p className="text-sm font-medium text-foreground">Sonidos de chat</p>
                <p className="text-xs text-muted-foreground">Reproduce sonido al recibir mensajes</p>
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
        <Button className="btn-primary">
          Guardar Cambios
        </Button>
      </div>
    </div>
  )
}
