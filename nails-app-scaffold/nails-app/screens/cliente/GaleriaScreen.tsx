import React from "react";
import { View, Text } from "react-native";
import { styled } from "nativewind";

const SView = styled(View);
const SText = styled(Text);

export default function GaleriaScreen() {
  return (
    <SView className="flex-1 bg-ivory px-5 pt-16">
      <SText className="font-display text-lg text-wine-dark mb-2">Galería</SText>
      <SText className="text-sm text-[#9A8C86]">
        Próximo paso: traer "gallery_items" de Supabase, con chips de categoría
        (Acrílicas, Semipermanente, Diseños, Tradicional, Otros) igual que en el voceto.
      </SText>
    </SView>
  );
}
