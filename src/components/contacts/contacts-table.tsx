"use client"

import { useState } from "react"
import { Search, Filter, MoreVertical, Mail, Phone, Building2 } from "lucide-react"

// Datos de ejemplo (mock)
const mockContacts = [
    {
        id: "1",
        name: "María González",
        email: "maria.gonzalez@empresa.com",
        phone: "+52 55 1234 5678",
        company: "Tech Solutions MX",
        stage: "En Propuesta",
        channel: "WhatsApp",
        createdAt: "2026-02-10",
    },
    {
        id: "2",
        name: "Carlos Rodríguez",
        email: "carlos.r@startup.io",
        phone: "+52 33 9876 5432",
        company: "StartupLab",
        stage: "Contactado",
        channel: "Instagram",
        createdAt: "2026-02-11",
    },
    {
        id: "3",
        name: "Ana Martínez",
        email: "ana.martinez@corp.com",
        phone: "+52 81 2468 1357",
        company: "Corp Internacional",
        stage: "Nuevo",
        channel: "Meta",
        createdAt: "2026-02-12",
    },
    {
        id: "4",
        name: "Luis Hernández",
        email: "luis.h@negocio.com",
        phone: "+52 55 8765 4321",
        company: "Negocio Digital",
        stage: "Cierre",
        channel: "TikTok",
        createdAt: "2026-02-13",
    },
]

const stageColors = {
    "Nuevo": "bg-blue-500/20 text-blue-300 border-blue-500/30",
    "Contactado": "bg-purple-500/20 text-purple-300 border-purple-500/30",
    "En Propuesta": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    "Cierre": "bg-green-500/20 text-green-300 border-green-500/30",
}

const channelColors = {
    "WhatsApp": "bg-emerald-500/20 text-emerald-300",
    "Instagram": "bg-pink-500/20 text-pink-300",
    "Meta": "bg-blue-500/20 text-blue-300",
    "TikTok": "bg-cyan-500/20 text-cyan-300",
}

export function ContactsTable() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedStage, setSelectedStage] = useState("all")

    const filteredContacts = mockContacts.filter(contact => {
        const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.company.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStage = selectedStage === "all" || contact.stage === selectedStage

        return matchesSearch && matchesStage
    })

    return (
        <div className="flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden">
            {/* Filters Bar */}
            <div className="flex items-center gap-4 p-4 border-b border-border bg-card">
                {/* Search */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email o empresa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                    />
                </div>

                {/* Stage Filter */}
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <select
                        value={selectedStage}
                        onChange={(e) => setSelectedStage(e.target.value)}
                        className="bg-background border border-border rounded-lg pl-10 pr-8 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                    >
                        <option value="all">Todas las etapas</option>
                        <option value="Nuevo">Nuevo</option>
                        <option value="Contactado">Contactado</option>
                        <option value="En Propuesta">En Propuesta</option>
                        <option value="Cierre">Cierre</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
                <table className="w-full">
                    <thead className="sticky top-0 bg-card border-b border-border">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Contacto
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Empresa
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Etapa
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Canal
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Fecha
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredContacts.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <Search className="size-12 text-muted" />
                                        <p className="text-muted-foreground text-sm">No se encontraron contactos</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredContacts.map((contact) => (
                                <tr
                                    key={contact.id}
                                    className="hover:bg-accent transition-colors cursor-pointer group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-medium text-foreground text-sm">
                                                {contact.name}
                                            </span>
                                            <div className="flex items-center gap-3 text-muted-foreground text-xs">
                                                <span className="flex items-center gap-1">
                                                    <Mail className="size-3" />
                                                    {contact.email}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Phone className="size-3" />
                                                    {contact.phone}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="size-4 text-muted-foreground" />
                                            <span className="text-sm text-foreground">{contact.company}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${stageColors[contact.stage as keyof typeof stageColors]}`}>
                                            {contact.stage}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${channelColors[contact.channel as keyof typeof channelColors]}`}>
                                            {contact.channel}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-muted-foreground">{contact.createdAt}</span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer con contador */}
            <div className="px-6 py-3 border-t border-border bg-card">
                <p className="text-sm text-muted-foreground">
                    Mostrando <span className="text-foreground font-medium">{filteredContacts.length}</span> de{" "}
                    <span className="text-foreground font-medium">{mockContacts.length}</span> contactos
                </p>
            </div>
        </div>
    )
}
