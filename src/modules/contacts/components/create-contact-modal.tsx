"use client"

import {
    Select,
    SelectItem,
    SelectValue,
    SelectTrigger,
    SelectContent,
} from "@/components/ui/select"
import { useState } from "react"
import { useEffect } from "react"
import { User, Tag, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Modal, ModalSection } from "@/components/shared/modal/modal"
import type { CreateContactModalProps } from "@/modules/contacts/types/contact-types"
import { useCreateContact, useUpdateContact } from "@/modules/contacts/hooks/useContacts"

const EMPTY_FORM = {
    name: "", email: "", phone: "", channel: "",
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
                channel: contact.channel || "",
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

        // Get selected project from localStorage
        const selectedProjectId = typeof window !== 'undefined'
            ? localStorage.getItem('nella-selected-project')
            : null

        if (isEditMode) {
            updateContact.mutate(
                {
                    id: Number(contact!.id),
                    payload: {
                        name: form.name || undefined,
                        email: form.email || undefined,
                        tags: tags.length > 0 ? tags : undefined,
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
                    tags: tags.length > 0 ? tags : undefined,
                    project_id: selectedProjectId || undefined,
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
                        className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold disabled:opacity-50"
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
                </ModalSection>

                {/* Etiquetas */}
                <ModalSection icon={<Tag className="w-4 h-4" />} title="Etiquetas">
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                            {tags.map(tag => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#2d1b69] text-[#A78BFA] text-xs font-medium border border-[#7C3AED]/30"
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
                            className="bg-transparent border-[#7C3AED]/40 text-[#A78BFA] hover:bg-[#7C3AED]/10 shrink-0"
                        >
                            Agregar
                        </Button>
                    </div>
                </ModalSection>
            </div>
        </Modal>
    )
}
