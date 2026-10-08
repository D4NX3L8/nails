import { useState } from "react";
import Layout, { Tab } from "./components/Layout";
import { ToastProvider } from "./components/Toast";
import { DataProvider } from "./store";
import AgendarPage from "./pages/AgendarPage";
import CitasPage from "./pages/CitasPage";
import ServiciosPage from "./pages/ServiciosPage";
import HorarioPage from "./pages/HorarioPage";

export default function App() {
  const [tab, setTab] = useState<Tab>("agendar");

  return (
    <DataProvider>
      <ToastProvider>
        <Layout tab={tab} onTab={setTab}>
          {tab === "agendar" && <AgendarPage onDone={() => setTab("citas")} />}
          {tab === "citas" && <CitasPage />}
          {tab === "servicios" && <ServiciosPage />}
          {tab === "horario" && <HorarioPage />}
        </Layout>
      </ToastProvider>
    </DataProvider>
  );
}