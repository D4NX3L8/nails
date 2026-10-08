import { ReactNode } from "react";
import { X } from "lucide-react";

export function Button({
  children,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "outline" | "ghost" | "danger";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const styles: Record<string, string> = {
    primary: "bg-wine text-ivory hover:bg-wine-dark disabled:opacity-50 shadow-soft",
    outline: "bg-white text-wine-dark border border-line hover:bg-blush/50 disabled:opacity-50",
    ghost: "bg-transparent text-wine-dark hover:bg-blush disabled:opacity-50",
    danger: "bg-brick/10 text-brick hover:bg-brick/20 disabled:opacity-50",
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Chip({
  label,
  active,
  onClick,
  className = "",
}: {
  label: ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors border ${
        active
          ? "bg-wine border-wine text-ivory"
          : "bg-white border-line text-wine-dark hover:bg-blush/50"
      } ${className}`}
    >
      {label}
    </button>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidth} bg-ivory rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto animate-fade-up`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-ivory/95 backdrop-blur border-b border-line rounded-t-3xl">
          <h2 className="font-display text-lg text-wine-dark">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-blush hover:bg-line"
            aria-label="Cerrar"
          >
            <X size={16} className="text-wine-dark" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  hint,
  action,
}: {
  icon: ReactNode;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-14 h-14 rounded-2xl bg-blush flex items-center justify-center mb-4">
        <span className="text-wine">{icon}</span>
      </div>
      <h3 className="font-display text-base text-wine-dark">{title}</h3>
      {hint && <p className="text-sm text-ink/60 mt-1 max-w-xs">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-bold text-wine-dark mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-ink/50 mt-1">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "w-full bg-white border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink/35 focus:border-rose focus:ring-2 focus:ring-rose/25 transition-shadow";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl text-wine-dark leading-tight">{title}</h1>
        {subtitle && <p className="text-sm text-ink/55 mt-1.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}