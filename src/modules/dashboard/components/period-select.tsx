"use client";

import type { Period } from "@/modules/dashboard/hooks/useMetrics";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PeriodSelectProps {
  value: Period;
  onChange: (period: Period) => void;
}

/**
 * Period Filter Options - EDIT THIS TO CUSTOMIZE AVAILABLE PERIODS
 * Format: { value: Period type, label: Display label }
 */
const PERIOD_OPTIONS: Array<{ value: Period; label: string }> = [
  { value: "30d", label: "Últimos 30 días" },
  { value: "prev_month", label: "Mes anterior" },
  { value: "quarter", label: "Trimestre" },
  { value: "year", label: "Año" },
  { value: "all", label: "Todo" },
];

/**
 * Dashboard Period Select Component
 *
 * Built with shadcn/ui Select (Radix UI) for accessibility and functionality.
 *
 * CUSTOMIZATION GUIDE:
 * =====================
 *
 * 1. PERIOD OPTIONS: Edit PERIOD_OPTIONS array above
 *    - Add/remove periods and labels
 *
 * 2. TRIGGER BUTTON STYLES:
 *    - Edit triggerClassName for button appearance
 *    - Colors: border, background, text, hover, focus states
 *    - Current: Dark bg with subtle border, lime focus ring
 *
 * 3. DROPDOWN CONTENT STYLES:
 *    - Edit contentClassName for dropdown container
 *    - Current: Same dark styling as trigger
 *
 * 4. ITEM STYLES:
 *    - Edit getItemStyle() function for item appearance
 *    - Selected items: lime background + lime text (#9EFF00)
 *    - Unselected items: transparent + muted text
 *
 * Example color values you can edit:
 * - Lime accent: #9EFF00 (used for selected items)
 * - Dark background: rgba(18, 18, 18, 0.95)
 * - Border: rgba(255, 255, 255, 0.14)
 * - Text primary: #f0f4ff
 * - Text muted: rgba(240, 244, 255, 0.75)
 */

export function PeriodSelect({ value, onChange }: PeriodSelectProps) {
  // ===== CUSTOMIZABLE STYLES =====

  /**
   * Trigger Button Styles
   * The button that displays the current selection and opens the dropdown
   */
  const triggerClassName =
    "w-full sm:w-auto " +
    // Base styles
    "border border-[rgba(255,255,255,0.14)] " +
    "bg-[rgba(18,18,18,0.95)] " +
    "text-[#f0f4ff] " +
    // Hover state
    "hover:bg-[rgba(30,30,35,0.95)] " +
    // Focus state (with lime ring)

    // Transitions
    "transition-all duration-200";

  /**
   * Dropdown Content Styles
   * The container for all dropdown options
   */
  const contentClassName =
    "w-full sm:w-[200px]" +
    "border border-[rgba(255,255,255,0.14)] " +
    "bg-[rgba(18,18,18,0.95)]";

  /**
   * Item Styles Function
   * Returns styles for each dropdown item based on selection state
   *
   * EDIT THESE COLORS:
   * - isSelected true: Background and text color for selected item
   * - isSelected false: Background and text color for unselected items
   */
  const getItemStyle = (isSelected: boolean) => ({
    // Selected item: lime background with lime text
    backgroundColor: "transparent",
    color: isSelected ? "black" : "rgba(240, 244, 255, 0.75)",
    // Border for item separator (subtle)
    borderColor: "rgba(255, 255, 255, 0.07)",
  });

  // ===== END CUSTOMIZABLE STYLES =====

  return (
    <Select value={value} onValueChange={onChange}>
      {/* Trigger Button - Shows selected period */}
      <SelectTrigger className={triggerClassName} size="default">
        <SelectValue />
      </SelectTrigger>

      {/* Dropdown Content - List of period options */}
      <SelectContent
        className={contentClassName}
        position="popper"
        side="bottom"
        align="end"
        sideOffset={2}
      >
        {PERIOD_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <span
              className="text-sm font-medium"
              style={getItemStyle(value === option.value)}
            >
              {option.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
