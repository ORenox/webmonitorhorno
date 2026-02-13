import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import DecimalToHexCard from "../components/DecimalToHexCard";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import InfoConfigPLC from "../components/InfoConfigPLC";
import { saveTag } from "../services/tagService";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';

const API_BASE = "https://a49sbz67r1.execute-api.us-east-1.amazonaws.com";

const tagsConfig = [
  { key: "M..1:36-1", label: "Piston centrifugadora", sourceKey: "Q..1:10-1", offTag: "M..1:41-1", machine: "C" },
  { key: "M..1:37-1", label: "Motor Centrifugadora", sourceKey: "Q..1:8-1", offTag: "M..1:42-1", machine: "C" },
  { key: "M..1:39-1", label: "Motor Vulcanizadora", sourceKey: "Q..1:12-1", offTag: "M..1:41-1", machine: "V" },
  { key: "M..1:38-1", label: "Resistencias vulcanizadora", sourceKey: "Q..1:9-1", offTag: "M..1:42-1", machine: "V" },
  { key: "Q..1:8-1", label: "Motor Centrifugadora", readOnly: true, noshowTag: true },
  { key: "Q..1:10-1", label: "Piston centrifugadora", readOnly: true, noshowTag: true },
  { key: "Q..1:9-1", label: "Resistencias vulcanizadora", readOnly: true, noshowTag: true },
  { key: "Q..1:12-1", label: "Motor Vulcanizadora", readOnly: true, noshowTag: true },
  { key: "AI..4:3-1", label: "Presión", type: "analog", offset: 0, gain: 3, unit: "PSI", extra: 1, machine: "V" },
  { key: "AI..4:1-1", label: "Temperatura", type: "analog", offset: -50, gain: 0.25, unit: "°C", extra: 1, machine: "V" },
  { key: "AM..4:2-1", label: "Tiempo Horno centrífugo", type: "analog", offset: 0, gain: 1, unit: "s", extra: 1, machine: "C" },
  { key: "AM..4:1-1", label: "Tiempo Vulcanización", type: "analog", offset: 0, gain: 1, unit: "s", extra: 1, machine: "V" },
  { key: "I..1:10-1", label: "Emergencia", readOnly: true, machine: "G" },
];

const MODE_TAG = "Q..1:5-1";
const MACHINE_TAG = "Q..1:4-1";

function Dashboard() {
  const [shadow, setShadow] = useState({});
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingTags, setLoadingTags] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Actualizar hora cada segundo
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // =============== FUNCIÓN PARA GUARDAR ESTADOS =============
  const handleSaveProcess = async () => {
    const pressureRaw = shadow["AI..4:3-1"];
    const tempRaw = shadow["AI..4:1-1"];
    const tiempoVRaw = shadow["AM..4:1-1"];
    const tiempoCRaw = shadow["AM..4:2-1"];

    const pressure = pressureRaw ? (parseInt(pressureRaw, 16) * 3).toFixed(1) : null;
    const temperature = tempRaw ? (parseInt(tempRaw, 16) * 0.25 - 50).toFixed(1) : null;
    const tiempo_vulcanizacion = tiempoVRaw ? parseInt(tiempoVRaw, 16) : null;
    const tiempo_centrifuga = tiempoCRaw ? parseInt(tiempoCRaw, 16) : null;

    const data = {
      mode: modeText,
      machine: machineText,
      pressure,
      temperature,
      tiempo_vulcanizacion,
      tiempo_centrifuga,
    };

    console.log("Guardando proceso...", data);
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
    setLoadingTags(prev => ({ ...prev, [key]: true }));

    try {
      await fetch(`${API_BASE}/shadow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attribute: key, value: "01" })
      });

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
      .from("tags")
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
  const isModeEnabled = shadow[MODE_TAG] === "01";
  const modeValue = shadow[MODE_TAG];
  const machineValue = shadow[MACHINE_TAG];

  const modeText = modeValue === "00" ? "AUTOMÁTICO" : "MANUAL";
  const machineText = machineValue === "01" ? "CENTRIFUGADORA" : "VULCANIZADORA";

  // =============== RENDER TAG CARD MEJORADO ==============
  const renderTagCard = (tag) => {
    const rawValue = shadow[tag.key];
    const isOn = rawValue === "01";
    let displayValue = "--";

    if (tag.type === "analog" && rawValue) {
      const decimal = parseInt(rawValue, 16);
      const scaled = (decimal * tag.gain + tag.offset) * (tag.extra || 1);
      displayValue = scaled.toFixed(1);
    }

    // Colores por tipo de máquina
    const machineColor = {
      V: "from-blue-400 to-blue-800 border-blue-500",
      C: "from-purple-600 to-purple-800 border-purple-500",
      G: "from-gray-600 to-gray-800 border-gray-500"
    }[tag.machine] || "from-slate-600 to-slate-800 border-slate-500";

    return (
      <Card key={tag.key} className={`bg-gradient-to-br ${machineColor} rounded-2xl shadow-2xl border-0 overflow-hidden`}>
        <CardContent className="p-6 flex flex-col gap-4">
          {/* Header con badge de máquina */}
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold text-white">{tag.label}</h2>
            <span className="text-xs bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full">
              {tag.machine === "V" ? "VULC" : tag.machine === "C" ? "CENT" : "SIST"}
            </span>
          </div>

          {tag.type === "analog" ? (
            <div className="flex items-end justify-between">
              <div>
                <span className="text-4xl font-bold text-white">{displayValue}</span>
                <span className="text-lg text-white/70 ml-1">{tag.unit}</span>
              </div>
              <div className="text-4xl opacity-30 text-white">📊</div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isOn ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                  <span className={`text-lg font-semibold ${isOn ? 'text-green-300' : 'text-red-300'}`}>
                    {isOn ? "ACTIVO" : "INACTIVO"}
                  </span>
                </div>
                {tag.readOnly && tag.key === "I..1:10-1" && (
                  <span className="text-3xl text-red-400">⚠️</span>
                )}
              </div>

              {!tag.readOnly && user && isModeEnabled && (
                <div className="flex gap-3 mt-2">
                  <Button
                    disabled={loadingTags?.[tag.key]}
                    onClick={() => pulseTag(tag.key)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white border-0"
                  >
                    {loadingTags?.[tag.key] ? (
                      <span className="flex items-center gap-2">⏳ ENCENDIENDO</span>
                    ) : (
                      <span className="flex items-center gap-2">⚡ ENCENDER</span>
                    )}
                  </Button>

                  <Button
                    disabled={loadingTags?.[tag.offTag]}
                    onClick={() => pulseTag(tag.offTag)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white border-0"
                  >
                    {loadingTags?.[tag.offTag] ? (
                      <span className="flex items-center gap-2">⏳ APAGANDO</span>
                    ) : (
                      <span className="flex items-center gap-2">⛔ APAGAR</span>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* ========== HEADER FIJO ESTILO HMI INDUSTRIAL ========== */}
      <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-cyan-500/30 px-6 py-4 shadow-2xl">
        
        {/* Línea superior con logo/título y usuario */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            
            <div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 tracking-wider">
                HMI · HORNO & VULCANIZADORA
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-cyan-400/70 font-mono">SCADA v2.1.0-industrial</span>
                <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full">
                  ONLINE
                </span>
              </div>
            </div>
          </div>
          
        </div>

        {/* PANEL DE CONTROL - INDICADORES PRINCIPALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {/* MODO DE OPERACIÓN */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl border border-slate-700/50 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
                  <span className="w-1 h-4 bg-cyan-400 rounded-full"></span>
                  MODO OPERACIÓN
                </span>
                <div className="flex items-center gap-3 mt-2">
                  <div className={`w-3 h-3 rounded-full ${modeText === 'AUTOMÁTICO' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                  <span className="text-2xl font-bold text-white">
                    {modeText || "MANUAL"}
                  </span>
                </div>
              </div>
              <div className="text-5xl opacity-20 text-white">
                {modeText === 'AUTOMÁTICO' ? '⚡' : '🎮'}
              </div>
            </div>
          </div>

          {/* MÁQUINA ACTIVA */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl border border-slate-700/50 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
                  <span className="w-1 h-4 bg-blue-400 rounded-full"></span>
                  MÁQUINA ACTIVA
                </span>
                <div className="flex items-center gap-3 mt-2">
                  <div className={`w-3 h-3 rounded-full ${machineText === 'CENTRIFUGADORA' ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
                  <span className="text-2xl font-bold text-white">
                    {machineText || "SIN ASIGNAR"}
                  </span>
                </div>
              </div>
              <div className="text-5xl opacity-20 text-white">
                {machineText === 'CENTRIFUGADORA' ? '🔄' : '🔥'}
              </div>
            </div>
          </div>
        </div>

        {/* BARRA DE ESTADO DEL SISTEMA */}
        <div className="flex flex-wrap justify-between items-center mt-4 pt-4 border-t border-slate-800 text-xs text-slate-500 font-mono">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            SISTEMA: OPERATIVO
          </span>
          <span className="flex items-center gap-2">
            ⏱️ {currentTime.toLocaleTimeString('es-EC')}
          </span>
          <span className="flex items-center gap-2">
            🔄 ÚLTIMA ACTUALIZACIÓN: {currentTime.toLocaleTimeString('es-EC')}
          </span>
          <span className="text-cyan-400/70">
            PLC CONECTADO
          </span>
        </div>
      </div>

      {/* ========== CONTENIDO PRINCIPAL ========== */}
      <div className="px-6 py-8">
        {/* Información de configuración actual */}
        <div className="mb-8">
          <InfoConfigPLC shadow={shadow} />
        </div>

        {/* ===== SECCIÓN VULCANIZADORA ===== */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-white">VULCANIZADORA</h2>
            <span className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">
              {tagsConfig.filter(tag => !tag.noshowTag && tag.machine === "V").length} DISPOSITIVOS
            </span>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tagsConfig
              .filter(tag => !tag.noshowTag && tag.machine === "V")
              .map(tag => renderTagCard(tag))}
          </div>
        </div>

        {/* ===== SECCIÓN CENTRIFUGADORA ===== */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-purple-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-white">CENTRIFUGADORA</h2>
            <span className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">
              {tagsConfig.filter(tag => !tag.noshowTag && tag.machine === "C").length} DISPOSITIVOS
            </span>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tagsConfig
              .filter(tag => !tag.noshowTag && tag.machine === "C")
              .map(tag => renderTagCard(tag))}
          </div>
        </div>

        {/* ===== SECCIÓN GENERAL / SEGURIDAD ===== */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gray-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-white">SISTEMA GENERAL</h2>
            <span className="text-xs bg-gray-500/20 text-gray-300 px-3 py-1 rounded-full">
              SEGURIDAD
            </span>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tagsConfig
              .filter(tag => !tag.noshowTag && tag.machine === "G")
              .map(tag => renderTagCard(tag))}
          </div>
        </div>

        {/* ===== BOTÓN GUARDAR PROCESO ===== */}
        <div className="flex justify-center mt-12 mb-8">
          <Button
            onClick={handleSaveProcess}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold py-4 px-12 rounded-xl shadow-2xl shadow-cyan-500/20 border border-cyan-400/30 text-lg flex items-center gap-3"
          >
            <span>💾</span>
            GUARDAR PROCESO ACTUAL
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;