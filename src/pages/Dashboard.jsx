import DashboardIoT from "../components/TagsForTags";
import Example from "../components/Example";
import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import DecimalToHexCard from "../components/DecimalToHexCard";
const API_BASE = "https://a49sbz67r1.execute-api.us-east-1.amazonaws.com";

const tagsConfig = [
  { key: "Q..1:8-1", label: "Motor Centrifugadora", readOnly: true},
  { key: "Q..1:10-1", label: "Piston centrifugadora", readOnly: true},
  { key: "Q..1:9-1", label: "Resistencias vulcanizadora", readOnly: true },
  { key: "Q..1:12-1", label: "motor Vulcanizadora", readOnly: true },

  { key: "AI..4:3-1", label: "Presión", type: "analog", offset: -250, gain: 1.25 ,  unit:"PSI" },   
  { key: "AI..4:1-1", label: "Temperatura", type: "analog", offset: -50, gain: 0.25 , unit: "°C" },
  { key: "AM..4:2-1", label: "Tiempo Horno centrífugo", type: "analog", offset:0,gain:1, unit: "s" },
  { key: "AM..4:1-1", label: "Tiempo Vulcanización", type: "analog", offset: 0,gain:1, unit: "s" },

  { key: "I..1:10-1", label: "Emergencia", readOnly: true },
];


const MODE_TAG = "Q..1:5-1";
const MACHINE_TAG = "Q..1:4-1";

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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <DecimalToHexCard />
      </div>
      {/* ===== TARJETAS DE TAGS ===== */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tagsConfig.map(tag => {
            const rawValue = shadow[tag.key];
            const isOn = rawValue === "01";

            let displayValue = "--";

            if (tag.type === "analog" && rawValue) {
              const decimal = parseInt(rawValue, 16);
              const scaled = decimal*tag.gain + tag.offset;
              displayValue = scaled.toFixed(1);
            }

            return (
              <div key={tag.key} className="bg-white rounded-2xl shadow-lg">
                <div className="p-6 flex flex-col gap-4">
                  <h2 className="text-xl font-semibold">{tag.label}</h2>

                  {tag.type === "analog" ? (
                    <p className="text-lg text-blue-600">
                      {displayValue}{tag.unit}
                      
                    </p>
                  ) : (
                    <p className="text-lg">
                      Estado:{" "}
                      <span className={isOn ? "text-green-600" : "text-red-600"}>
                        {isOn ? "ENCENDIDO" : "APAGADO"}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            );
          })}

      </div>
      
    </div>



    
  </>
  
}
export default Dashboard;