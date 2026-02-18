import { Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ContactDetail } from "./contact-detail-modal"

const stageVariants: Record<string, "cliente" | "lead" | "inactivo"> = {
    "Cliente": "cliente",
    "Lead": "lead",
    "Inactivo": "inactivo",
}

function getInitials(name: string) {
    const parts = name.split(" ")
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return name.substring(0, 2).toUpperCase()
}

export function ContactHeader({ contact }: { contact: ContactDetail }) {
    return (
        <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-[#2a2a2e] border border-gray-700 flex items-center justify-center text-white text-lg font-bold shrink-0">
                {getInitials(contact.name)}
            </div>
            <div className="flex-1 min-w-0 pr-10">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">{contact.name}</h3>
                    <Button
                        variant="outline"
                        size="sm"
                        className="bg-[#1a1a1a] border-gray-700 text-white hover:bg-[#2a2a2a]"
                    >
                        <Pencil className="w-3.5 h-3.5 mr-1.5" />
                        Editar
                    </Button>
                </div>
                <p className="text-sm text-gray-400">{contact.role}</p>
                <p className="text-sm text-gray-400">{contact.company}</p>
                <div className="mt-2">
                    <Badge variant={stageVariants[contact.stage]} size="default">
                        {contact.stage}
                    </Badge>
                </div>
            </div>
        </div>
    )
}
