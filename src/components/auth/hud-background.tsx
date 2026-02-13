export function HudBackground() {
  return (
    <>
      {/* Scanlines Effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(206, 242, 93, 0.03) 2px, rgba(206, 242, 93, 0.03) 4px)',
        }}
      />

      {/* Animated Grid Lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(206, 242, 93, 0.1)" strokeWidth="0.5" />
          </pattern>
          <linearGradient id="fadeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(206, 242, 93, 0)" />
            <stop offset="50%" stopColor="rgba(206, 242, 93, 1)" />
            <stop offset="100%" stopColor="rgba(206, 242, 93, 0)" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Animated vertical scanning line */}
        <line x1="20%" y1="0" x2="20%" y2="100%" stroke="url(#fadeGradient)" strokeWidth="2" opacity="0.4">
          <animate attributeName="x1" values="0%;100%;0%" dur="8s" repeatCount="indefinite" />
          <animate attributeName="x2" values="0%;100%;0%" dur="8s" repeatCount="indefinite" />
        </line>

        {/* Animated horizontal scanning line */}
        <line x1="0" y1="30%" x2="100%" y2="30%" stroke="url(#fadeGradient)" strokeWidth="2" opacity="0.3">
          <animate attributeName="y1" values="0%;100%;0%" dur="12s" repeatCount="indefinite" />
          <animate attributeName="y2" values="0%;100%;0%" dur="12s" repeatCount="indefinite" />
        </line>
      </svg>

      {/* Corner HUD Brackets */}
      <div className="absolute top-8 left-8 w-20 h-20 pointer-events-none">
        <svg viewBox="0 0 80 80" className="w-full h-full">
          <path d="M 0 20 L 0 0 L 20 0" stroke="#CEF25D" strokeWidth="1.5" fill="none" opacity="0.4" />
          <circle cx="0" cy="0" r="2" fill="#CEF25D" opacity="0.6">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>

      <div className="absolute top-8 right-8 w-20 h-20 pointer-events-none">
        <svg viewBox="0 0 80 80" className="w-full h-full">
          <path d="M 60 0 L 80 0 L 80 20" stroke="#CEF25D" strokeWidth="1.5" fill="none" opacity="0.4" />
          <circle cx="80" cy="0" r="2" fill="#CEF25D" opacity="0.6">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" begin="0.5s" />
          </circle>
        </svg>
      </div>

      <div className="absolute bottom-8 left-8 w-20 h-20 pointer-events-none">
        <svg viewBox="0 0 80 80" className="w-full h-full">
          <path d="M 0 60 L 0 80 L 20 80" stroke="#CEF25D" strokeWidth="1.5" fill="none" opacity="0.4" />
          <circle cx="0" cy="80" r="2" fill="#CEF25D" opacity="0.6">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" begin="1s" />
          </circle>
        </svg>
      </div>

      <div className="absolute bottom-8 right-8 w-20 h-20 pointer-events-none">
        <svg viewBox="0 0 80 80" className="w-full h-full">
          <path d="M 80 60 L 80 80 L 60 80" stroke="#CEF25D" strokeWidth="1.5" fill="none" opacity="0.4" />
          <circle cx="80" cy="80" r="2" fill="#CEF25D" opacity="0.6">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" begin="1.5s" />
          </circle>
        </svg>
      </div>

      {/* Technical Data Lines - Left Side */}
      <div className="absolute left-0 top-1/4 w-32 h-px bg-gradient-to-r from-transparent via-[#CEF25D]/30 to-transparent">
        <div className="absolute right-0 top-0 w-1 h-1 bg-[#CEF25D] rounded-full animate-pulse" />
      </div>

      <div
        className="absolute left-0 top-1/2 w-24 h-px bg-gradient-to-r from-transparent via-[#CEF25D]/20 to-transparent"
        style={{ animationDelay: '1s' }}
      >
        <div className="absolute right-0 top-0 w-1 h-1 bg-[#CEF25D] rounded-full animate-pulse" />
      </div>

      {/* Technical Data Lines - Right Side */}
      <div className="absolute right-0 top-1/3 w-40 h-px bg-gradient-to-l from-transparent via-[#CEF25D]/30 to-transparent">
        <div className="absolute left-0 top-0 w-1 h-1 bg-[#CEF25D] rounded-full animate-pulse" />
      </div>

      <div className="absolute right-0 top-2/3 w-28 h-px bg-gradient-to-l from-transparent via-[#CEF25D]/20 to-transparent">
        <div className="absolute left-0 top-0 w-1 h-1 bg-[#CEF25D] rounded-full animate-pulse" />
      </div>

      {/* Floating Technical Markers */}
      <div className="absolute top-1/4 left-1/4 pointer-events-none opacity-30">
        <div className="relative">
          <div className="w-2 h-2 bg-[#CEF25D] rounded-full animate-ping" />
          <div className="absolute top-0 left-0 w-2 h-2 bg-[#CEF25D] rounded-full" />
        </div>
      </div>

      <div className="absolute top-2/3 right-1/4 pointer-events-none opacity-20">
        <div className="relative">
          <div className="w-2 h-2 bg-[#CEF25D] rounded-full animate-ping" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-0 left-0 w-2 h-2 bg-[#CEF25D] rounded-full" />
        </div>
      </div>

      {/* Technical Status Bar - Top */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-4 text-[#CEF25D]/40 text-[10px] font-mono pointer-events-none">
        <span className="flex items-center gap-1">
          <span className="w-1 h-1 bg-[#CEF25D] rounded-full animate-pulse" />
          SYSTEM ONLINE
        </span>
        <span className="text-[#888888]">|</span>
        <span className="tabular-nums">
          <span className="animate-[countUp_2s_ease-out]">99.9</span>% UPTIME
        </span>
        <span className="text-[#888888]">|</span>
        <span className="flex items-center gap-1">
          <span className="w-1 h-1 bg-[#CEF25D] rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
          SECURE
        </span>
      </div>

      {/* Technical Data Stream - Left Side */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#CEF25D]/20 text-[8px] font-mono pointer-events-none space-y-1 select-none">
        <div className="animate-[slideUp_3s_linear_infinite]">
          <div>REV_STREAM: ACTIVE</div>
          <div>NODE_STATUS: OK</div>
          <div>LATENCY: 12ms</div>
          <div>BANDWIDTH: 98%</div>
          <div className="text-[#888888]">────────────</div>
          <div>ENCRYPT: AES-256</div>
          <div>AUTH: VERIFIED</div>
        </div>
      </div>

      {/* Technical Data Stream - Right Side */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#CEF25D]/20 text-[8px] font-mono pointer-events-none text-right space-y-1 select-none">
        <div className="animate-[slideUp_4s_linear_infinite]">
          <div>CPU: 23%</div>
          <div>MEMORY: 1.2GB</div>
          <div>REQUESTS: 1.4K</div>
          <div className="text-[#888888]">────────────</div>
          <div>API: v2.4.1</div>
          <div>BUILD: 2026.02</div>
          <div>STATUS: READY</div>
        </div>
      </div>
    </>
  )
}
