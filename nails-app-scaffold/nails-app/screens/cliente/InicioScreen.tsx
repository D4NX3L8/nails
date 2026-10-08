import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { styled } from "nativewind";
import { MapPin } from "lucide-react-native";
import { supabase } from "../../lib/supabase";

const SView = styled(View);
const SText = styled(Text);
const STouchable = styled(TouchableOpacity);
const SScroll = styled(ScrollView);

type Service = {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
};

const money = (n: number) => "$" + n.toLocaleString("es-CO");

export default function InicioScreen({ navigation }: any) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("services")
        .select("id, name, price, duration_minutes")
        .eq("active", true)
        .limit(3);
      if (!error && data) setServices(data);
      setLoading(false);
    })();
  }, []);

  return (
    <SScroll className="flex-1 bg-ivory">
      <SView className="px-5 pt-16 pb-8 items-center bg-blush">
        <SView className="w-20 h-20 rounded-full items-center justify-center mb-3 bg-wine">
          <SText className="font-display text-2xl text-ivory">N</SText>
        </SView>
        <SText className="font-display text-xl text-wine-dark">Nails</SText>
        <SView className="flex-row items-center gap-1 mt-1">
          <MapPin size={12} color="#9A8C86" />
          <SText className="text-xs text-[#9A8C86]">Estudio de manicura · Medellín</SText>
        </SView>
        <SText className="text-sm mt-3 text-center leading-relaxed text-[#5C534E]">
          Cuidamos tus manos con técnica y detalle. Esmaltado, esculpido y diseños hechos a tu medida.
        </SText>
        <STouchable
          onPress={() => navigation.navigate("Agendar")}
          className="mt-4 px-6 py-3 rounded-full bg-wine"
        >
          <SText className="text-sm font-bold text-ivory">Agendar una cita</SText>
        </STouchable>
      </SView>

      <SView className="px-5 py-5">
        <SText className="font-display text-base mb-3 text-wine-dark">Servicios destacados</SText>
        {loading && <SText className="text-xs text-[#9A8C86]">Cargando…</SText>}
        <SScroll horizontal showsHorizontalScrollIndicator={false}>
          {services.map((s) => (
            <SView key={s.id} className="w-36 mr-3 p-3 rounded-2xl bg-white border border-line">
              <SView className="h-16 rounded-xl mb-2 bg-rose" />
              <SText className="text-xs font-bold text-ink">{s.name}</SText>
              <SText className="text-[11px] mt-1 text-[#9A8C86]">
                {money(s.price)} · {s.duration_minutes} min
              </SText>
            </SView>
          ))}
        </SScroll>
      </SView>
    </SScroll>
  );
}
