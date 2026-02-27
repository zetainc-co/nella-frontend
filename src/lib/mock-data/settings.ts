// src/lib/mock-data/settings.ts

export const mockUserProfile = {
  name: "Giovanny Gómez",
  email: "giovanny@nellasales.com",
  role: "Director Comercial",
  avatar: "GG",
  notifications: true,
  sounds: false
}

export const mockOrganization = {
  name: "NellaSales",
  nit: "900.123.456-7",
  industry: "Tecnología",
  phone: "+57 310 234 5678",
  address: "Calle 123 #45-67, Bogotá, Colombia"
}

export const mockConnections = [
  {
    id: "instagram",
    name: "Instagram Direct",
    description: "Gestiona mensajes directos desde tu cuenta de Instagram Business",
    icon: "instagram",
    connected: false
  },
  {
    id: "facebook",
    name: "Facebook Lead Ads & Costos",
    description: "Sincroniza tus formularios de clientes potenciales y calcula tu ROAS automáticamente",
    icon: "facebook",
    connected: false
  },
  {
    id: "calendar",
    name: "Sincronización de Agenda",
    description: "Permite que la IA verifique tu disponibilidad y agende citas en tiempo real",
    icon: "calendar",
    connected: false
  }
]

export const mockTeam = [
  {
    id: "1",
    name: "Giovanny Gómez",
    email: "giovanny@nellasales.com",
    role: "Administrador",
    status: "active",
    avatar: "GG"
  },
  {
    id: "2",
    name: "María García",
    email: "maria@nellasales.com",
    role: "Vendedor",
    status: "active",
    avatar: "MG"
  },
  {
    id: "3",
    name: "Carlos Méndez",
    email: "carlos@nellasales.com",
    role: "Vendedor",
    status: "pending",
    avatar: "CM"
  }
]

export const mockBilling = {
  plan: "Plan Profesional",
  price: 149000,
  currency: "COP",
  licenses: { used: 2, total: 5 },
  nextBilling: "2026-03-16",
  paymentMethod: {
    type: "visa",
    last4: "4242",
    expiresAt: "12/2027"
  }
}
