import DashboardIoT from "../components/DashBoardIoT";
import Example from "../components/Example";
import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
const API_BASE = "https://a49sbz67r1.execute-api.us-east-1.amazonaws.com";

const tagsConfig = [
  { key: "M..1:36-1", label: "Pistón" },
  { key: "M..1:37-1", label: "Motor" },
  { key: "M..1:39-1", label: "Gata" },
  { key: "M..1:38-1", label: "Resistencias" },
  { key: "I..1:10-1", label: "Emergencia", readOnly: true }
];


const MODE_TAG = "M..1:40-1";
const MACHINE_TAG = "M..1:41-1";

function Dashboard() {
    const [shadow, setShadow] = useState({});
    const [loading, setLoading] = useState(false);

    // ================= SHADOW =================
  const fetchShadow = async () => {
    try {
      const res = await fetch(`${API_BASE}/shadow`);
      const data = await res.json();
      setShadow(data);
    } catch (err) {
      console.error("Error obteniendo shadow", err);
    }
  };

  const updateTag = async (key, value) => {
    setLoading(true);
    try {
      await fetch(`${API_BASE}/shadow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attribute: key, value })
      });
      fetchShadow();
    } catch (err) {
      console.error("Error actualizando", err);
    }
    setLoading(false);
  };

  // ================= SUPABASE =================
  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from("tags")      // 👈 nombre de tu tabla
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error) setHistory(data);
  };

  useEffect(() => {
    fetchShadow();
    fetchHistory();

    const interval = setInterval(fetchShadow, 4000);
    return () => clearInterval(interval);
  }, []);

  // ================= ESTADOS =================
  const modeValue = shadow[MODE_TAG];
  const machineValue = shadow[MACHINE_TAG];

  const modeText = modeValue === "00" ? "AUTOMÁTICO" : "MANUAL";
  const machineText = machineValue === "01" ? "CENTRIFUGADORA" : "VULCANIZADORA";

  return <>
    <div className="min-h-screen bg-slate-100 p-6 flex flex-col gap-8">
        <h1 className="text-3xl font-bold text-center">
        Panel de Información Horno y Vulcanizadora
      </h1>

      {/* ===== ESTADOS GENERALES ===== */}
      <div className="bg-white rounded-2xl shadow-lg">
        <div className="p-6 flex flex-col gap-4">
          <div>
            <span className="font-semibold">Modo:</span>{" "}
            <span className="text-zinc-800 font-bold">{modeText}</span>
          </div>

          <div>
            <span className="font-semibold">Máquina activa:</span>{" "}
            <span className="text-zinc-800 font-bold">{machineText}</span>
          </div>
        </div>
      </div>


      {/* ===== CONTROL DE DISPOSITIVOS ===== */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tagsConfig.map(tag => {
          const value = shadow[tag.key] ?? "--";
          const isOn = value === "01";

          return (
            <div key={tag.key} className="bg-white rounded-2xl shadow-lg">
              <div className="p-6 flex flex-col gap-4">
                <h2 className="text-xl font-semibold">{tag.label}</h2>

                <p className="text-lg">
                  Estado:{" "}
                  <span className={isOn ? "text-green-600" : "text-red-600"}>
                    {isOn ? "ENCENDIDO" : "APAGADO"}
                  </span>
                </p>
                {/*
                {!tag.readOnly && (
                  <div className="flex gap-2">
                    <button disabled={loading} onClick={() => updateTag(tag.key, "01")}>
                      Encender
                    </button>
                    <button disabled={loading} onClick={() => updateTag(tag.key, "00")}>
                      Apagar
                    </button>
                  </div>
                )}
                */ }
              </div>
            </div>
          );
        })}
      </div>
      
    </div>



    
  </>
  
}
export default Dashboard;