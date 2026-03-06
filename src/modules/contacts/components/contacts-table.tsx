"use client"

import { useState, useMemo } from "react"
import { Search, Filter, Download, Phone, Mail, ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ContactDetailModal } from "./contact-detail-modal"
import type { ContactDetail } from "@/modules/contacts/types/contact-types"
import { useContacts, useContactsSSE } from "@/modules/contacts/hooks/useContacts"
import type { BackendContact } from "@/modules/contacts/types/contacts"
import { STATUS_TO_STAGE, mapLeadStatusToStage, STAGE_BADGE } from "@/modules/kanban/hooks/use-kanban-constants"
import type { LeadStage } from "@/modules/kanban/types/kanban-types"

// ── Fuente única de verdad: stage del kanban determina badge y probabilidad ───
// new       → 25%  → "Nuevo"
// contacted → 50%  → "Calificado"
// proposal  → 75%  → "Negociación"
// closed    → 100% → "Lead"

function getContactStage(status: string | null, lead_status: string | null): LeadStage {
    if (status) {
        const mapped = STATUS_TO_STAGE[status.toLowerCase()]
        if (mapped) return mapped
    }
    return mapLeadStatusToStage(lead_status)
}

// Mapea un contacto del backend al tipo que usa la UI
function mapBackendContact(c: BackendContact): ContactDetail {
    const stage = getContactStage(c.status, c.lead_status)
    const { probability, displayLabel } = STAGE_BADGE[stage]

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
        stage: displayLabel,
        time: c.last_interaction_at
            ? new Date(c.last_interaction_at).toLocaleDateString('es', { day: 'numeric', month: 'short' })
            : '-',
        company: '-',
        role: '-',
        location: '-',
        score: probability,
        scoreLabel: displayLabel,
        channel: 'WhatsApp',
        channelDetail: '-',
        lastConversation: c.ai_summary || '-',
    }
}

const ITEMS_PER_PAGE = 5

const stageVariants = {
    "Nuevo":       "low",
    "Calificado":  "medium",
    "Negociación": "medium",
    "Lead":        "high",
} as const

const stageLabels = {
    "Nuevo":       "Nuevo",
    "Calificado":  "Calificado",
    "Negociación": "Negociación",
    "Lead":        "Lead",
}

export function ContactsTable() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedStage, setSelectedStage] = useState("Todos")
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedContact, setSelectedContact] = useState<ContactDetail | null>(null)

    // Get selected project from localStorage
    const selectedProjectId = typeof window !== 'undefined'
        ? localStorage.getItem('nella-selected-project')
        : null

    const { data: backendContacts = [], isLoading } = useContacts(
        selectedProjectId ? { project_id: selectedProjectId } : undefined
    )
    useContactsSSE()

    const contacts = useMemo(() => backendContacts.map(mapBackendContact), [backendContacts])

    const getInitials = (name: string | null | undefined) => {
        if (!name || typeof name !== 'string' || name.trim() === '') return '?'
        const trimmedName = name.trim()
        const parts = trimmedName.split(' ').filter(Boolean)
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        }
        return trimmedName.substring(0, 2).toUpperCase()
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
        const counts = { Nuevo: 0, Calificado: 0, Negociación: 0, Lead: 0 }
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
                        className="w-full bg-[#1a1a1a] border border-gray-700 rounded-md pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-colors"
                    />
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex items-center justify-between gap-4 mb-6">
                {/* Tabs de filtro */}
                <div className="flex items-center gap-2">
                    {["Todos", "Nuevo", "Calificado", "Negociación", "Lead"].map((stage) => (
                        <button
                            key={stage}
                            onClick={() => handleStageChange(stage)}
                            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                                selectedStage === stage
                                    ? "bg-[#2d1b69] text-[#A78BFA] border border-[#7C3AED]/40"
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
                            <div className="grid grid-cols-[1.5fr_1.5fr_1fr_auto_auto] items-center gap-6">
                                {/* Avatar y nombre */}
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 bg-[#3a3a3a]">
                                        {getInitials(contact.name)}
                                    </div>
                                    <h3 className="font-semibold text-white text-base">
                                        {contact.name}
                                    </h3>
                                </div>

                                {/* Email */}
                                <div className="flex items-center gap-2 text-gray-300">
                                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                                    <span className="text-sm truncate">{contact.email || '-'}</span>
                                </div>

                                {/* Teléfono */}
                                <div className="flex items-center gap-2 text-gray-300">
                                    <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                                    <span className="text-sm">{contact.phone}</span>
                                </div>

                                {/* Badge de estado */}
                                <div className="flex justify-center">
                                    <Badge
                                        variant={stageVariants[contact.stage as keyof typeof stageVariants]}
                                        size="lg"
                                        className="w-[110px] justify-center"
                                    >
                                        {stageLabels[contact.stage as keyof typeof stageLabels]}
                                    </Badge>
                                </div>

                                {/* Tiempo */}
                                <div className="text-sm text-gray-400 min-w-[80px] text-right">
                                    {contact.time}
                                </div>
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
                            <span className="w-2 h-2 rounded-full bg-gray-500" />
                            <span className="text-gray-400">Nuevos:</span>
                            <span className="font-bold text-white">{stageCounts.Nuevo}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-yellow-500" />
                            <span className="text-gray-400">Calificados:</span>
                            <span className="font-bold text-white">{stageCounts.Calificado}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-gray-400">Negociación:</span>
                            <span className="font-bold text-white">{stageCounts["Negociación"]}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#7C3AED]" />
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
                                            ? "bg-[#7C3AED] text-white"
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
