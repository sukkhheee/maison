"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  /** Optional element rendered to the right of the input (e.g. unit "₮"). */
  suffix?: React.ReactNode;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, hint, error, suffix, className, id, ...rest }, ref) => {
    const inputId = id || `field-${label.replace(/\s+/g, "-").toLowerCase()}`;
    return (
      <label htmlFor={inputId} className="block">
        <span className="text-xs font-medium text-fg flex items-center gap-1">
          {label}
          {rest.required && <span className="text-rose-500">*</span>}
        </span>
        <div className="mt-1 relative">
          <input
            id={inputId}
            ref={ref}
            {...rest}
            className={cn(
              "w-full h-10 px-3 rounded-md border bg-surface text-sm",
              "focus:outline-none focus:ring-1 transition-colors",
              error
                ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/30"
                : "border-border focus:border-accent focus:ring-accent/30",
              "placeholder:text-fg-muted/60",
              suffix && "pr-10",
              className
            )}
          />
          {suffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-fg-muted pointer-events-none">
              {suffix}
            </span>
          )}
        </div>
        {(error || hint) && (
          <span
            className={cn(
              "block mt-1 text-[10px]",
              error ? "text-rose-600 dark:text-rose-400" : "text-fg-muted"
            )}
          >
            {error || hint}
          </span>
        )}
      </label>
    );
  }
);
Field.displayName = "Field";

/* -------------------------------------------------------------------------- */

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  error?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, hint, error, className, id, ...rest }, ref) => {
    const inputId = id || `field-${label.replace(/\s+/g, "-").toLowerCase()}`;
    return (
      <label htmlFor={inputId} className="block">
        <span className="text-xs font-medium text-fg flex items-center gap-1">
          {label}
          {rest.required && <span className="text-rose-500">*</span>}
        </span>
        <textarea
          id={inputId}
          ref={ref}
          {...rest}
          className={cn(
            "mt-1 w-full px-3 py-2 rounded-md border bg-surface text-sm resize-y",
            "focus:outline-none focus:ring-1 transition-colors",
            error
              ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/30"
              : "border-border focus:border-accent focus:ring-accent/30",
            "placeholder:text-fg-muted/60",
            className
          )}
        />
        {(error || hint) && (
          <span
            className={cn(
              "block mt-1 text-[10px]",
              error ? "text-rose-600 dark:text-rose-400" : "text-fg-muted"
            )}
          >
            {error || hint}
          </span>
        )}
      </label>
    );
  }
);
TextArea.displayName = "TextArea";

/* -------------------------------------------------------------------------- */

interface SwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}

export function Switch({ label, description, checked, onChange, disabled }: SwitchProps) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={cn(
          "relative h-5 w-9 rounded-full transition-colors shrink-0 mt-0.5",
          checked ? "bg-accent" : "bg-border",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-soft transition-transform",
            checked && "translate-x-4"
          )}
        />
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {description && (
          <p className="text-[11px] text-fg-muted mt-0.5">{description}</p>
        )}
      </div>
    </label>
  );
}
