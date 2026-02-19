import { ReactNode } from "react"

export function InfoCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
    return (
        <div className="relative flex items-center gap-3 bg-[#1a1a1a] border border-zinc-800 rounded-lg px-4 py-3 overflow-hidden  ">
            <div className="w-10 h-10 rounded-md bg-[#3F3F46] flex items-center justify-center shrink-0 text-gray-100">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm font-medium text-white truncate">{value}</p>
            </div>
        </div>
    )
}
