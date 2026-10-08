
import { Clock } from "lucide-react";
import { useData } from "../store";
import { DAY_NAMES, fmtTime12, timeToMinutes } from "../lib/dates";
import { PageHeader } from "../components/ui";
import { useToast } from "../components/Toast";
import type { DaySchedule } from "../lib/types";

export default function HorarioPage() {
  const { schedule, updateSchedule } = useData();
  const { toast } = useToast();

  const set = (weekday: number, patch: Partial<DaySchedule>) => {
    updateSchedule(weekday, patch);
    toast("Horario actualizado");
  };

  const activeDays = Object.entries(schedule).filter(([, d]) => d.works).length;

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Horario"
        subtitle={`Días de atención y franjas para que se generen las horas disponibles. ${activeDays} día(s) activo(s).`}
      />

      <div className="bg-blush/50 border border-line rounded-2xl p-4 text-sm text-wine-dark mb-6 flex gap-3">
        <Clock size={18} className="shrink-0 mt-0.5" />
        <p>
          Cada cita ocupa un espacio de <strong>1 hora</strong>. Los días con atención se habilitan en el calendario de
          agendamiento y se generan las horas entre el inicio y el fin del turno, excluyendo el descanso.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {DAY_NAMES.map((name, weekday) => {
          const d = schedule[weekday] ?? { works: false, start: "09:00", end: "18:00", breakStart: "12:00", breakEnd: "13:00" };
          const isToday = weekday === new Date().getDay();
          const slots = d.works && d.start && d.end ? Math.max(0, Math.floor((timeToMinutes(d.end) - timeToMinutes(d.start)) / 60)) : 0;
          return (
            <section
              key={weekday}
              className={`bg-white border rounded-2xl p-4 shadow-soft transition-opacity ${d.works ? "border-line" : "border-line opacity-70"}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className={`text-sm font-bold ${isToday ? "text-wine" : "text-ink"}`}>{name}</h3>
                  {isToday && (
                    <span className="text-[10px] font-bold text-wine bg-blush rounded-full px-2 py-0.5">Hoy</span>
                  )}
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={d.works}
                  aria-label={`Activar ${name}`}
                  onClick={() => set(weekday, { works: !d.works })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${d.works ? "bg-sage" : "bg-line"}`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                      d.works ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
              </div>

              {!d.works ? (
                <p className="text-xs text-ink/45 py-2">Sin atención este día.</p>
              ) : (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2.5">
                    <TimeField
                      label="Inicio"
                      value={d.start}
                      onChange={(v) => set(weekday, { start: v })}
                      disabled={!d.works}
                    />
                    <TimeField
                      label="Fin"
                      value={d.end}
                      onChange={(v) => set(weekday, { end: v })}
                      disabled={!d.works}
                    />
                  </div>
                  {(d.breakStart || d.breakEnd) && (
                    <div className="grid grid-cols-2 gap-2.5">
                      <TimeField
                        label="Descanso desde"
                        value={d.breakStart}
                        onChange={(v) => set(weekday, { breakStart: v })}
                        disabled={!d.works}
                      />
                      <TimeField
                        label="Descanso hasta"
                        value={d.breakEnd}
                        onChange={(v) => set(weekday, { breakEnd: v })}
                        disabled={!d.works}
                      />
                    </div>
                  )}
                  <p className="text-[11px] text-ink/45">
                    {fmtTime12(d.start)} a {fmtTime12(d.end)} ·{" "}
                    {slots > 0 ? `${slots} franja(s) de 1 h` : "horario inválido"}
                  </p>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function TimeField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] font-bold text-ink/50 mb-1">{label}</span>
      <input
        type="time"
        value={value || ""}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border border-line rounded-xl px-3 py-2 text-sm text-ink outline-none focus:border-rose focus:ring-2 focus:ring-rose/25 transition-shadow disabled:opacity-50"
      />
    </label>
  );
}