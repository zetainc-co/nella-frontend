"use client"

import { ReactNode, useEffect, useState, useCallback } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title?: string
    description?: string
    header?: ReactNode
    children: ReactNode
    footer?: ReactNode
    className?: string
    size?: "sm" | "md" | "lg" | "xl"
}

const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-3xl",
}

export function Modal({
    open,
    onOpenChange,
    title,
    description,
    header,
    children,
    footer,
    className,
    size = "lg",
}: ModalProps) {
    const [mounted, setMounted] = useState(false)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (open) {
            setMounted(true)
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setVisible(true))
            })
        } else {
            setVisible(false)
            const timer = setTimeout(() => setMounted(false), 250)
            return () => clearTimeout(timer)
        }
    }, [open])

    const handleClose = useCallback(() => {
        onOpenChange(false)
    }, [onOpenChange])

    useEffect(() => {
        if (!mounted) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") handleClose()
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [mounted, handleClose])

    if (!mounted) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
                className={cn(
                    "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-250",
                    visible ? "opacity-100" : "opacity-0"
                )}
                onClick={handleClose}
            />

            {/* Modal */}
            <div
                className={cn(
                    "relative z-10 w-full flex flex-col rounded-xl border border-zinc-700 bg-[#1C1C1D] shadow-2xl",
                    "max-h-[90vh] mx-4",
                    "transition-all duration-250 ease-out",
                    visible
                        ? "opacity-100 scale-100 translate-y-0"
                        : "opacity-0 scale-95 translate-y-4",
                    sizeClasses[size],
                    className
                )}
            >
                {/* Header: custom | title | solo X */}
                {header ? (
                    <div className="relative overflow-hidden rounded-t-xl bg-[#1C1C1D] border-b border-zinc-800/50">
                        <div className="absolute -top-24 -right-24 w-60 h-60 bg-[radial-gradient(circle,rgba(56,189,248,0.12)_0%,transparent_80%)] pointer-events-none" />
                        {/* Close */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 z-10 p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        {/* Custom header content */}
                        <div className="relative px-6 pt-6 pb-5">
                            {header}
                        </div>
                    </div>
                ) : title ? (
                    <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-zinc-800/50">
                        <div>
                            <h2 className="text-xl font-bold text-white">{title}</h2>
                            {description && (
                                <p className="text-sm text-zinc-400 mt-1">{description}</p>
                            )}
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-[#2a2a2a] transition-colors shrink-0"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 z-10 p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-[#2a2a2a] transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}

                {/* Body (scrollable) */}
                <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-800">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    )
}

interface ModalSectionProps {
    icon: ReactNode
    title: string
    children: ReactNode
}

export function ModalSection({ icon, title, children }: ModalSectionProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <span className="text-zinc-400">{icon}</span>
                {title}
            </div>
            {children}
        </div>
    )
}
