import { ReactNode } from "react"

export function InfoCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
    return (
        <div className="relative flex items-center gap-3 bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-3 overflow-hidden shadow-[0_-4px_20px_-6px_rgba(56,189,248,0.06)]">
            <div className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center shrink-0">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm font-medium text-white truncate">{value}</p>
            </div>
        </div>
    )
}
