import { cn } from "@/lib/utils";

// Piezas comunes de los formularios del admin (productos y combos).

export const controlClass =
  "w-full border border-input bg-card px-3 text-sm text-cream outline-none placeholder:text-stone focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/25 aria-invalid:border-red-600";

export function Field({
  id,
  label,
  error,
  hint,
  required,
  className,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-cream">
        {label}
        {required && (
          <span aria-hidden className="text-red-300">
            {" "}
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-stone">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="text-xs font-medium text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
