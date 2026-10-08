import "react-native-gesture-handler";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { Home, Scissors, Image as ImageIcon, CalendarDays, ListChecks } from "lucide-react-native";

import InicioScreen from "./screens/cliente/InicioScreen";
import ServiciosScreen from "./screens/cliente/ServiciosScreen";
import GaleriaScreen from "./screens/cliente/GaleriaScreen";
import AgendarScreen from "./screens/cliente/AgendarScreen";
import MisCitasScreen from "./screens/cliente/MisCitasScreen";

const Tab = createBottomTabNavigator();

// Colores de marca — mismos tokens que tailwind.config.js
const WINE = "#6E2A3D";
const MUTED = "#B7A9A3";
const IVORY = "#FBF5F0";
const LINE = "#E8D9D3";

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: WINE,
          tabBarInactiveTintColor: MUTED,
          tabBarStyle: { backgroundColor: "#fff", borderTopColor: LINE },
          tabBarLabelStyle: { fontSize: 10, fontWeight: "700" },
        }}
      >
        <Tab.Screen
          name="Inicio"
          component={InicioScreen}
          options={{ tabBarIcon: ({ color, size }) => <Home color={color} size={size ?? 18} /> }}
        />
        <Tab.Screen
          name="Servicios"
          component={ServiciosScreen}
          options={{ tabBarIcon: ({ color, size }) => <Scissors color={color} size={size ?? 18} /> }}
        />
        <Tab.Screen
          name="Galería"
          component={GaleriaScreen}
          options={{ tabBarIcon: ({ color, size }) => <ImageIcon color={color} size={size ?? 18} /> }}
        />
        <Tab.Screen
          name="Agendar"
          component={AgendarScreen}
          options={{ tabBarIcon: ({ color, size }) => <CalendarDays color={color} size={size ?? 18} /> }}
        />
        <Tab.Screen
          name="Mis citas"
          component={MisCitasScreen}
          options={{ tabBarIcon: ({ color, size }) => <ListChecks color={color} size={size ?? 18} /> }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// Nota: el panel de la manicurista (Dashboard, Calendario, Solicitudes, Horarios...)
// se agrega como un segundo "modo" de la app — por ejemplo un Stack aparte que se
// muestra según el rol del usuario autenticado (profiles.role en Supabase).
// Lo construimos en el siguiente paso, después de tener el login real conectado.
