import { useState } from "react";

const API_BASE = "https://a49sbz67r1.execute-api.us-east-1.amazonaws.com";

const tiemposTags = [
  "V..4:8-1",
  "V..4:10-1",
  "V..4:12-1",
  "V..4:14-1",
  "V..4:16-1",
  "V..4:18-1",
];

const presionesOnTags = [
  "V..4:20-1",
  "V..4:22-1",
  "V..4:24-1",
  "V..4:26-1",
  "V..4:28-1",
  "V..4:30-1",
];

const presionesOffTags = [
  "V..4:32-1",
  "V..4:34-1",
  "V..4:36-1",
  "V..4:38-1",
  "V..4:40-1",
  "V..4:42-1",
];

const tiempoCentrifugadoTag = "V..4:44-1";
const tempVulcOnTag = "V..4:0-1";
const tempVulcOffTag = "V..4:2-1";

function toHex(value) {
  return Math.max(value, 0)
    .toString(16)
    .toUpperCase()
    .padStart(4, "0");
}

function ConfiguracionPLC() {
  // Estados separados para cada operación
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [loadingCentrifugado, setLoadingCentrifugado] = useState(false);
  const [loadingTempVulc, setLoadingTempVulc] = useState(false);

  const [tiempos, setTiempos] = useState(Array(6).fill(""));
  const [presiones, setPresiones] = useState(Array(6).fill(""));
  const [tiempoCentrifugado, setTiempoCentrifugado] = useState("");
  const [tempVulcanizado, setTempVulcanizado] = useState("");

  // Errores separados
  const [errorConfig, setErrorConfig] = useState("");
  const [errorCentrifugado, setErrorCentrifugado] = useState("");
  const [errorTempVulc, setErrorTempVulc] = useState("");

  const handleTiempoChange = (i, value) => {
    const nuevos = [...tiempos];
    nuevos[i] = value;
    setTiempos(nuevos);
  };

  const handlePresionChange = (i, value) => {
    const nuevos = [...presiones];
    nuevos[i] = value;
    setPresiones(nuevos);
  };

  const enviarConfiguracion = async () => {
    setErrorConfig("");

    const tiemposNum = [];
    const presionesNum = [];

    // VALIDAR TIEMPOS
    for (let i = 0; i < tiempos.length; i++) {
      if (tiempos[i] === "") {
        tiemposNum.push(null);
        continue;
      }

      const val = Number(tiempos[i]);

      if (isNaN(val) || val < 0 || val > 99) {
        setErrorConfig(`El Tiempo ${i + 1} debe estar entre 0 y 99 minutos`);
        return;
      }

      tiemposNum.push(val);
    }

    // VALIDAR PRESIONES
    for (let i = 0; i < presiones.length; i++) {
      if (presiones[i] === "") {
        presionesNum.push(null);
        continue;
      }

      const val = Number(presiones[i]);

      if (isNaN(val) || val < 0 || val > 3000) {
        setErrorConfig(`La Presión ${i + 1} debe estar entre 0 y 3000 PSI`);
        return;
      }

      presionesNum.push(val);
    }

    // VALIDAR ORDEN CRECIENTE
    const presionesFiltradas = presionesNum.filter(p => p !== null);
    for (let i = 1; i < presionesFiltradas.length; i++) {
      if (presionesFiltradas[i] <= presionesFiltradas[i - 1]) {
        setErrorConfig("Las presiones deben ser estrictamente crecientes");
        return;
      }
    }

    setLoadingConfig(true);

    const payloads = [];

    tiemposNum.forEach((val, i) => {
      if (val !== null) {
        payloads.push({
          attribute: tiemposTags[i],
          value: toHex(val),
        });
      }
    });

    presionesNum.forEach((val, i) => {
      if (val !== null) {
        const off = val - 10;
        payloads.push(
          {
            attribute: presionesOnTags[i],
            value: toHex(val),
          },
          {
            attribute: presionesOffTags[i],
            value: toHex(off < 0 ? 0 : off),
          }
        );
      }
    });

    try {
      await Promise.all(
        payloads.map(p =>
          fetch(`${API_BASE}/shadow`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(p),
          })
        )
      );

      setTiempos(Array(6).fill(""));
      setPresiones(Array(6).fill(""));
      setLoadingConfig(false);
    } catch (err) {
      console.error("Error enviando configuración", err);
      setErrorConfig("Error al enviar configuración");
      setLoadingConfig(false);
    }
  };

  const enviarCentrifugado = async () => {
    setErrorCentrifugado("");

    if (tiempoCentrifugado === "") {
      setErrorCentrifugado("Debe ingresar el tiempo de centrifugado");
      return;
    }

    const val = Number(tiempoCentrifugado);

    if (isNaN(val) || val < 0 || val > 99) {
      setErrorCentrifugado("El tiempo de centrifugado debe estar entre 0 y 99 segundos");
      return;
    }

    setLoadingCentrifugado(true);

    try {
      await fetch(`${API_BASE}/shadow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attribute: tiempoCentrifugadoTag,
          value: toHex(val),
        }),
      });

      setTiempoCentrifugado("");
      setLoadingCentrifugado(false);
    } catch (err) {
      console.error("Error enviando centrifugado", err);
      setErrorCentrifugado("Error al enviar tiempo de centrifugado");
      setLoadingCentrifugado(false);
    }
  };

  const enviarTemperaturaVulcanizado = async () => {
    setErrorTempVulc("");

    if (tempVulcanizado === "") {
      setErrorTempVulc("Debe ingresar la temperatura de vulcanizado");
      return;
    }

    const val = Number(tempVulcanizado);

    if (isNaN(val) || val < 0 || val > 190) {
      setErrorTempVulc("La temperatura de vulcanizado debe estar entre 0 y 190 °C");
      return;
    }

    setLoadingTempVulc(true);

    try {
      // Enviar temperatura ON
      await fetch(`${API_BASE}/shadow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attribute: tempVulcOnTag,
          value: toHex(val),
        }),
      });

      await fetch(`${API_BASE}/shadow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attribute: tempVulcOffTag,
          value: toHex(val - 20 < 0 ? 0 : val - 20),
        }),
      });

      setTempVulcanizado("");
      setLoadingTempVulc(false);
    } catch (err) {
      console.error("Error enviando temperatura", err);
      setErrorTempVulc("Error al enviar temperatura de vulcanizado");
      setLoadingTempVulc(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl p-6 flex flex-col gap-6 w-full h-full border border-cyan-500/30 backdrop-blur-sm">
      
      {/* HEADER */}
      <div className="flex items-center gap-3 border-b border-cyan-500/30 pb-4">
        <div className="w-2 h-8 bg-cyan-400 rounded-full animate-pulse"></div>
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
          CONFIGURACIÓN PLC
        </h2>
        <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/30 ml-auto">
          ⚡ MODO ESCRITURA
        </span>
      </div>

      {/* SECCIÓN VULCANIZADORA */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-lg text-blue-400">🔥</span>
          <h3 className="text-lg font-semibold text-white tracking-wide">
            VULCANIZADORA - TIEMPOS Y PRESIONES
          </h3>
          <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
            6 ETAPAS
          </span>
        </div>

        {/* INPUTS DE CONFIGURACIÓN */}
        <div className="grid gap-3">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-center bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300">
              
              {/* TIEMPO */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-cyan-400/70 w-16">
                  T{String(i + 1).padStart(2, '0')}
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="99"
                  placeholder="0-99 min"
                  value={tiempos[i]}
                  onChange={e => handleTiempoChange(i, e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all"
                />
                <span className="text-xs text-slate-400 w-8">min</span>
              </div>

              {/* PRESIÓN */}
              <div className="flex items-center gap-2 lg:col-span-2">
                <span className="text-xs font-mono text-blue-400/70 w-16">
                  P{String(i + 1).padStart(2, '0')}
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="3000"
                  placeholder="0-3000 PSI"
                  onChange={e => handlePresionChange(i, e.target.value)}
                  value={presiones[i]}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
                />
                <span className="text-xs text-slate-400 w-8">PSI</span>
              </div>

              {/* INDICADOR */}
              <div className="hidden lg:flex items-center justify-end">
                <span className="text-xs text-slate-500">
                  {tiempos[i] && presiones[i] ? '✅ LISTO' : '⏳ PENDIENTE'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* BOTÓN CONFIGURACIÓN VULCANIZADORA */}
        <div className="flex flex-col items-center w-full mt-4">
          <button
            onClick={enviarConfiguracion}
            disabled={loadingConfig}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/20 border border-blue-400/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loadingConfig ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>ENVIANDO CONFIGURACIÓN...</span>
              </>
            ) : (
              <>
                <span>⚙️</span>
                <span>ESTABLECER TIEMPOS Y PRESIONES</span>
              </>
            )}
          </button>

          {errorConfig && (
            <div className="w-full bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mt-3 text-center flex items-center justify-center gap-2">
              <span>⚠️</span>
              <span>{errorConfig}</span>
            </div>
          )}
        </div>
      </div>

      {/* TEMPERATURA VULCANIZADO */}
      <div className="space-y-4 mt-2">
        <div className="flex items-center gap-2">
          <span className="text-lg text-orange-400">🌡️</span>
          <h3 className="text-lg font-semibold text-white tracking-wide">
            TEMPERATURA VULCANIZADO
          </h3>
          <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full">
            ON/OFF ±20°C
          </span>
        </div>

        <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-xl border border-orange-500/30 p-5">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <input
              type="number"
              min="0"
              max="190"
              placeholder="Temperatura objetivo (°C)"
              value={tempVulcanizado}
              onChange={e => setTempVulcanizado(e.target.value)}
              className="flex-1 w-full bg-slate-900 border border-orange-500/50 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 outline-none transition-all text-lg"
            />
            
            <button
              onClick={enviarTemperaturaVulcanizado}
              disabled={loadingTempVulc}
              className="w-full md:w-auto bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-orange-500/20 border border-orange-400/30 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 min-w-[200px]"
            >
              {loadingTempVulc ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>ENVIANDO...</span>
                </>
              ) : (
                <>
                  <span>🔥</span>
                  <span>ESTABLECER TEMPERATURA</span>
                </>
              )}
            </button>
          </div>

          {tempVulcanizado && (
            <div className="mt-4 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-400">MAX:</span>
                <span className="text-white font-mono">{tempVulcanizado}°C</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-400">MIN:</span>
                <span className="text-white font-mono">
                  {Math.max(0, Number(tempVulcanizado) - 20)}°C
                </span>
              </div>
              <span className="text-xs text-slate-400">(Diferencial 20°C)</span>
            </div>
          )}
        </div>

        {errorTempVulc && (
          <div className="w-full bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg flex items-center justify-center gap-2">
            <span>⚠️</span>
            <span>{errorTempVulc}</span>
          </div>
        )}
      </div>

      {/* SECCIÓN CENTRIFUGADORA */}
      <div className="space-y-4 mt-2 border-t border-purple-500/30 pt-6">
        <div className="flex items-center gap-2">
          <span className="text-lg text-purple-400">🔄</span>
          <h3 className="text-lg font-semibold text-white tracking-wide">
            CENTRIFUGADORA - TIEMPO DE PROCESO
          </h3>
          <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
            SEGUNDOS
          </span>
        </div>

        <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-xl border border-purple-500/30 p-5">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="99"
                placeholder="Tiempo de centrifugado (s)"
                value={tiempoCentrifugado}
                onChange={e => setTiempoCentrifugado(e.target.value)}
                className="flex-1 w-full bg-slate-900 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all text-lg"
              />
              <span className="text-lg text-purple-400 font-mono">s</span>
            </div>

            <button
              onClick={enviarCentrifugado}
              disabled={loadingCentrifugado}
              className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-purple-500/20 border border-purple-400/30 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 min-w-[200px]"
            >
              {loadingCentrifugado ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>ENVIANDO...</span>
                </>
              ) : (
                <>
                  <span>⏲️</span>
                  <span>ESTABLECER TIEMPO</span>
                </>
              )}
            </button>
          </div>
        </div>

        {errorCentrifugado && (
          <div className="w-full bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg flex items-center justify-center gap-2">
            <span>⚠️</span>
            <span>{errorCentrifugado}</span>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="flex justify-end items-center mt-4 pt-4 border-t border-slate-700/50">
        <span className="text-xs text-slate-500 font-mono flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          PLC CONECTADO · LISTO PARA ESCRIBIR
        </span>
      </div>
    </div>
  );
}

export default ConfiguracionPLC;