"use client"

import {
    Mail,
    Phone,
    MessageSquare,
    Tag,
    Sparkles,
    MessageCircle,
    PhoneCall,
} from "lucide-react"
import { useState } from "react"
import { Modal } from "@shared/components/modal/modal"
import { Button } from "@/components/ui/button"
import { ScoreRing } from "./score-ring"
import { InfoCard } from "./info-card"
import { ContactHeader } from "./contact-header"
import { ChannelIcon } from "./channel-icon"
import { CreateContactModal } from "./create-contact-modal"
import type { ContactDetailModalProps } from "@/modules/contacts/types/contact-types"

export function ContactDetailModal({ open, onOpenChange, contact }: ContactDetailModalProps) {
    const [showEditModal, setShowEditModal] = useState(false)

    if (!contact) return null

    return (
        <>
        <Modal
            open={open}
            onOpenChange={onOpenChange}
            header={<ContactHeader contact={contact} onEdit={() => setShowEditModal(true)} />}
            footer={
                <div className="flex gap-3 w-full">
                    <Button className="flex-1 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold">
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
                        <div className="bg-[#1a1a1a] border border-zinc-800 rounded-lg p-4  ">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-gray-400">Score IA</span>
                                <span className={`text-sm font-semibold ${
                                    contact.score >= 70 ? "text-[#A78BFA]" :
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

                        <div className="bg-[#1a1a1a] border border-zinc-800 rounded-lg p-4 flex items-center gap-3">
                            <ChannelIcon channel={contact.channel} />
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
                            icon={<Mail className="w-5 h-5 text-gray-200" />}
                            label="Email"
                            value={contact.email}
                        />
                        <InfoCard
                            icon={<Phone className="w-5 h-5 text-gray-200" />}
                            label="Teléfono"
                            value={contact.phone}
                        />
                    </div>
                </div>

                {/* Contexto */}
                <div>
                    <h4 className="text-sm font-semibold text-white mb-3">Contexto</h4>
                        <div className="bg-[#1a1a1a] border border-zinc-800 rounded-lg p-4  ">
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
                        <button className="text-sm text-[#A78BFA] hover:text-[#C4B5FD] transition-colors">
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

            <CreateContactModal
                open={showEditModal}
                onOpenChange={setShowEditModal}
                contact={contact}
            />
        </>
    )
}
