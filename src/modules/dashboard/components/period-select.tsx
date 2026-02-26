"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import type { Period } from "@/modules/dashboard/hooks/useMetrics";

interface PeriodSelectProps {
  value: Period;
  onChange: (period: Period) => void;
}

const PERIOD_OPTIONS = [
  { value: "30d" as const, label: "Últimos 30 días" },
  { value: "prev_month" as const, label: "Mes anterior" },
  { value: "quarter" as const, label: "Trimestre" },
  { value: "year" as const, label: "Año" },
  { value: "all" as const, label: "Todo" },
];

export function PeriodSelect({ value, onChange }: PeriodSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = PERIOD_OPTIONS.find((opt) => opt.value === value);
  const displayLabel = selectedOption?.label || "Últimos 30 días";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative w-full sm:w-auto">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full sm:w-auto flex items-center justify-between gap-2 px-4 py-2 rounded-lg transition-all duration-150"
        style={{
          background: "rgba(18, 18, 18, 0.95)",
          border: "1px solid rgba(255,255,255,0.14)",
          color: "#f0f4ff",
        }}
      >
        <span className="text-sm font-medium">{displayLabel}</span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute top-full left-0 sm:left-auto sm:right-0 mt-1 w-full sm:w-56 rounded-lg shadow-lg z-50"
          style={{
            background: "rgba(18, 18, 18, 0.95)",
            border: "1px solid rgba(255,255,255,0.14)",
          }}
        >
          {PERIOD_OPTIONS.map((option, idx) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-3 transition-all duration-150 ${
                idx !== PERIOD_OPTIONS.length - 1 ? "border-b" : ""
              }`}
              style={{
                borderBottomColor:
                  idx !== PERIOD_OPTIONS.length - 1
                    ? "rgba(255,255,255,0.07)"
                    : "transparent",
                background:
                  value === option.value
                    ? "rgba(158,255,0,0.20)"
                    : "transparent",
                color:
                  value === option.value
                    ? "#9EFF00"
                    : "rgba(240,244,255,0.75)",
              }}
              onMouseEnter={(e) => {
                if (value !== option.value) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }
              }}
              onMouseLeave={(e) => {
                if (value !== option.value) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
