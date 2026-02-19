"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { ContactsTable } from "@/components/contacts/contacts-table"
import { CreateContactModal } from "@/components/contacts/create-contact-modal"

export default function ContactsPage() {
    const [showCreateModal, setShowCreateModal] = useState(false)

    return (
        <div className="flex flex-col h-full min-h-screen p-6 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Contactos</h1>
                    <p className="text-gray-400 text-sm mt-1">Gestión centralizada de tu base de datos</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 bg-[#8BD21D] hover:bg-[#7bc018] text-black font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Contacto
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0">
                <ContactsTable />
            </div>

            {/* Modal Crear Contacto */}
            <CreateContactModal
                open={showCreateModal}
                onOpenChange={setShowCreateModal}
            />
        </div>
    )
}
