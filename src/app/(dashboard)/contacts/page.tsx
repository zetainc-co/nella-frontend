"use client"

import { Plus } from "lucide-react"
import { ContactsTable } from "@/components/contacts/contacts-table"

export default function ContactsPage() {
    return (
        <div className="flex flex-col h-full p-6 bg-background text-foreground overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Contactos</h1>
                    <p className="text-muted-foreground text-sm">Gestiona tu base de datos de clientes y leads.</p>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0">
                <ContactsTable />
            </div>
        </div>
    )
}
