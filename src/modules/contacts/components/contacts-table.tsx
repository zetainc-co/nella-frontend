"use client"

import { useState, useMemo } from "react"
import { Search, Filter, Download, MoreVertical, Phone, ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ContactDetailModal } from "./contact-detail-modal"
import type { ContactDetail } from "@/modules/contacts/types/contact-types"
import { useContacts } from "@/modules/contacts/hooks/useContacts"
import type { BackendContact } from "@/modules/contacts/types/contacts"

// Mapea lead_status (ai_clasificacion de n8n) a la categoría del UI
// Lead = conversación activa (COLD LEAD, WARM LEAD, HOT LEAD, SOPORTE HUMANO)
// Cliente = cerró/convirtió (AGENDADO, CIERRE GANADO)
// Inactivo = descartado/perdido (DESCARTADO, CIERRE PERDIDO, null)
const LEAD_STATUSES = ['COLD', 'COLD LEAD', 'WARM', 'WARM LEAD', 'HOT', 'HOT LEAD', 'HUMAN_ATTENTION', 'SOPORTE HUMANO']
const CLIENTE_STATUSES = ['AGENDADO', 'CIERRE GANADO', 'CLOSED', 'CONVERTED']
const INACTIVE_STATUSES = ['DESCARTADO', 'CIERRE PERDIDO', 'INACTIVE']

function mapLeadStatusToStage(status: string | null): string {
    if (!status) return 'Inactivo'
    const upper = status.toUpperCase()
    if (LEAD_STATUSES.includes(upper)) return 'Lead'
    if (CLIENTE_STATUSES.includes(upper)) return 'Cliente'
    if (INACTIVE_STATUSES.includes(upper)) return 'Inactivo'
    return 'Lead'
}

// Score IA basado en lead_status (ai_clasificacion de n8n)
const SCORE_MAP: Record<string, { score: number; label: string }> = {
    'WARM LEAD':        { score: 90, label: 'Alto' },
    'HOT LEAD':         { score: 60, label: 'Calificado' },
    'HOT':              { score: 60, label: 'Calificado' },
    'HUMAN_ATTENTION':  { score: 75, label: 'Atención' },
    'SOPORTE HUMANO':   { score: 75, label: 'Atención' },
    'COLD LEAD':        { score: 20, label: 'Bajo' },
    'COLD':             { score: 20, label: 'Bajo' },
    'AGENDADO':         { score: 95, label: 'Cerrado' },
    'CIERRE GANADO':    { score: 100, label: 'Ganado' },
    'DESCARTADO':       { score: 5, label: 'Descartado' },
    'CIERRE PERDIDO':   { score: 5, label: 'Perdido' },
}

function mapLeadStatusToScore(status: string | null): { score: number; label: string } {
    if (!status) return { score: 0, label: '-' }
    return SCORE_MAP[status.toUpperCase()] || { score: 0, label: '-' }
}

// Mapea un contacto del backend al tipo que usa la UI
function mapBackendContact(c: BackendContact): ContactDetail {
    return {
        id: String(c.id),
        name: c.name || c.phone,
        phone: c.phone,
        email: c.email || '',
        tags: c.tags || [],
        lead_status: c.lead_status,
        handoff_active: c.handoff_active,
        ai_summary: c.ai_summary || '',
        last_interaction_at: c.last_interaction_at,
        stage: mapLeadStatusToStage(c.lead_status),
        time: c.last_interaction_at
            ? new Date(c.last_interaction_at).toLocaleDateString('es', { day: 'numeric', month: 'short' })
            : '-',
        company: '-',
        role: '-',
        location: '-',
        score: mapLeadStatusToScore(c.lead_status).score,
        scoreLabel: mapLeadStatusToScore(c.lead_status).label,
        channel: 'WhatsApp',
        channelDetail: '-',
        lastConversation: c.ai_summary || '-',
    }
}

const ITEMS_PER_PAGE = 5

const stageVariants = {
    "Cliente": "cliente",
    "Lead": "lead",
    "Inactivo": "inactivo",
} as const

const stageLabels = {
    "Cliente": "Cliente",
    "Lead": "Lead",
    "Inactivo": "Inactivo",
}

export function ContactsTable() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedStage, setSelectedStage] = useState("Todos")
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedContact, setSelectedContact] = useState<ContactDetail | null>(null)

    const { data: backendContacts = [], isLoading } = useContacts()

    const contacts = useMemo(() => backendContacts.map(mapBackendContact), [backendContacts])

    const getInitials = (name: string) => {
        const parts = name.split(' ')
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        }
        return name.substring(0, 2).toUpperCase()
    }

    const filteredContacts = useMemo(() => {
        return contacts.filter(contact => {
            const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contact.role.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesStage = selectedStage === "Todos" || contact.stage === selectedStage
            return matchesSearch && matchesStage
        })
    }, [contacts, searchTerm, selectedStage])

    const totalPages = Math.ceil(filteredContacts.length / ITEMS_PER_PAGE)
    const paginatedContacts = filteredContacts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    const stageCounts = useMemo(() => {
        const counts = { Cliente: 0, Lead: 0, Inactivo: 0 }
        filteredContacts.forEach(c => {
            if (c.stage in counts) counts[c.stage as keyof typeof counts]++
        })
        return counts
    }, [filteredContacts])

    const handleStageChange = (stage: string) => {
        setSelectedStage(stage)
        setCurrentPage(1)
    }

    const handleSearchChange = (value: string) => {
        setSearchTerm(value)
        setCurrentPage(1)
    }

    if (isLoading) {
        return (
            <div className="flex flex-col gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="bg-[#1a1a1e] border border-gray-800 rounded-lg p-5 animate-pulse">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gray-700" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-700 rounded w-1/3" />
                                <div className="h-3 bg-gray-800 rounded w-1/4" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Barra de búsqueda */}
            <div className="mb-6">
                <div className="relative max-w-2xl">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email, empresa o teléfono..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full bg-[#1a1a1a] border border-gray-700 rounded-md pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#8BD21D] focus:ring-2 focus:ring-[#8BD21D]/20 transition-colors"
                    />
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex items-center justify-between gap-4 mb-6">
                {/* Tabs de filtro */}
                <div className="flex items-center gap-2">
                    {["Todos", "Cliente", "Lead", "Inactivo"].map((stage) => (
                        <button
                            key={stage}
                            onClick={() => handleStageChange(stage)}
                            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                                selectedStage === stage
                                    ? "bg-[#1a2a10] text-[#8BD21D] border border-[#8BD21D]/40"
                                    : "bg-[#1a1a1a] text-gray-300 hover:text-white border border-gray-700"
                            }`}
                        >
                            {stage}
                        </button>
                    ))}
                </div>

                {/* Botones de acción */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="bg-[#1a1a1a] border-gray-800 text-white hover:bg-[#2a2a2a]"
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        Filtros
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="bg-[#1a1a1a] border-gray-800 text-white hover:bg-[#2a2a2a]"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Exportar
                    </Button>
                </div>
            </div>

            {/* Lista de contactos */}
            <div className="flex-1 overflow-auto space-y-3">
                {paginatedContacts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40">
                        <Search className="w-12 h-12 text-gray-600 mb-2" />
                        <p className="text-gray-400 text-sm">No se encontraron contactos</p>
                    </div>
                ) : (
                    paginatedContacts.map((contact) => (
                        <div
                            key={contact.id}
                            onClick={() => setSelectedContact(contact)}
                            className="bg-gradient-to-b from-[#1a1a1e] to-[#18191C] border border-gray-800 rounded-lg p-5 hover:border-gray-700 transition-colors cursor-pointer"
                        >
                            <div className="grid grid-cols-[2fr_1fr_1fr_auto_auto_auto] items-center gap-4">
                                {/* Avatar y nombre */}
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 bg-[#3a3a3a]">
                                        {getInitials(contact.name)}
                                    </div>
                                    <h3 className="font-semibold text-white text-base">
                                        {contact.name}
                                    </h3>
                                </div>

                                {/* Empresa y rol */}
                                <div>
                                    <p className="text-sm text-white font-medium">
                                        {contact.company}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {contact.role}
                                    </p>
                                </div>

                                {/* Teléfono */}
                                <div className="flex items-center gap-2 text-gray-300">
                                    <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                                    <span className="text-sm">{contact.phone}</span>
                                </div>

                                {/* Badge de estado */}
                                <div className="flex justify-center min-w-[100px]">
                                    <Badge
                                        variant={stageVariants[contact.stage as keyof typeof stageVariants]}
                                        size="lg"
                                    >
                                        {stageLabels[contact.stage as keyof typeof stageLabels]}
                                    </Badge>
                                </div>

                                {/* Tiempo */}
                                <div className="text-sm text-gray-400 min-w-[80px] text-right">
                                    {contact.time}
                                </div>

                                {/* Menú de opciones */}
                                <button
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-2 hover:bg-[#2a2a2a] rounded-md transition-colors"
                                >
                                    <MoreVertical className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer: Stats + Paginación */}
            <div className="mt-4 bg-[#1a1a1e] border border-gray-800 rounded-lg px-5 py-3 flex items-center justify-between">
                <p className="text-sm text-gray-400">
                    Mostrando <span className="font-bold text-white">{paginatedContacts.length}</span> de <span className="font-bold text-white">{filteredContacts.length}</span> contactos
                </p>

                <div className="flex items-center gap-6">
                    {/* Stats por etapa */}
                    <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#8BD21D]" />
                            <span className="text-gray-400">Clientes:</span>
                            <span className="font-bold text-white">{stageCounts.Cliente}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-gray-400">Leads:</span>
                            <span className="font-bold text-white">{stageCounts.Lead}</span>
                        </span>
                    </div>

                    {/* Paginación */}
                    {totalPages > 1 && (
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-1.5 rounded-md hover:bg-[#2a2a2a] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4 text-gray-400" />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                                        currentPage === page
                                            ? "bg-[#8BD21D] text-black"
                                            : "text-gray-400 hover:bg-[#2a2a2a] hover:text-white"
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-1.5 rounded-md hover:bg-[#2a2a2a] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Detalle */}
            <ContactDetailModal
                open={!!selectedContact}
                onOpenChange={(open) => { if (!open) setSelectedContact(null) }}
                contact={selectedContact}
            />
        </div>
    )
}
