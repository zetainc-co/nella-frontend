"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SELECT_FILTER_STYLES } from "@/modules/dashboard/constants/design-system";

export interface SelectFilterOption {
  value: string;
  label: string;
}

export interface SelectFilterProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectFilterOption[];

  // Layout control - Pattern B (Flexible)
  width?: "auto" | "full" | "sm" | "md" | "lg";
  side?: "top" | "bottom";
  align?: "start" | "center" | "end";
  sideOffset?: number;

  // Optional customization
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * SelectFilter Base Component
 *
 * Reusable select component with consistent styling:
 * - Dark background with subtle border
 * - Selected item: Lima (#9EFF00) background + black text
 * - Unselected items: Transparent + muted text
 * - Flexible layout via width/align/side props
 *
 * Usage:
 * <SelectFilter
 *   value={period}
 *   onChange={setPeriod}
 *   options={PERIOD_OPTIONS}
 *   width="auto"
 *   align="end"
 * />
 */
export function SelectFilter({
  value,
  onChange,
  options,
  width = "auto",
  side = "bottom",
  align = "end",
  sideOffset = 2,
  placeholder,
  disabled = false,
  className,
}: SelectFilterProps) {
  // Get width class from prop
  const widthClass =
    SELECT_FILTER_STYLES.trigger.widths[
      width as keyof typeof SELECT_FILTER_STYLES.trigger.widths
    ];

  // Combine base trigger styles + width + optional override
  const triggerClassName = `${SELECT_FILTER_STYLES.trigger.base} ${widthClass} ${className || ""}`;

  // Find selected option for displaying value
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={triggerClassName} size="default">
        <SelectValue placeholder={placeholder || selectedOption?.label} />
      </SelectTrigger>

      <SelectContent
        className={SELECT_FILTER_STYLES.content.base}
        position="popper"
        side={side}
        align={align}
        sideOffset={sideOffset}
      >
        {options.map((option) => {
          const isSelected = value === option.value;
          const itemStyle = isSelected
            ? SELECT_FILTER_STYLES.item.selected
            : SELECT_FILTER_STYLES.item.unselected;

          return (
            <SelectItem key={option.value} value={option.value}>
              <span
                className="text-sm"
                style={{
                  backgroundColor: itemStyle.backgroundColor,
                  color: itemStyle.color,
                  fontWeight: itemStyle.fontWeight,
                  padding: "8px 12px",
                  borderRadius: "4px",
                  display: "inline-block",
                }}
              >
                {option.label}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
