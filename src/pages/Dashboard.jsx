import DashboardIoT from "../components/ConfiguracionPLC";
import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import DecimalToHexCard from "../components/DecimalToHexCard";

import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import InfoConfigPLC from "../components/InfoConfigPLC" ;
import { saveTag } from "../services/tagService";
const API_BASE = "https://a49sbz67r1.execute-api.us-east-1.amazonaws.com";


const tagsConfig = [
  { key: "M..1:36-1", label: "Piston centrifugadora", sourceKey: "Q..1:10-1", offTag:"M..1:41-1", machine: "C" },
  { key: "M..1:37-1", label: "Motor Centrifugadora", sourceKey: "Q..1:8-1", offTag:"M..1:42-1", machine: "C"},
  { key: "M..1:39-1", label: "Motor Vulcanizadora", sourceKey: "Q..1:12-1", offTag:"M..1:41-1", machine: "V"},
  { key: "M..1:38-1", label: "Resistencias vulcanizadora", sourceKey: "Q..1:9-1", offTag:"M..1:42-1", machine: "V"},

  { key: "Q..1:8-1", label: "Motor Centrifugadora", readOnly: true, noshowTag: true },
  { key: "Q..1:10-1", label: "Piston centrifugadora", readOnly: true, noshowTag: true },
  { key: "Q..1:9-1", label: "Resistencias vulcanizadora", readOnly: true, noshowTag: true },
  { key: "Q..1:12-1", label: "motor Vulcanizadora", readOnly: true, noshowTag: true },




  { key: "AI..4:3-1", label: "Presión", type: "analog", offset: 0, gain: 3 ,  unit:"PSI", extra:1, machine: "V"},   
  { key: "AI..4:1-1", label: "Temperatura", type: "analog", offset: -50, gain: 0.25 , unit: "°C" , extra:1, machine: "V"},
  { key: "AM..4:2-1", label: "Tiempo Horno centrífugo", type: "analog", offset:0,gain:1, unit: "s", extra:1, machine: "C" },
  { key: "AM..4:1-1", label: "Tiempo Vulcanización", type: "analog", offset: 0,gain:1, unit: "s" , extra:1, machine: "V"},

  { key: "I..1:10-1", label: "Emergencia", readOnly: true, machine: "G" },
];


const MODE_TAG = "Q..1:5-1";
const MACHINE_TAG = "Q..1:4-1";

function Dashboard() {

    const [shadow, setShadow] = useState({});
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [loadingTags, setLoadingTags] = useState({});


    //===============funcion para guardar estados en base de datos=============
    const handleSaveProcess = async () => {
      // Obtener valores analógicos reales
      const pressureRaw = shadow["AI..4:3-1"];
      const tempRaw = shadow["AI..4:1-1"];
      const tiempoVRaw = shadow["AM..4:1-1"];
      const tiempoCRaw = shadow["AM..4:2-1"];

      const pressure = pressureRaw
        ? (parseInt(pressureRaw, 16) * 3).toFixed(1)
        : null;

      const temperature = tempRaw
        ? (parseInt(tempRaw, 16) * 0.25 - 50).toFixed(1)
        : null;

      const tiempo_vulcanizacion = tiempoVRaw
        ? parseInt(tiempoVRaw, 16)
        : null;

      const tiempo_centrifuga = tiempoCRaw
        ? parseInt(tiempoCRaw, 16)
        : null;

      const data = {
        mode: modeText,
        machine: machineText,
        pressure,
        temperature,
        tiempo_vulcanizacion,
        tiempo_centrifuga,
      };


       console.log("Guardando proceso...");
      await saveTag(data);
    };


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



  const pulseTag = async (key, duration = 2000) => {
      if (!key) return;
      // marcar SOLO este tag como activo
      setLoadingTags(prev => ({ ...prev, [key]: true }));

      try {
        // Encender
        await fetch(`${API_BASE}/shadow`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attribute: key, value: "01" })
        });

        // Apagar luego de 2s
        setTimeout(async () => {
          await fetch(`${API_BASE}/shadow`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ attribute: key, value: "00" })
          });

          setLoadingTags(prev => ({ ...prev, [key]: false }));
          fetchShadow();
        }, duration);

      } catch (err) {
        console.error("Error en pulso", err);
        setLoadingTags(prev => ({ ...prev, [key]: false }));
      }
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

  //====================== esta activo mi modo manual=================
  const isModeEnabled = shadow[MODE_TAG] === "01";

  // ================= ESTADOS =================
  const modeValue = shadow[MODE_TAG];
  const machineValue = shadow[MACHINE_TAG];

  const modeText = modeValue === "00" ? "AUTOMÁTICO" : "MANUAL";
  const machineText = machineValue === "01" ? "CENTRIFUGADORA" : "VULCANIZADORA";

  //======Render Tags=========

  const renderTagCard = (tag) => {
  const rawValue = shadow[tag.key];
  const isOn = rawValue === "01";
  let displayValue = "--";

  if (tag.type === "analog" && rawValue) {
    const decimal = parseInt(rawValue, 16);
    const scaled = (decimal * tag.gain + tag.offset) * tag.extra;
    displayValue = scaled.toFixed(1);
  }

  return (
    <Card key={tag.key} className="rounded-2xl shadow-lg">
      <CardContent className="p-6 flex flex-col gap-4">
        <h2 className="text-xl font-semibold">{tag.label}</h2>

        {tag.type === "analog" ? (
          <p className="text-lg text-blue-600">
            {displayValue}{tag.unit}
          </p>
        ) : (
          <>
            <p className="text-lg">
              Estado:{" "}
              <span className={isOn ? "text-green-600" : "text-red-600"}>
                {isOn ? "ENCENDIDO" : "APAGADO"}
              </span>
            </p>

            {!tag.readOnly && (
              <div className="flex gap-2">
                {isModeEnabled && (
                  <>
                    <Button
                      disabled={loadingTags?.[tag.key]}
                      onClick={() => pulseTag(tag.key)}
                    >
                      {loadingTags?.[tag.key] ? "Encendiendo..." : "Encender"}
                    </Button>

                    <Button
                      disabled={loadingTags?.[tag.offTag]}
                      onClick={() => pulseTag(tag.offTag)}
                    >
                      {loadingTags?.[tag.offTag] ? "Apagando..." : "Apagar"}
                    </Button>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};


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

      {/* Informacion de la configuracion actual*/}
      <InfoConfigPLC shadow={shadow} />
      {/* ===== TARJETAS DE TAGS ===== */}
      <h2 className="text-2xl font-bold mt-6">Vulcanizadora</h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tagsConfig
          .filter(tag => !tag.noshowTag && tag.machine === "V")
          .map(tag => renderTagCard(tag))}
      </div>

      {/* ===== CENTRIFUGADORA ===== */}
      <h2 className="text-2xl font-bold mt-10">Centrifugadora</h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tagsConfig
          .filter(tag => !tag.noshowTag && tag.machine === "C")
          .map(tag => renderTagCard(tag))}
      </div>

      {/* ===== General ===== */}
      <h2 className="text-2xl font-bold mt-10">General</h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tagsConfig
          .filter(tag => !tag.noshowTag && tag.machine === "G")
          .map(tag => renderTagCard(tag))}
      </div>
      <Button onClick={handleSaveProcess}>
        Guardar proceso
      </Button>
      
    </div>
  </>
  
}
export default Dashboard;