import { useMemo, useState } from "react";
import { CalendarCheck, Check, Images, Search, Trash2, X } from "lucide-react";
import { useData } from "../store";
import { money } from "../lib/storage";
import { fmtTime12 } from "../lib/dates";
import type { ApptStatus } from "../lib/types";
import StatusBadge from "../components/StatusBadge";
import Lightbox from "../components/Lightbox";
import { Button, Chip, EmptyState, PageHeader, inputClass } from "../components/ui";
import { useToast } from "../components/Toast";

type Filter = "todas" | ApptStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "pendiente", label: "Pendientes" },
  { key: "confirmada", label: "Confirmadas" },
  { key: "completada", label: "Completadas" },
  { key: "cancelada", label: "Canceladas" },
];

export default function CitasPage() {
  const { appointments, patchAppointment, removeAppointment } = useData();
  const { toast } = useToast();

  const [filter, setFilter] = useState<Filter>("todas");
  const [query, setQuery] = useState("");
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...appointments]
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
      .filter((a) => (filter === "todas" ? true : a.status === filter))
      .filter((a) =>
        q
          ? a.clientName.toLowerCase().includes(q) ||
            a.serviceName.toLowerCase().includes(q) ||
            a.notes.toLowerCase().includes(q)
          : true
      );
  }, [appointments, filter, query]);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { todas: appointments.length, pendiente: 0, confirmada: 0, completada: 0, cancelada: 0 };
    appointments.forEach((a) => (c[a.status] += 1));
    return c;
  }, [appointments]);

  const act = (id: string, patch: Partial<{ status: ApptStatus }>, msg: string) => {
    patchAppointment(id, patch);
    toast(msg);
  };

  const onDelete = (id: string) => {
    removeAppointment(id);
    setConfirmDelete(null);
    toast("Cita eliminada");
  };

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Citas"
        subtitle="Revisa, confirma y gestiona el estado de cada cita."
      />

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {FILTERS.map(({ key, label }) => (
          <Chip key={key} label={`${label} (${counts[key]})`} active={filter === key} onClick={() => setFilter(key)} />
        ))}
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por clienta, servicio o nota…"
          className={`${inputClass} pl-10`}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<CalendarCheck size={24} />}
          title={appointments.length === 0 ? "Aún no hay citas" : "Sin resultados"}
          hint={
            appointments.length === 0
              ? "Agenda la primera cita desde la sección Agendar."
              : "Prueba con otro filtro o búsqueda."
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <article
              key={a.id}
              className={`bg-white border rounded-2xl p-4 sm:p-5 shadow-soft transition-all ${
                a.status === "cancelada" ? "border-line opacity-60" : "border-line"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-ink">{a.serviceName}</h3>
                    <StatusBadge status={a.status} />
                  </div>
                  <p className="text-xs mt-1.5 text-ink/50">
                    <span className="capitalize">{fmtDate({ date: a.date })}</span> · {fmtTime12(a.time)} ·{" "}
                    {money(a.price)}
                  </p>
                  {(a.clientName || a.notes) && (
                    <p className="text-xs mt-2 text-ink/55 leading-relaxed max-w-xl">
                      {a.clientName && (
                        <>
                          <span className="font-bold text-wine-dark">Clienta:</span> {a.clientName}
                          <br />
                        </>
                      )}
                      {a.notes && (
                        <>
                          <span className="font-bold text-wine-dark">Nota:</span> {a.notes}
                        </>
                      )}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {a.status !== "cancelada" && a.status !== "completada" && (
                    <>
                      <Button variant="outline" className="!px-3.5 !py-2 text-xs" onClick={() => act(a.id, { status: "confirmada" }, "Cita confirmada")}>
                        <Check size={14} /> Confirmar
                      </Button>
                      <Button variant="outline" className="!px-3.5 !py-2 text-xs" onClick={() => act(a.id, { status: "completada" }, "Cita completada")}>
                        <CalendarCheck size={14} /> Completar
                      </Button>
                      <Button
                        variant="ghost"
                        className="!px-3.5 !py-2 text-xs !text-brick hover:!bg-brick/10"
                        onClick={() => act(a.id, { status: "cancelada" }, "Cita cancelada")}
                      >
                        <X size={14} /> Cancelar
                      </Button>
                    </>
                  )}
                  {a.status === "completada" && (
                    <Button variant="outline" className="!px-3.5 !py-2 text-xs" onClick={() => act(a.id, { status: "pendiente" }, "Reactivada como pendiente")}>
                      Reactivar
                    </Button>
                  )}
                  {confirmDelete === a.id ? (
                    <span className="flex items-center gap-2">
                      <button type="button" onClick={() => onDelete(a.id)} className="text-xs font-bold text-brick underline">
                        ¿Eliminar?
                      </button>
                      <button type="button" onClick={() => setConfirmDelete(null)} className="text-xs font-bold text-ink/50">
                        No
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(a.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-ink/35 hover:text-brick hover:bg-brick/10 transition-colors"
                      aria-label="Eliminar cita"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>

              {a.images.length > 0 && (
                <div className="mt-4">
                  <p className="text-[11px] font-bold text-ink/45 mb-2 flex items-center gap-1.5">
                    <Images size={13} /> Referencias ({a.images.length})
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {a.images.map((src, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setLightbox({ images: a.images, index: i })}
                        className="w-16 h-16 rounded-xl overflow-hidden border border-line shrink-0 hover:ring-2 hover:ring-rose/50 transition-all"
                      >
                        <img src={src} alt={`Referencia ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {lightbox && <Lightbox images={lightbox.images} index={lightbox.index} onClose={() => setLightbox(null)} />}
    </div>
  );
}

function fmtDate({ date }: { date: string }) {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long" }).format(dt);
}