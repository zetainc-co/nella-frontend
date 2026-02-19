"use client"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Modal, ModalSection } from "@/components/shared/modal/modal"
import { User, Building2, Globe, MessageSquare, Tag, X } from "lucide-react"
import type { CreateContactModalProps } from "@/types/contact-types"
import { useCreateContact, useUpdateContact } from "@/hooks/useContacts"
import { useEffect } from "react"

const EMPTY_FORM = {
    name: "", email: "", phone: "", company: "",
    role: "", location: "", stage: "Lead", channel: "WhatsApp",
    channelDetails: "", linkedin: "", instagram: "", website: "",
    notes: "",
}

export function CreateContactModal({ open, onOpenChange, contact }: CreateContactModalProps) {
    const createContact = useCreateContact()
    const updateContact = useUpdateContact()
    const isEditMode = !!contact

    const [form, setForm] = useState(EMPTY_FORM)
    const [tags, setTags] = useState<string[]>([])
    const [tagInput, setTagInput] = useState("")

    // Pre-llenar el form cuando se abre en modo edición
    useEffect(() => {
        if (open && contact) {
            setForm({
                name: contact.name || "",
                email: contact.email || "",
                phone: contact.phone || "",
                company: contact.company || "",
                role: contact.role || "",
                location: contact.location || "",
                stage: contact.lead_status || "Lead",
                channel: contact.channel || "WhatsApp",
                channelDetails: contact.channelDetail || "",
                linkedin: "",
                instagram: "",
                website: "",
                notes: contact.ai_summary || "",
            })
            setTags(contact.tags || [])
        } else if (open && !contact) {
            setForm(EMPTY_FORM)
            setTags([])
        }
    }, [open, contact])

    const updateField = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    const addTag = () => {
        const trimmed = tagInput.trim()
        if (trimmed && !tags.includes(trimmed)) {
            setTags(prev => [...prev, trimmed])
            setTagInput("")
        }
    }

    const removeTag = (tag: string) => {
        setTags(prev => prev.filter(t => t !== tag))
    }

    const handleTagKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault()
            addTag()
        }
    }

    const isPending = createContact.isPending || updateContact.isPending

    const handleSubmit = () => {
        const onSuccess = () => {
            onOpenChange(false)
            setForm(EMPTY_FORM)
            setTags([])
        }

        if (isEditMode) {
            updateContact.mutate(
                {
                    id: Number(contact!.id),
                    payload: {
                        name: form.name || undefined,
                        email: form.email || undefined,
                        lead_status: form.stage || undefined,
                        tags: tags,
                        ai_summary: form.notes || undefined,
                    },
                },
                { onSuccess }
            )
        } else {
            createContact.mutate(
                {
                    phone: form.phone,
                    name: form.name || undefined,
                    email: form.email || undefined,
                    lead_status: form.stage || undefined,
                    tags: tags.length > 0 ? tags : undefined,
                },
                { onSuccess }
            )
        }
    }

    return (
        <Modal
            open={open}
            onOpenChange={onOpenChange}
            title={isEditMode ? "Editar Contacto" : "Nuevo Contacto"}
            description={isEditMode ? "Modifica la información del contacto" : "Completa la información del contacto"}
            footer={
                <>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="bg-[#1a1a1a] border-gray-700 text-white hover:bg-[#2a2a2a]"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isPending || !form.phone}
                        className="bg-[#8BD21D] hover:bg-[#7bc018] text-black font-semibold disabled:opacity-50"
                    >
                        {isPending
                            ? (isEditMode ? "Guardando..." : "Creando...")
                            : (isEditMode ? "Guardar Cambios" : "Crear Contacto")
                        }
                    </Button>
                </>
            }
        >
            <div className="space-y-6 py-2">
                {/* Información Básica */}
                <ModalSection icon={<User className="w-4 h-4" />} title="Información Básica">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-gray-300">
                                Nombre Completo <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                placeholder="Ej: Ana Gómez"
                                value={form.name}
                                onChange={(e) => updateField("name", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-300">
                                Email <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="email"
                                placeholder="Ej: ana@empresa.com"
                                value={form.email}
                                onChange={(e) => updateField("email", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-gray-300">
                                Teléfono <span className="text-red-500">*</span>
                            </Label>
                            <div className="flex gap-2">
                                <Select defaultValue="+57">
                                    <SelectTrigger className="w-[80px] shrink-0">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="+57">+57</SelectItem>
                                        <SelectItem value="+1">+1</SelectItem>
                                        <SelectItem value="+34">+34</SelectItem>
                                        <SelectItem value="+52">+52</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    placeholder="Ej: 310 234 5678"
                                    value={form.phone}
                                    onChange={(e) => updateField("phone", e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-300">
                                Empresa <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                placeholder="Ej: TechCorp SA"
                                value={form.company}
                                onChange={(e) => updateField("company", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-gray-300">Cargo</Label>
                            <Input
                                placeholder="Ej: Director de Ventas"
                                value={form.role}
                                onChange={(e) => updateField("role", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-300">Ubicación</Label>
                            <Input
                                placeholder="Ej: Bogotá, Colombia"
                                value={form.location}
                                onChange={(e) => updateField("location", e.target.value)}
                            />
                        </div>
                    </div>
                </ModalSection>

                {/* Clasificación */}
                <ModalSection icon={<Building2 className="w-4 h-4" />} title="Clasificación">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-gray-300">Estado</Label>
                            <Select value={form.stage} onValueChange={(v) => updateField("stage", v)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Lead">Lead</SelectItem>
                                    <SelectItem value="Cliente">Cliente</SelectItem>
                                    <SelectItem value="Inactivo">Inactivo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-300">Canal de Contacto</Label>
                            <Select value={form.channel} onValueChange={(v) => updateField("channel", v)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                                    <SelectItem value="Email">Email</SelectItem>
                                    <SelectItem value="Teléfono">Teléfono</SelectItem>
                                    <SelectItem value="Instagram">Instagram</SelectItem>
                                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-gray-300">Detalles del Canal</Label>
                        <Input
                            placeholder="Ej: Campaña Instagram Feb 2026"
                            value={form.channelDetails}
                            onChange={(e) => updateField("channelDetails", e.target.value)}
                        />
                    </div>
                </ModalSection>

                {/* Redes Sociales */}
                <ModalSection icon={<Globe className="w-4 h-4" />} title="Redes Sociales">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label className="text-gray-300 text-xs">
                                <Building2 className="w-3 h-3" /> LinkedIn
                            </Label>
                            <Input
                                placeholder="URL de LinkedIn"
                                value={form.linkedin}
                                onChange={(e) => updateField("linkedin", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-300 text-xs">
                                <Globe className="w-3 h-3" /> Instagram
                            </Label>
                            <Input
                                placeholder="@usuario"
                                value={form.instagram}
                                onChange={(e) => updateField("instagram", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-300 text-xs">
                                <Globe className="w-3 h-3" /> Sitio Web
                            </Label>
                            <Input
                                placeholder="https://ejemplo.com"
                                value={form.website}
                                onChange={(e) => updateField("website", e.target.value)}
                            />
                        </div>
                    </div>
                </ModalSection>

                {/* Notas */}
                <ModalSection icon={<MessageSquare className="w-4 h-4" />} title="Notas">
                    <Textarea
                        placeholder="Información adicional sobre el contacto..."
                        value={form.notes}
                        onChange={(e) => updateField("notes", e.target.value)}
                        className="min-h-[100px] bg-[#1a1a1a] border-gray-700 text-white placeholder:text-gray-500 focus:border-[#8BD21D] focus:ring-2 focus:ring-[#8BD21D]/20 resize-none"
                    />
                </ModalSection>

                {/* Etiquetas */}
                <ModalSection icon={<Tag className="w-4 h-4" />} title="Etiquetas">
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                            {tags.map(tag => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#3D4D28] text-[#97DC2A] text-xs font-medium border border-[#97DC2A]/30"
                                >
                                    {tag}
                                    <button
                                        onClick={() => removeTag(tag)}
                                        className="hover:text-white transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                    <div className="flex gap-2">
                        <Input
                            placeholder="Agregar etiqueta..."
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleTagKeyDown}
                            className="flex-1"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={addTag}
                            className="bg-transparent border-[#8BD21D]/40 text-[#8BD21D] hover:bg-[#8BD21D]/10 shrink-0"
                        >
                            Agregar
                        </Button>
                    </div>
                </ModalSection>
            </div>
        </Modal>
    )
}
