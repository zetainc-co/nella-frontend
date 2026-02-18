"use client"

import { useState, useMemo } from "react"
import { Search, Filter, Download, MoreVertical, Phone, ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ContactDetailModal, type ContactDetail } from "./contact-detail-modal"

// Datos de ejemplo (mock) con datos extendidos para el detalle
const mockContacts: ContactDetail[] = [
    {
        id: "1",
        name: "Ana Gómez",
        company: "TechCorp SA",
        role: "Directora de Compras",
        phone: "+57 310 234 5678",
        stage: "Cliente",
        time: "hace 2h",
        email: "ana.gomez@techcorp.co",
        location: "Bogotá, Colombia",
        score: 92,
        scoreLabel: "Alto",
        channel: "WhatsApp",
        channelDetail: "Campaña Google Ads",
        lastConversation: "Interesada en plan enterprise. Solicita demo para su equipo de 15 personas.",
        tags: ["VIP", "Enterprise"],
    },
    {
        id: "2",
        name: "Carlos Ruiz",
        company: "Innova Digital",
        role: "CEO",
        phone: "+57 315 876 5432",
        stage: "Lead",
        time: "hace 5h",
        email: "carlos@innovadigital.co",
        location: "Medellín, Colombia",
        score: 65,
        scoreLabel: "Medio",
        channel: "LinkedIn",
        channelDetail: "Conexión directa",
        lastConversation: "Consultó precios y planes. Necesita propuesta para presentar a junta directiva.",
        tags: ["Nuevo lead", "B2B"],
    },
    {
        id: "3",
        name: "María López",
        company: "Startup Solutions",
        role: "Gerente de Marketing",
        phone: "+57 320 123 9876",
        stage: "Lead",
        time: "hace 1d",
        email: "maria.lopez@startup.co",
        location: "Cali, Colombia",
        score: 78,
        scoreLabel: "Medio",
        channel: "Sitio Web",
        channelDetail: "Landing Page - Formulario",
        lastConversation: "Primera interacción. Descargó nuestro whitepaper sobre automatización de ventas. Empresa en crecimiento rápido.",
        tags: ["Nuevo lead", "Calificación pendiente"],
    },
    {
        id: "4",
        name: "Luis Rodríguez",
        company: "Empresa Global",
        role: "Director Comercial",
        phone: "+57 318 456 7890",
        stage: "Inactivo",
        time: "hace 15d",
        email: "luis.rodriguez@global.co",
        location: "Barranquilla, Colombia",
        score: 20,
        scoreLabel: "Bajo",
        channel: "Email",
        channelDetail: "Newsletter mensual",
        lastConversation: "No respondió a los últimos 3 seguimientos. Posible cambio de proveedor.",
        tags: ["Reactivar", "Seguimiento"],
    },
    {
        id: "5",
        name: "Patricia Morales",
        company: "Digital Co",
        role: "VP de Ventas",
        phone: "+57 311 234 8765",
        stage: "Cliente",
        time: "hace 30min",
        email: "patricia@digitalco.co",
        location: "Bogotá, Colombia",
        score: 88,
        scoreLabel: "Alto",
        channel: "WhatsApp",
        channelDetail: "Referido por Ana Gómez",
        lastConversation: "Renovó suscripción anual. Interesada en módulo de analytics avanzado.",
        tags: ["VIP", "Upsell"],
    },
    {
        id: "6",
        name: "Diego Fernández",
        company: "Nexus Corp",
        role: "CTO",
        phone: "+57 312 567 8901",
        stage: "Lead",
        time: "hace 3h",
        email: "diego@nexuscorp.co",
        location: "Cartagena, Colombia",
        score: 55,
        scoreLabel: "Medio",
        channel: "Instagram",
        channelDetail: "Campaña Instagram Feb 2026",
        lastConversation: "Solicitó información técnica sobre integraciones API.",
        tags: ["Técnico", "API"],
    },
    {
        id: "7",
        name: "Camila Torres",
        company: "Soluciones XYZ",
        role: "Gerente General",
        phone: "+57 314 890 1234",
        stage: "Lead",
        time: "hace 7h",
        email: "camila@solucionesxyz.co",
        location: "Bucaramanga, Colombia",
        score: 42,
        scoreLabel: "Medio",
        channel: "Sitio Web",
        channelDetail: "Blog - Artículo SEO",
        lastConversation: "Descargó caso de estudio. Empresa pequeña con potencial de crecimiento.",
        tags: ["PYME", "Contenido"],
    },
    {
        id: "8",
        name: "Roberto Sánchez",
        company: "Alpha Tech",
        role: "Director de TI",
        phone: "+57 316 345 6789",
        stage: "Cliente",
        time: "hace 1d",
        email: "roberto@alphatech.co",
        location: "Pereira, Colombia",
        score: 85,
        scoreLabel: "Alto",
        channel: "WhatsApp",
        channelDetail: "Evento presencial Bogotá",
        lastConversation: "Implementación exitosa. Solicitó capacitación adicional para nuevo equipo.",
        tags: ["Onboarding", "Capacitación"],
    },
]

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

    const getInitials = (name: string) => {
        const parts = name.split(' ')
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        }
        return name.substring(0, 2).toUpperCase()
    }

    const filteredContacts = useMemo(() => {
        return mockContacts.filter(contact => {
            const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contact.role.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesStage = selectedStage === "Todos" || contact.stage === selectedStage
            return matchesSearch && matchesStage
        })
    }, [searchTerm, selectedStage])

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
