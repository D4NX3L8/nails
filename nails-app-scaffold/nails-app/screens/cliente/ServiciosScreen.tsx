import React from "react";
import { View, Text } from "react-native";
import { styled } from "nativewind";

const SView = styled(View);
const SText = styled(Text);

export default function ServiciosScreen() {
  return (
    <SView className="flex-1 bg-ivory px-5 pt-16">
      <SText className="font-display text-lg text-wine-dark mb-2">Servicios</SText>
      <SText className="text-sm text-[#9A8C86]">
        Próximo paso: traer la lista completa de "services" desde Supabase y reproducir
        las tarjetas con foto, precio, duración y botón "Reservar" tal como en el voceto.
      </SText>
    </SView>
  );
}
