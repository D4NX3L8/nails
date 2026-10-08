import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import { styled } from "nativewind";
import { ArrowLeft } from "lucide-react-native";
import { supabase } from "../../lib/supabase";
import { ensureSession } from "../../lib/auth";
import { buildSlots, fmtDateLong, fmtTime12, toDateStr, DaySchedule } from "../../lib/dates";
import MonthCalendar from "../../components/MonthCalendar";

const SView = styled(View);
const SText = styled(Text);
const STouchable = styled(TouchableOpacity);
const SScroll = styled(ScrollView);
const SInput = styled(TextInput);

type Service = { id: string; name: string; price: number; duration_minutes: number };

const money = (n: number) => "$" + n.toLocaleString("es-CO");

const STEP_LABELS = ["Servicio", "Día", "Hora", "Confirmar"];

export default function AgendarScreen({ navigation }: any) {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState<string | null>(null);

  const [scheduleByWeekday, setScheduleByWeekday] = useState<Record<number, DaySchedule>>({});
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const [daySlotsStatus, setDaySlotsStatus] = useState<{ time: string; isBreak: boolean; status: string }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const service = services.find((s) => s.id === serviceId);

  // Cargar servicios y horario semanal una sola vez
  useEffect(() => {
    (async () => {
      const [{ data: sv }, { data: sch }] = await Promise.all([
        supabase.from("services").select("id, name, price, duration_minutes").eq("active", true),
        supabase.from("schedule").select("*"),
      ]);
      if (sv) setServices(sv as Service[]);
      if (sch) {
        const map: Record<number, DaySchedule> = {};
        (sch as any[]).forEach((row) => (map[row.weekday] = row));
        setScheduleByWeekday(map);
      }
    })();
  }, []);

  // Al elegir un día, traer citas y bloqueos reales de ese día para calcular disponibilidad
  useEffect(() => {
    if (!date) return;
    (async () => {
      setLoadingSlots(true);
      const dateStr = toDateStr(date);
      const daySchedule = scheduleByWeekday[date.getDay()];
      const slots = buildSlots(daySchedule);

      const [{ data: appts }, { data: blocks }] = await Promise.all([
        supabase.from("appointments").select("time, status").eq("date", dateStr).neq("status", "cancelada"),
        supabase.from("blocked_slots").select("time").eq("date", dateStr),
      ]);

      const blockedTimes = new Set((blocks || []).map((b: any) => b.time.slice(0, 5)));
      const apptByTime = new Map((appts || []).map((a: any) => [a.time.slice(0, 5), a.status]));

      const withStatus = slots.map((s) => {
        if (s.isBreak) return { ...s, status: "descanso" };
        if (apptByTime.has(s.time)) return { ...s, status: apptByTime.get(s.time) === "confirmada" ? "confirmada" : "pendiente" };
        if (blockedTimes.has(s.time)) return { ...s, status: "bloqueado" };
        return { ...s, status: "disponible" };
      });

      setDaySlotsStatus(withStatus);
      setLoadingSlots(false);
    })();
  }, [date, scheduleByWeekday]);

  const submit = async () => {
    if (!date || !time || !serviceId) return;
    setSubmitting(true);
    try {
      const userId = await ensureSession();
      const { error } = await supabase.from("appointments").insert({
        client_id: userId,
        service_id: serviceId,
        date: toDateStr(date),
        time,
        status: "pendiente",
        notes,
      });
      if (error) throw error;

      Alert.alert("Solicitud enviada", "La manicurista debe aceptarla para confirmar tu cita.");
      setStep(1);
      setServiceId(null);
      setDate(null);
      setTime(null);
      setNotes("");
      navigation.navigate("Mis citas");
    } catch (e: any) {
      Alert.alert("No se pudo enviar la solicitud", e.message ?? "Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SScroll className="flex-1 bg-ivory px-5 pt-16 pb-10">
      <SView className="flex-row items-center gap-2 mb-4">
        {step > 1 && (
          <STouchable onPress={() => setStep((s) => s - 1)} className="w-7 h-7 rounded-full items-center justify-center bg-blush">
            <ArrowLeft size={13} color="#511F2E" />
          </STouchable>
        )}
        <SText className="font-display text-lg text-wine-dark">Agendar cita</SText>
      </SView>

      <SView className="flex-row items-center gap-1.5 mb-5">
        {STEP_LABELS.map((label, i) => (
          <SView key={label} className="flex-row items-center gap-1.5" style={{ flex: i < STEP_LABELS.length - 1 ? 0 : 0 }}>
            <SView
              className="w-5 h-5 rounded-full items-center justify-center"
              style={{ backgroundColor: i + 1 <= step ? "#6E2A3D" : "#F4DEDA" }}
            >
              <SText className="text-[10px] font-bold" style={{ color: i + 1 <= step ? "#FBF5F0" : "#511F2E" }}>
                {i + 1}
              </SText>
            </SView>
          </SView>
        ))}
      </SView>

      {step === 1 && (
        <SView className="gap-2.5">
          {services.length === 0 && <ActivityIndicator color="#6E2A3D" />}
          {services.map((s) => (
            <STouchable
              key={s.id}
              onPress={() => {
                setServiceId(s.id);
                setStep(2);
              }}
              className="rounded-2xl p-3 flex-row items-center gap-3 bg-white border border-line"
            >
              <SView className="w-12 h-12 rounded-xl bg-rose" />
              <SView className="flex-1">
                <SText className="text-sm font-bold text-ink">{s.name}</SText>
                <SText className="text-xs mt-0.5 text-[#9A8C86]">
                  {money(s.price)} · {s.duration_minutes} min
                </SText>
              </SView>
            </STouchable>
          ))}
        </SView>
      )}

      {step === 2 && (
        <MonthCalendar
          scheduleByWeekday={scheduleByWeekday}
          selectedDate={date}
          onSelectDate={(d) => {
            setDate(d);
            setTime(null);
            setStep(3);
          }}
        />
      )}

      {step === 3 && date && (
        <SView>
          <SText className="text-sm font-bold mb-3 text-wine-dark">{fmtDateLong(date)}</SText>
          {loadingSlots && <ActivityIndicator color="#6E2A3D" />}
          <SView className="flex-row flex-wrap gap-2">
            {!loadingSlots &&
              daySlotsStatus.map((slot) => {
                const disabled = slot.status !== "disponible";
                return (
                  <STouchable
                    key={slot.time}
                    disabled={disabled}
                    onPress={() => {
                      setTime(slot.time);
                      setStep(4);
                    }}
                    className="rounded-xl px-3 py-2.5 bg-white border border-line"
                    style={{ width: "48%", opacity: disabled ? 0.5 : 1 }}
                  >
                    <SText className="text-xs font-bold text-ink">{fmtTime12(slot.time)}</SText>
                    <SText className="text-[10px] mt-0.5 font-semibold text-[#9A8C86]">
                      {slot.status === "disponible" ? "Disponible" : slot.status}
                    </SText>
                  </STouchable>
                );
              })}
            {!loadingSlots && daySlotsStatus.length === 0 && (
              <SText className="text-xs py-6 text-center w-full text-[#9A8C86]">No hay horario disponible este día.</SText>
            )}
          </SView>
        </SView>
      )}

      {step === 4 && date && time && (
        <SView>
          <SView className="rounded-2xl p-4 mb-4 bg-blush">
            <SText className="text-sm font-bold text-wine-dark">{service?.name}</SText>
            <SText className="text-xs mt-1 text-[#5C534E]">
              {fmtDateLong(date)} · {fmtTime12(time)}
            </SText>
            <SText className="text-xs mt-1 text-[#5C534E]">
              {money(service?.price ?? 0)} · {service?.duration_minutes} min
            </SText>
          </SView>
          <SText className="text-xs font-bold text-wine-dark">Notas para la manicurista (opcional)</SText>
          <SInput
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            placeholder="Ej: alergia a algún esmalte, diseño de referencia, etc."
            className="w-full mt-1.5 rounded-xl p-3 text-sm bg-white border border-line"
            style={{ minHeight: 80, textAlignVertical: "top" }}
          />
          <STouchable
            onPress={submit}
            disabled={submitting}
            className="w-full mt-4 py-3 rounded-full items-center bg-wine"
            style={{ opacity: submitting ? 0.6 : 1 }}
          >
            {submitting ? (
              <ActivityIndicator color="#FBF5F0" />
            ) : (
              <SText className="text-sm font-bold text-ivory">Solicitar cita</SText>
            )}
          </STouchable>
          <SText className="text-[11px] text-center mt-2 text-[#9A8C86]">
            La manicurista debe aceptar tu solicitud para confirmarla.
          </SText>
        </SView>
      )}
    </SScroll>
  );
}
