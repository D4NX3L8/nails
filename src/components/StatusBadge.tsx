import type { ApptStatus } from "../lib/types";
import { STATUS_LABELS } from "../lib/storage";

const META: Record<ApptStatus, { bg: string; text: string; dot: string }> = {
  pendiente: { bg: "bg-amber/15", text: "text-amber", dot: "bg-amber" },
  confirmada: { bg: "bg-blush", text: "text-wine-dark", dot: "bg-wine" },
  completada: { bg: "bg-sage/15", text: "text-sage", dot: "bg-sage" },
  cancelada: { bg: "bg-brick/10", text: "text-brick", dot: "bg-brick" },
};

export default function StatusBadge({ status }: { status: ApptStatus }) {
  const meta = META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.bg} ${meta.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {STATUS_LABELS[status]}
    </span>
  );
}