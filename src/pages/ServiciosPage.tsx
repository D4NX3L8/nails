import { useState } from "react";
import { Pencil, Plus, Scissors, Trash2 } from "lucide-react";
import { useData } from "../store";
import { money, uid } from "../lib/storage";
import type { Service } from "../lib/types";
import { Button, EmptyState, Field, Modal, PageHeader, inputClass } from "../components/ui";
import { useToast } from "../components/Toast";

const EMPTY: Omit<Service, "id"> = { name: "", price: 0, durationMinutes: 60, category: "", active: true };

export default function ServiciosPage() {
  const { services, addService, updateService, removeService } = useData();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Service | "new" | null>(null);

  const openNew = () => setEditing("new");

  const save = (form: Omit<Service, "id">, id?: string) => {
    const payload: Omit<Service, "id"> = {
      name: form.name.trim(),
      price: Number(form.price) || 0,
      durationMinutes: Number(form.durationMinutes) || 60,
      category: form.category.trim(),
      active: form.active,
    };
    if (id) {
      updateService(id, payload);
      toast("Servicio actualizado");
    } else {
      addService({ ...payload, id: uid() });
      toast("Servicio creado");
    }
  };

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Servicios"
        subtitle="Catálogo de tipos de uñas con su precio y duración."
        action={
          <Button onClick={openNew}>
            <Plus size={16} /> Nuevo
          </Button>
        }
      />

      {services.length === 0 ? (
        <EmptyState
          icon={<Scissors size={24} />}
          title="Sin servicios"
          hint="Agrega tu primer servicio para poder agendar citas."
          action={
            <Button onClick={openNew}>
              <Plus size={16} /> Crear servicio
            </Button>
          }
        />
      ) : (
        <div className="space-y-2.5">
          {services.map((s) => (
            <article
              key={s.id}
              className={`bg-white border rounded-2xl p-4 flex items-center gap-4 shadow-soft ${
                s.active ? "border-line" : "border-line opacity-55"
              }`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${s.active ? "bg-blush" : "bg-line"}`}>
                <Scissors size={19} className={s.active ? "text-wine" : "text-ink/40"} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-ink">{s.name}</h3>
                  {!s.active && (
                    <span className="text-[10px] font-bold text-ink/45 bg-line rounded-full px-2 py-0.5">Inactivo</span>
                  )}
                </div>
                <p className="text-xs mt-1 text-ink/50">
                  {money(s.price)} · {s.durationMinutes} min{s.category && ` · ${s.category}`}
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={s.active}
                aria-label={`Activar ${s.name}`}
                onClick={() => {
                  updateService(s.id, { active: !s.active });
                }}
                className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${s.active ? "bg-sage" : "bg-line"}`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                    s.active ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>

              <button
                type="button"
                onClick={() => setEditing(s)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-ink/45 hover:text-wine hover:bg-blush transition-colors shrink-0"
                aria-label="Editar servicio"
              >
                <Pencil size={15} />
              </button>
              <button
                type="button"
                onClick={() => {
                  removeService(s.id);
                  toast("Servicio eliminado");
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-ink/45 hover:text-brick hover:bg-brick/10 transition-colors shrink-0"
                aria-label="Eliminar servicio"
              >
                <Trash2 size={15} />
              </button>
            </article>
          ))}
        </div>
      )}

      {editing && (
        <ServiceForm
          key={editing === "new" ? "new" : editing.id}
          service={editing === "new" ? null : editing}
          onSave={(form, id) => {
            save(form, id);
            setEditing(null);
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function ServiceForm({
  service,
  onSave,
  onClose,
}: {
  service: Service | null;
  onSave: (form: Omit<Service, "id">, id?: string) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Omit<Service, "id">>(service ? { ...service } : { ...EMPTY });

  const set = <K extends keyof Omit<Service, "id">>(key: K, value: Omit<Service, "id">[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const valid = form.name.trim().length > 0 && Number(form.price) > 0 && Number(form.durationMinutes) > 0;

  return (
    <Modal open onClose={onClose} title={service ? "Editar servicio" : "Nuevo servicio"}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          onSave(form, service?.id);
        }}
      >
        <Field label="Nombre">
          <input
            autoFocus
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Ej: Uñas acrílicas esculpidas"
            className={inputClass}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Precio ($)">
            <input
              type="number"
              min={0}
              value={form.price || ""}
              onChange={(e) => set("price", Number(e.target.value))}
              placeholder="50000"
              className={inputClass}
            />
          </Field>
          <Field label="Duración (min)">
            <input
              type="number"
              min={1}
              value={form.durationMinutes || ""}
              onChange={(e) => set("durationMinutes", Number(e.target.value))}
              placeholder="60"
              className={inputClass}
            />
          </Field>
        </div>
        <Field label="Categoría (opcional)" hint="Ej: Semipermanente, Acrílicas, Diseños…">
          <input
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            placeholder="Semipermanente"
            className={inputClass}
          />
        </Field>
        <label className="flex items-center gap-3 cursor-pointer">
          <button
            type="button"
            role="switch"
            aria-checked={form.active}
            onClick={() => set("active", !form.active)}
            className={`relative w-11 h-6 rounded-full transition-colors ${form.active ? "bg-sage" : "bg-line"}`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                form.active ? "left-[22px]" : "left-0.5"
              }`}
            />
          </button>
          <span className="text-sm font-semibold text-wine-dark">Servicio activo</span>
        </label>
        <div className="flex justify-end gap-2.5 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!valid}>
            {service ? "Guardar cambios" : "Crear servicio"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}