import { useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, Check, Clock, Images, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import { useData } from "../store";
import { money, uid } from "../lib/storage";
import { fmtDateLong, fmtTime12, buildSlots } from "../lib/dates";
import { filesToDataURLs, estimateBytes } from "../lib/images";
import type { Appointment, Service, Slot } from "../lib/types";
import MonthCalendar from "../components/MonthCalendar";
import { Button, Chip, PageHeader, inputClass } from "../components/ui";
import { useToast } from "../components/Toast";

const STEP_LABELS = ["Servicio", "Día", "Hora", "Confirmar"];

type SlotStatus = "disponible" | "ocupado" | "descanso";

export default function AgendarPage({ onDone }: { onDone: () => void }) {
  const { services, appointments, schedule, book } = useData();
  const { toast } = useToast();

  const activeServices = useMemo(() => services.filter((s) => s.active), [services]);

  const [step, setStep] = useState(1);
  const [service, setService] = useState<Service | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [notes, setNotes] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [processingFiles, setProcessingFiles] = useState(false);
  const [done, setDone] = useState(false);

  const daySchedule = date ? schedule[new Date(date + "T00:00").getDay()] : undefined;

  const slots: (Slot & { status: SlotStatus })[] = useMemo(() => {
    if (!date) return [];
    const base = buildSlots(daySchedule);
    const taken = new Set(
      appointments
        .filter((a) => a.date === date && a.status !== "cancelada")
        .map((a) => a.time)
    );
    return base.map((s) => ({
      ...s,
      status: s.isBreak ? "descanso" : taken.has(s.time) ? "ocupado" : "disponible",
    }));
  }, [date, daySchedule, appointments]);

  const storageUsedBytes = estimateBytes(appointments) + images.reduce((a, s) => a + s.length, 0);
  const storageLeft = 5 * 1024 * 1024 - storageUsedBytes;

  const reset = () => {
    setStep(1);
    setService(null);
    setDate(null);
    setTime(null);
    setClientName("");
    setNotes("");
    setImages([]);
    setDone(false);
  };

  const onPickImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setProcessingFiles(true);
    try {
      const urls = await filesToDataURLs(files);
      setImages((prev) => [...prev, ...urls].slice(0, 8));
    } catch {
      toast("No se pudieron procesar las imágenes", "error");
    } finally {
      setProcessingFiles(false);
    }
  };

  const submit = () => {
    if (!service || !date || !time) return;
    const appt: Appointment = {
      id: uid(),
      serviceId: service.id,
      serviceName: service.name,
      price: service.price,
      date,
      time,
      clientName: clientName.trim(),
      notes: notes.trim(),
      images,
      status: "pendiente",
      createdAt: new Date().toISOString(),
    };
    try {
      book(appt);
      toast("Cita agendada correctamente");
      setDone(true);
    } catch {
      toast("No hay espacio de almacenamiento. Quita algunas imágenes.", "error");
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center text-center py-20 px-4 animate-fade-up">
        <div className="w-20 h-20 rounded-full bg-sage/15 flex items-center justify-center mb-5">
          <Check size={36} className="text-sage" />
        </div>
        <h2 className="font-display text-2xl text-wine-dark">¡Cita agendada!</h2>
        <p className="text-sm text-ink/55 mt-2 max-w-sm">
          {service?.name} · {date ? fmtDateLong(new Date(date + "T00:00")) : ""} · {time ? fmtTime12(time) : ""}. Quedó
          registrada como pendiente en tu panel de citas.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-7">
          <Button onClick={onDone}>
            <CalendarDays size={16} /> Ver mis citas
          </Button>
          <Button variant="outline" onClick={reset}>
            Agendar otra
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <PageHeader title="Agendar cita" subtitle="Diseños de uñas, precio y una referencia visual de lo que quieres." />

      {/* Pasos */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {STEP_LABELS.map((label, i) => {
          const n = i + 1;
          const reached = n <= step;
          const current = n === step;
          return (
            <div key={label} className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => n < step && setStep(n)}
                className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors border ${
                  reached
                    ? "bg-wine border-wine text-ivory"
                    : "bg-white border-line text-wine-dark"
                } ${current ? "ring-2 ring-rose/40" : ""}`}
              >
                <span>{n}</span>
                <span className="hidden sm:inline">{label}</span>
              </button>
              {i < STEP_LABELS.length - 1 && (
                <span className={`h-px w-6 bg-line ${n < step ? "bg-wine" : ""}`} />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Panel principal */}
        <div className="flex-1 min-w-0">
          {step === 1 && (
            <div className="space-y-2.5">
              {activeServices.length === 0 && (
                <p className="text-sm text-ink/55 bg-white border border-line rounded-2xl p-4">
                  No hay servicios activos. Agrega uno en la sección <strong>Servicios</strong>.
                </p>
              )}
              {activeServices.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setService(s);
                    setStep(2);
                  }}
                  className={`w-full text-left rounded-2xl p-4 flex items-center gap-4 bg-white border transition-all hover:shadow-soft ${
                    service?.id === s.id ? "border-wine ring-2 ring-rose/30" : "border-line"
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-blush flex items-center justify-center shrink-0">
                    <Sparkles size={20} className="text-wine" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-ink">{s.name}</p>
                    <p className="text-xs mt-0.5 text-ink/50">
                      {money(s.price)} · {s.durationMinutes} min
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="bg-white border border-line rounded-3xl p-5 shadow-soft">
              <MonthCalendar
                scheduleByWeekday={schedule}
                selectedDate={date}
                onSelectDate={(d) => {
                  setDate(d);
                  setTime(null);
                  setStep(3);
                }}
              />
              <p className="text-[11px] text-ink/45 mt-4 flex items-center gap-1.5">
                <Clock size={12} /> Solo se habilitan los días con atención según tu horario.
              </p>
            </div>
          )}

          {step === 3 && date && (
            <div>
              <p className="font-display text-base text-wine-dark mb-3 capitalize">
                {fmtDateLong(new Date(date + "T00:00"))}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {slots.map((slot) => {
                  const disabled = slot.status !== "disponible";
                  const selected = slot.time === time;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        setTime(slot.time);
                        setStep(4);
                      }}
                      className={`rounded-xl px-3 py-2.5 border transition-all text-left ${
                        selected
                          ? "bg-wine border-wine"
                          : disabled
                            ? "bg-white/50 border-line opacity-50 cursor-not-allowed"
                            : "bg-white border-line hover:border-rose hover:shadow-soft"
                      }`}
                    >
                      <p className={`text-xs font-bold ${selected ? "text-ivory" : "text-ink"}`}>
                        {fmtTime12(slot.time)}
                      </p>
                      <p
                        className={`text-[10px] mt-0.5 font-semibold ${
                          selected ? "text-ivory/75" : "text-ink/45"
                        }`}
                      >
                        {slot.status === "disponible"
                          ? "Disponible"
                          : slot.status === "descanso"
                            ? "Descanso"
                            : "Ocupado"}
                      </p>
                    </button>
                  );
                })}
              </div>
              {slots.length === 0 && (
                <p className="text-sm text-ink/50 bg-white border border-line rounded-2xl p-4">
                  No hay horario de atención este día. Elige otro día.
                </p>
              )}
            </div>
          )}

          {step === 4 && date && time && service && (
            <div className="space-y-4">
              {/* Resumen */}
              <div className="rounded-3xl bg-white border border-line overflow-hidden shadow-soft">
                <div className="p-5 bg-blush/60 border-b border-line">
                  <p className="text-sm font-bold text-wine-dark">{service.name}</p>
                  <p className="text-xs mt-1 text-ink/60 capitalize">
                    {fmtDateLong(new Date(date + "T00:00"))} · {fmtTime12(time)}
                  </p>
                  <p className="text-xs mt-1 text-ink/60">
                    {money(service.price)} · {service.durationMinutes} min
                  </p>
                </div>

                <div className="p-5 space-y-4">
                  <label className="block">
                    <span className="block text-xs font-bold text-wine-dark mb-1.5">Nombre de la clienta</span>
                    <input
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Ej: Valentina"
                      className={inputClass}
                      maxLength={60}
                    />
                  </label>

                  <label className="block">
                    <span className="block text-xs font-bold text-wine-dark mb-1.5">
                      Referencia del diseño (opcional)
                    </span>
                    <div
                      className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line bg-white/60 py-6 px-4 cursor-pointer hover:border-rose transition-colors"
                      onClick={() => document.getElementById("ref-files")?.click()}
                    >
                      <Images size={20} className="text-rose" />
                      <span className="text-xs font-semibold text-ink/55">
                        Haz clic para subir imágenes de referencia (máx. 8)
                      </span>
                      <input
                        id="ref-files"
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        onChange={(e) => onPickImages(e.target.files)}
                      />
                    </div>
                    {processingFiles && <span className="text-[11px] text-ink/45 mt-1">Procesando imágenes…</span>}
                    {images.length > 0 && (
                      <>
                        <div className="grid grid-cols-4 gap-2 mt-3">
                          {images.map((src, i) => (
                            <div key={i} className="relative group rounded-xl overflow-hidden aspect-square border border-line">
                              <img src={src} alt={`Referencia ${i + 1}`} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-ink/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Quitar imagen"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <span
                          className={`text-[11px] mt-1.5 ${storageLeft < 200 * 1024 ? "text-brick font-bold" : "text-ink/45"}`}
                        >
                          {Math.max(0, Math.round(storageLeft / 1024)).toLocaleString()} KB de almacenamiento local
                          disponibles.
                          {storageLeft < 200 * 1024 && " El espacio es limitado, sube menos imágenes."}
                        </span>
                      </>
                    )}
                  </label>

                  <label className="block">
                    <span className="block text-xs font-bold text-wine-dark mb-1.5">Notas para la manicurista (opcional)</span>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ej: alergia a algún esmalte, forma de las uñas, detalles del diseño…"
                      rows={3}
                      maxLength={300}
                      className={`${inputClass} resize-none`}
                    />
                  </label>

                  <Button onClick={submit} className="w-full" disabled={storageUsedBytes > 5 * 1024 * 1024}>
                    <ShieldCheck size={16} /> Guardar cita
                  </Button>
                  <p className="text-[11px] text-center text-ink/45 flex items-center justify-center gap-1">
                    <ShieldCheck size={12} /> La cita queda pendiente y la manejarás desde tu panel de citas.
                  </p>
                </div>
              </div>

              {storageUsedBytes > 5 * 1024 * 1024 && (
                <p className="text-xs text-brick font-semibold">
                  Se alcanzó el límite de almacenamiento local. Quita imágenes o usa el retiro/spa para liberar espacio.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Barra lateral de resumen en desktop */}
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-10 bg-white border border-line rounded-3xl p-5 shadow-soft">
            <h3 className="font-display text-sm text-wine-dark mb-3">Tu selección</h3>
            <div className="space-y-3 text-sm">
              <SummaryRow label="Servicio" value={service?.name ?? "—"} />
              <SummaryRow
                label="Día"
                value={date ? fmtDateLong(new Date(date + "T00:00")) : "—"}
              />
              <SummaryRow label="Hora" value={time ? fmtTime12(time) : "—"} />
              <SummaryRow label="Precio" value={service ? money(service.price) : "—"} />
              <SummaryRow label="Referencias" value={images.length ? `${images.length} imagen(es)` : "Ninguna"} />
            </div>
            {step > 1 && step < 4 && (
              <Button variant="outline" className="w-full mt-5" onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft size={15} /> Volver
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Chip label="Pago al finalizar" />
            <Chip label="Confirmación manual" />
          </div>
        </aside>
      </div>

      {/* Móvil: botón volver */}
      {step > 1 && step < 4 && (
        <button
          type="button"
          onClick={() => setStep((s) => s - 1)}
          className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-wine-dark lg:hidden"
        >
          <ArrowLeft size={15} /> Volver al paso {step - 1}
        </button>
      )}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs text-ink/45 font-semibold">{label}</span>
      <span className="text-xs font-bold text-wine-dark text-right capitalize">{value}</span>
    </div>
  );
}