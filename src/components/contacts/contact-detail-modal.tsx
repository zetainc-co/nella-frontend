"use client"

import {
    Mail,
    Phone,
    MapPin,
    Globe,
    MessageSquare,
    Tag,
    Sparkles,
    MessageCircle,
    PhoneCall,
} from "lucide-react"
import { Modal } from "@/components/shared/modal/modal"
import { Button } from "@/components/ui/button"
import { ScoreRing } from "./score-ring"
import { InfoCard } from "./info-card"
import { ContactHeader } from "./contact-header"

export interface ContactDetail {
    id: string
    name: string
    company: string
    role: string
    phone: string
    stage: string
    time: string
    email: string
    location: string
    score: number
    scoreLabel: string
    channel: string
    channelDetail: string
    lastConversation: string
    tags: string[]
}

interface ContactDetailModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    contact: ContactDetail | null
}

export function ContactDetailModal({ open, onOpenChange, contact }: ContactDetailModalProps) {
    if (!contact) return null

    return (
        <Modal
            open={open}
            onOpenChange={onOpenChange}
            header={<ContactHeader contact={contact} />}
            footer={
                <div className="flex gap-3 w-full">
                    <Button className="flex-1 bg-[#8BD21D] hover:bg-[#7bc018] text-black font-semibold">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Iniciar Conversación
                    </Button>
                    <Button
                        variant="outline"
                        className="bg-[#1a1a1a] border-gray-700 text-white hover:bg-[#2a2a2a]"
                    >
                        <PhoneCall className="w-4 h-4 mr-2" />
                        Programar Llamada
                    </Button>
                </div>
            }
        >
            <div className="space-y-6">
                {/* Datos de Negocio */}
                <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
                        <Sparkles className="w-4 h-4 text-yellow-500" />
                        Datos de Negocio
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4 shadow-[0_-4px_20px_-6px_rgba(56,189,248,0.06)]">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-gray-400">Score IA</span>
                                <span className={`text-sm font-semibold ${
                                    contact.score >= 70 ? "text-green-400" :
                                    contact.score >= 40 ? "text-yellow-400" : "text-red-400"
                                }`}>
                                    {contact.scoreLabel}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <ScoreRing score={contact.score} />
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    Probabilidad de cierre estimada por IA
                                </p>
                            </div>
                        </div>

                        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4 flex items-center gap-3 shadow-[0_-4px_20px_-6px_rgba(56,189,248,0.06)]">
                            <div className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center shrink-0">
                                <Globe className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Canal de Origen</p>
                                <p className="text-sm font-semibold text-white">{contact.channel}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{contact.channelDetail}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Información de Contacto */}
                <div>
                    <h4 className="text-sm font-semibold text-white mb-3">Información de Contacto</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <InfoCard
                            icon={<Mail className="w-4 h-4 text-gray-400" />}
                            label="Email"
                            value={contact.email}
                        />
                        <InfoCard
                            icon={<Phone className="w-4 h-4 text-gray-400" />}
                            label="Teléfono"
                            value={contact.phone}
                        />
                    </div>
                    <div className="mt-3 max-w-[calc(50%-6px)]">
                        <InfoCard
                            icon={<MapPin className="w-4 h-4 text-gray-400" />}
                            label="Ubicación"
                            value={contact.location}
                        />
                    </div>
                </div>

                {/* Contexto */}
                <div>
                    <h4 className="text-sm font-semibold text-white mb-3">Contexto</h4>
                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4 shadow-[0_-4px_20px_-6px_rgba(56,189,248,0.06)]">
                        <div className="flex items-center gap-2 mb-2">
                            <MessageSquare className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-semibold text-white">Última Conversación</span>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            {contact.lastConversation}
                        </p>
                    </div>
                </div>

                {/* Etiquetas */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-white">
                            <Tag className="w-4 h-4 text-gray-400" />
                            Etiquetas
                        </h4>
                        <button className="text-sm text-[#8BD21D] hover:text-[#a0e632] transition-colors">
                            + Agregar Etiqueta
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {contact.tags.map(tag => (
                            <span
                                key={tag}
                                className="px-3 py-1.5 rounded-md bg-[#1a1a1a] border border-gray-700 text-sm text-gray-300"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    )
}
