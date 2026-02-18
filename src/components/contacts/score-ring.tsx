export function ScoreRing({ score }: { score: number }) {
    const radius = 30
    const stroke = 5
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (score / 100) * circumference

    return (
        <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 70 70">
                <circle
                    cx="35" cy="35" r={radius}
                    fill="none"
                    stroke="#2a2a2a"
                    strokeWidth={stroke}
                />
                <circle
                    cx="35" cy="35" r={radius}
                    fill="none"
                    stroke="#EAB308"
                    strokeWidth={stroke}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                />
            </svg>
            <span className="absolute text-sm font-bold text-white">{score}%</span>
        </div>
    )
}
