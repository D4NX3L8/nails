import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { styled } from "nativewind";
import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "../../lib/supabase";
import { fmtTime12 } from "../../lib/dates";

const SView = styled(View);
const SText = styled(Text);
const STouchable = styled(TouchableOpacity);
const SScroll = styled(ScrollView);

const STATUS_META: Record<string, { label: string; bg: string; text: string }> = {
  pendiente: { label: "Pendiente", bg: "#F8ECDC", text: "#8B5F22" },
  confirmada: { label: "Confirmada", bg: "#F0E1E6", text: "#511F2E" },
  cancelada: { label: "Cancelada", bg: "#F5E4E2", text: "#7C332C" },
  completada: { label: "Completada", bg: "#EAF1EA", text: "#3F6249" },
};

type Appt = {
  id: string;
  date: string;
  time: string;
  status: string;
  services: { name: string } | null;
};

export default function MisCitasScreen() {
  const [appts, setAppts] = useState<Appt[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId) {
      setAppts([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("appointments")
      .select("id, date, time, status, services(name)")
      .eq("client_id", userId)
      .order("date", { ascending: true })
      .order("time", { ascending: true });
    if (!error && data) setAppts(data as any);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const cancelAppt = async (id: string) => {
    await supabase.from("appointments").update({ status: "cancelada" }).eq("id", id);
    load();
  };

  if (loading) {
    return (
      <SView className="flex-1 bg-ivory items-center justify-center">
        <ActivityIndicator color="#6E2A3D" />
      </SView>
    );
  }

  if (appts.length === 0) {
    return (
      <SView className="flex-1 bg-ivory px-5 pt-16">
        <SText className="font-display text-base mb-1 text-wine-dark">Aún no tienes citas</SText>
        <SText className="text-xs text-[#9A8C86]">Agenda tu primera cita desde la pestaña "Agendar".</SText>
      </SView>
    );
  }

  return (
    <SScroll
      className="flex-1 bg-ivory px-5 pt-16"
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
    >
      <SText className="font-display text-lg mb-4 text-wine-dark">Mis citas</SText>
      <SView className="gap-3 pb-10">
        {appts.map((a) => {
          const meta = STATUS_META[a.status] ?? STATUS_META.pendiente;
          return (
            <SView key={a.id} className="rounded-2xl p-4 bg-white border border-line">
              <SView className="flex-row items-start justify-between gap-2">
                <SView>
                  <SText className="text-sm font-bold text-ink">{a.services?.name ?? "Servicio"}</SText>
                  <SText className="text-xs mt-1 text-[#9A8C86]">
                    {a.date} · {fmtTime12(a.time.slice(0, 5))}
                  </SText>
                </SView>
                <SView className="px-2.5 py-1 rounded-full" style={{ backgroundColor: meta.bg }}>
                  <SText className="text-xs font-semibold" style={{ color: meta.text }}>
                    {meta.label}
                  </SText>
                </SView>
              </SView>
              {a.status !== "cancelada" && (
                <STouchable onPress={() => cancelAppt(a.id)} className="mt-3">
                  <SText className="text-xs font-bold" style={{ color: "#A4453C" }}>
                    Cancelar cita
                  </SText>
                </STouchable>
              )}
            </SView>
          );
        })}
      </SView>
    </SScroll>
  );
}
