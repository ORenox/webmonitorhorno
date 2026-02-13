import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import InfoConfigPLC from "../components/InfoConfigPLC";
import { saveTag } from "../services/tagService";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const API_BASE = "https://a49sbz67r1.execute-api.us-east-1.amazonaws.com";

const tagsConfig = [
  { key: "M..1:36-1", label: "Piston centrifugadora", sourceKey: "Q..1:10-1", offTag: "M..1:41-1", machine: "C" },
  { key: "M..1:37-1", label: "Motor Centrifugadora", sourceKey: "Q..1:8-1", offTag: "M..1:42-1", machine: "C" },
  { key: "M..1:39-1", label: "Motor Vulcanizadora", sourceKey: "Q..1:12-1", offTag: "M..1:41-1", machine: "V" },
  { key: "M..1:38-1", label: "Resistencias vulcanizadora", sourceKey: "Q..1:9-1", offTag: "M..1:42-1", machine: "V" },
  { key: "Q..1:8-1", label: "Motor Centrifugadora", readOnly: true, noshowTag: true },
  { key: "Q..1:10-1", label: "Piston centrifugadora", readOnly: true, noshowTag: true },
  { key: "Q..1:9-1", label: "Resistencias vulcanizadora", readOnly: true, noshowTag: true },
  { key: "Q..1:12-1", label: "motor Vulcanizadora", readOnly: true, noshowTag: true },
  { key: "AI..4:3-1", label: "Presión", type: "analog", offset: -200, gain: 1, unit: "PSI", extra: 3.75, machine: "V" },
  { key: "AI..4:1-1", label: "Temperatura", type: "analog", offset: -50, gain: 0.25, unit: "°C", extra: 1, machine: "V" },
  { key: "AM..4:2-1", label: "Tiempo Horno centrífugo", type: "analog", offset: 0, gain: 1, unit: "s", extra: 1, machine: "C" },
  { key: "AM..4:1-1", label: "Tiempo Vulcanización", type: "analog", offset: 0, gain: 1, unit: "s", extra: 1, machine: "V" },
  { key: "V..4:46-1", label: "Temperatura de Horno", type: "analog", offset: 0, gain: 1, unit: "°C", extra: 0.1, machine: "C" },
  { key: "I..1:10-1", label: "Emergencia", readOnly: true, machine: "G" },
];

const MODE_TAG = "Q..1:5-1";
const MACHINE_TAG = "Q..1:4-1";

function Dashboard() {
  const [shadow, setShadow] = useState({});
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingTags, setLoadingTags] = useState({});
  const [chartData, setChartData] = useState([]);
  const [timeRange, setTimeRange] = useState('1h'); // '1h', '6h', '24h', '7d'

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const processAnalogValue = (rawValue, tag) => {
    if (!rawValue) return null;
    const decimal = parseInt(rawValue, 16);
    return (decimal * tag.gain + tag.offset) * (tag.extra || 1);
  };

  const handleSaveProcess = async () => {
    const pressureRaw = shadow["AI..4:3-1"];
    const tempRaw = shadow["AI..4:1-1"];
    const tiempoVRaw = shadow["AM..4:1-1"];
    const tiempoCRaw = shadow["AM..4:2-1"];

    const pressure = pressureRaw ? processAnalogValue(pressureRaw, tagsConfig.find(t => t.key === "AI..4:3-1")) : null;
    const temperature = tempRaw ? processAnalogValue(tempRaw, tagsConfig.find(t => t.key === "AI..4:1-1")) : null;
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

    console.log("Guardando proceso...");
    await saveTag(data);
    
    // Actualizar datos de gráficas
    updateChartData(pressure, temperature);
  };

  const updateChartData = (pressure, temperature) => {
    const newPoint = {
      timestamp: new Date().toLocaleTimeString(),
      fullTimestamp: new Date(),
      pressure: pressure || 0,
      temperature: temperature || 0,
    };

    setChartData(prevData => {
      const newData = [...prevData, newPoint];
      // Mantener solo los últimos 100 puntos para rendimiento
      if (newData.length > 100) {
        return newData.slice(-100);
      }
      return newData;
    });
  };

  const fetchShadow = async () => {
    try {
      const res = await fetch(`${API_BASE}/shadow`);
      const data = await res.json();
      setShadow(data);
      
      // Actualizar gráficas con nuevos valores
      const pressureTag = tagsConfig.find(t => t.key === "AI..4:3-1");
      const tempTag = tagsConfig.find(t => t.key === "AI..4:1-1");
      
      const pressure = data["AI..4:3-1"] ? processAnalogValue(data["AI..4:3-1"], pressureTag) : null;
      const temperature = data["AI..4:1-1"] ? processAnalogValue(data["AI..4:1-1"], tempTag) : null;
      
      if (pressure !== null || temperature !== null) {
        updateChartData(pressure, temperature);
      }
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

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error) {
      setHistory(data);
      
      // Convertir datos históricos para gráficas
      const historicalData = data.reverse().map(record => ({
        timestamp: new Date(record.created_at).toLocaleTimeString(),
        fullTimestamp: new Date(record.created_at),
        pressure: record.pressure || 0,
        temperature: record.temperature || 0,
      }));
      
      setChartData(historicalData);
    }
  };

  // Filtrar datos según el rango de tiempo seleccionado
  const getFilteredChartData = () => {
    if (chartData.length === 0) return [];
    
    const now = new Date();
    const timeLimits = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
    };
    
    const limit = timeLimits[timeRange];
    return chartData.filter(point => 
      now - point.fullTimestamp < limit
    );
  };

  useEffect(() => {
    fetchShadow();
    fetchHistory();
    const interval = setInterval(fetchShadow, 4000);
    return () => clearInterval(interval);
  }, []);

  const isModeEnabled = shadow[MODE_TAG] === "01";
  const modeValue = shadow[MODE_TAG];
  const machineValue = shadow[MACHINE_TAG];

  const modeText = modeValue === "00" ? "AUTOMÁTICO" : "MANUAL";
  const machineText = machineValue === "01" ? "CENTRIFUGADORA" : "VULCANIZADORA";

  const renderTagCard = (tag) => {
    const rawValue = shadow[tag.sourceKey || tag.key];
    const isOn = rawValue === "01";
    let displayValue = "--";

    if (tag.type === "analog" && rawValue) {
      displayValue = processAnalogValue(rawValue, tag).toFixed(1);
    }

    return (
      <Card key={tag.key} className="border border-gray-200 rounded-lg shadow-sm">
        <CardContent className="p-4">
          <h3 className="text-base font-medium text-gray-700 mb-2">{tag.label}</h3>

          {tag.type === "analog" ? (
            <p className="text-xl text-gray-900 font-semibold">
              {displayValue}{tag.unit}
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">Estado</span>
                <span className={`text-sm font-medium ${isOn ? "text-green-600" : "text-red-600"}`}>
                  {isOn ? "ENCENDIDO" : "APAGADO"}
                </span>
              </div>

              {!tag.readOnly && user && isModeEnabled && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={loadingTags?.[tag.key]}
                    onClick={() => pulseTag(tag.key)}
                    className="flex-1 bg-emerald-600 text-white border border-emerald-700 hover:bg-emerald-700 text-sm py-2 font-medium shadow-sm"
                  >
                    {loadingTags?.[tag.key] ? "..." : "Encender"}
                  </Button>

                  <Button
                    size="sm"
                    disabled={loadingTags?.[tag.offTag]}
                    onClick={() => pulseTag(tag.offTag)}
                    className="flex-1 bg-rose-700 text-white border border-rose-800 hover:bg-rose-800 text-sm py-2 font-medium shadow-sm"
                  >
                    {loadingTags?.[tag.offTag] ? "..." : "Apagar"}
                  </Button>
                </div>
              )}
              
              {!tag.readOnly && user && !isModeEnabled && (
                <div className="mt-2 text-xs text-gray-500 italic">
                  Cambiar a modo manual para controlar
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  const filteredChartData = getFilteredChartData();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header fijo con sombra y borde marcado */}
      <header className="sticky top-0 z-10 bg-white border-b-2 border-gray-300 shadow-md px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 text-center">
            Panel de Control
          </h1>

          {/* Login destacado con fondo y borde distintivo */}
          {user && (
            <div className="mt-3 bg-blue-100 border-2 border-blue-300 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                <span className="text-sm font-semibold text-blue-900">
                  Sesión activa
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-blue-900 font-bold">
                  {user.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs bg-white text-blue-800 border-2 border-blue-400 px-3 py-1.5 rounded font-medium hover:bg-blue-50 transition-colors"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}

          {/* Estados generales con separación visual */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-gray-100 rounded-lg p-3 border border-gray-300">
              <div className="text-xs text-gray-600 font-medium mb-1">MODO</div>
              <div className="font-bold text-gray-900">{modeText}</div>
              {isModeEnabled && (
                <span className="text-xs text-green-600 font-medium ml-2">✓ Manual</span>
              )}
            </div>
            <div className="bg-gray-100 rounded-lg p-3 border border-gray-300">
              <div className="text-xs text-gray-600 font-medium mb-1">MÁQUINA</div>
              <div className="font-bold text-gray-900">{machineText}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Línea divisoria visual entre header y contenido */}
      <div className="h-1 bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>

      {/* Contenido principal con fondo diferente */}
      <main className="max-w-7xl mx-auto px-4 py-8 bg-gray-50">
        <InfoConfigPLC shadow={shadow} />

        {/* SECCIÓN DE GRÁFICAS - NUEVA */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 border-b-2 border-gray-300 pb-2">
              Monitoreo en Tiempo Real
            </h2>
            
            {/* Selector de rango de tiempo */}
            <div className="flex gap-2">
              {['1h', '6h', '24h', '7d'].map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    timeRange === range
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {range === '1h' ? '1 Hora' : 
                   range === '6h' ? '6 Horas' : 
                   range === '24h' ? '24 Horas' : '7 Días'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfica de Temperatura */}
            <Card className="border border-gray-200 rounded-lg shadow-sm">
              <CardContent className="p-4">
                <h3 className="text-md font-semibold text-gray-700 mb-4">
                  Temperatura (°C) vs Tiempo
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={filteredChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="timestamp" 
                        interval={Math.floor(filteredChartData.length / 5)}
                      />
                      <YAxis 
                        domain={[0, 200]} // Eje fijo de 0 a 200°C
                        label={{ value: '°C', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="temperature" 
                        stroke="#ef4444" 
                        fill="#fee2e2" 
                        name="Temperatura (°C)"
                        unit="°C"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Valores actuales */}
                {filteredChartData.length > 0 && (
                  <div className="mt-3 text-sm text-gray-600">
                    <span className="font-medium">Actual: </span>
                    <span className="text-red-600 font-bold">
                      {filteredChartData[filteredChartData.length - 1]?.temperature?.toFixed(1)}°C
                    </span>
                    <span className="mx-2">|</span>
                    <span className="font-medium">Máx: </span>
                    <span className="text-orange-600">
                      {Math.max(...filteredChartData.map(d => d.temperature || 0)).toFixed(1)}°C
                    </span>
                    <span className="mx-2">|</span>
                    <span className="font-medium">Mín: </span>
                    <span className="text-blue-600">
                      {Math.min(...filteredChartData.map(d => d.temperature || 0)).toFixed(1)}°C
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Gráfica de Presión */}
            <Card className="border border-gray-200 rounded-lg shadow-sm">
              <CardContent className="p-4">
                <h3 className="text-md font-semibold text-gray-700 mb-4">
                  Presión (PSI) vs Tiempo
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={filteredChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="timestamp" 
                        interval={Math.floor(filteredChartData.length / 5)}
                      />
                      <YAxis 
                        domain={[0, 3000]} // Eje fijo de 0 a 3000 PSI
                        label={{ value: 'PSI', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="pressure" 
                        stroke="#3b82f6" 
                        fill="#dbeafe" 
                        name="Presión (PSI)"
                        unit="PSI"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Valores actuales */}
                {filteredChartData.length > 0 && (
                  <div className="mt-3 text-sm text-gray-600">
                    <span className="font-medium">Actual: </span>
                    <span className="text-blue-600 font-bold">
                      {filteredChartData[filteredChartData.length - 1]?.pressure?.toFixed(1)} PSI
                    </span>
                    <span className="mx-2">|</span>
                    <span className="font-medium">Máx: </span>
                    <span className="text-indigo-600">
                      {Math.max(...filteredChartData.map(d => d.pressure || 0)).toFixed(1)} PSI
                    </span>
                    <span className="mx-2">|</span>
                    <span className="font-medium">Mín: </span>
                    <span className="text-cyan-600">
                      {Math.min(...filteredChartData.map(d => d.pressure || 0)).toFixed(1)} PSI
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Vulcanizadora */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">
            Vulcanizadora
          </h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {tagsConfig
              .filter(tag => !tag.noshowTag && tag.machine === "V")
              .map(tag => renderTagCard(tag))}
          </div>
        </section>

        {/* Centrifugadora */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">
            Centrifugadora
          </h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {tagsConfig
              .filter(tag => !tag.noshowTag && tag.machine === "C")
              .map(tag => renderTagCard(tag))}
          </div>
        </section>

        {/* General */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">
            General
          </h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {tagsConfig
              .filter(tag => !tag.noshowTag && tag.machine === "G")
              .map(tag => renderTagCard(tag))}
          </div>
        </section>

        {/* Botón guardar */}
        <div className="flex justify-center mt-8">
          <Button
            onClick={handleSaveProcess}
            className="bg-gray-800 text-white px-8 py-3 rounded-lg hover:bg-gray-700 text-sm font-medium border-2 border-gray-600 shadow-sm"
          >
            Guardar proceso
          </Button>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;