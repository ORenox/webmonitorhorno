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

const tempVulcOnTagMas = "V..4:4-1";
const tempVulcOffTagMas = "V..4:6-1";

function toHex(value) {
  return Math.max(value, 0)
    .toString(16)
    .toUpperCase()
    .padStart(4, "0");
}

function ConfiguracionPLC() {
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [loadingCentrifugado, setLoadingCentrifugado] = useState(false);
  const [loadingTempVulc, setLoadingTempVulc] = useState(false);

  const [tiempos, setTiempos] = useState(Array(6).fill("")); 
  const [presiones, setPresiones] = useState(Array(6).fill("")); 
  const [tiempoCentrifugado, setTiempoCentrifugado] = useState("");
  const [tempVulcanizado, setTempVulcanizado] = useState("");

  const [errorConfig, setErrorConfig] = useState("");
  const [errorCentrifugado, setErrorCentrifugado] = useState("");
  const [errorTempVulc, setErrorTempVulc] = useState("");

  const [successConfig, setSuccessConfig] = useState("");
  const [successCentrifugado, setSuccessCentrifugado] = useState("");
  const [successTempVulc, setSuccessTempVulc] = useState("");

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
    setSuccessConfig("");

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
          value: toHex(val * 60),
        });
      }
    });

    presionesNum.forEach((val, i) => {
      if (val !== null) {
        const offValue = Math.max(val - 30, 0);
        
        payloads.push(
          {
            attribute: presionesOnTags[i],
            value: toHex(val),
          },
          {
            attribute: presionesOffTags[i],
            value: toHex(offValue),
          }
        );
      }
    });

    try {
      for (const payload of payloads) {
        console.log("Enviando:", payload);
        
        const response = await fetch(`${API_BASE}/shadow`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        
        if (!response.ok) {
          throw new Error(`Error enviando ${payload.attribute}: ${response.status}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setTiempos(Array(6).fill(""));
      setPresiones(Array(6).fill(""));
      setSuccessConfig("✅ Configuración guardada correctamente");
      setLoadingConfig(false);
      
      setTimeout(() => setSuccessConfig(""), 3000);
      
    } catch (err) {
      console.error("Error enviando configuración", err);
      setErrorConfig("Error al enviar configuración");
      setLoadingConfig(false);
    }
  };

  const enviarCentrifugado = async () => {
    setErrorCentrifugado("");
    setSuccessCentrifugado("");

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
          value: toHex(val * 100),
        }),
      });

      setTiempoCentrifugado("");
      setSuccessCentrifugado("✅ Tiempo de centrifugado guardado");
      setLoadingCentrifugado(false);
      
      setTimeout(() => setSuccessCentrifugado(""), 3000);
    } catch (err) {
      console.error("Error enviando centrifugado", err);
      setErrorCentrifugado("Error al enviar tiempo de centrifugado");
      setLoadingCentrifugado(false);
    }
  };

  const enviarTemperaturaVulcanizado = async () => {
    setErrorTempVulc("");
    setSuccessTempVulc("");
    
    if (tempVulcanizado === "") {
      setErrorTempVulc("Debe ingresar la temperatura de vulcanizado");
      return;
    }

    const val = Number(tempVulcanizado);
    let val2;
    let control;

    if (val <= 50) {
        val2 = val - 1;
        control = 2;
    } else if (val > 50 && val <= 100) {
        val2 = val - 5;
        control = 4;
    } else if (val > 100 && val <= 150) {
        val2 = val - 8;
        control = 4;
    } else {
        val2 = val - 10;
        control = 4;
    }

    if (isNaN(val) || val < 0 || val > 190) {
      setErrorTempVulc("La temperatura de vulcanizado debe estar entre 0 y 190 °C");
      return;
    }
    
    setLoadingTempVulc(true);

    try {
      await fetch(`${API_BASE}/shadow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attribute: tempVulcOnTag,
          value: toHex(val2 < 0 ? 0 : val2),
        }),
      });

      await fetch(`${API_BASE}/shadow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attribute: tempVulcOffTag,
          value: toHex(val2 - control < 0 ? 0 : val2 - control),
        }),
      });

      await fetch(`${API_BASE}/shadow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attribute: tempVulcOnTagMas,
          value: toHex(val < 0 ? 0 : val),
        }),
      });

      await fetch(`${API_BASE}/shadow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attribute: tempVulcOffTagMas,
          value: toHex(val - 2 < 0 ? 0 : val - 2),
        }),
      });
      
      setTempVulcanizado("");
      setSuccessTempVulc("✅ Temperatura de vulcanizado guardada");
      setLoadingTempVulc(false);
      
      setTimeout(() => setSuccessTempVulc(""), 3000);
    } catch (err) {
      console.error("Error enviando temperatura", err);
      setErrorTempVulc("Error al enviar temperatura de vulcanizado");
      setLoadingTempVulc(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-6 flex flex-col gap-6 w-full">
      {/* Sección Vulcanizadora */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
          Configuración Vulcanizadora
        </h2>

        {/* Tabla de tiempos y presiones */}
        <div className="space-y-3">
          {/* Encabezados visibles solo en desktop */}
          <div className="hidden sm:grid grid-cols-4 gap-4 text-xs font-medium text-gray-500 px-3">
            <div>Tiempo (min)</div>
            <div></div>
            <div>Presión (PSI)</div>
            <div></div>
          </div>

          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-center">
              <input
                type="number"
                inputMode="numeric"
                min="0"
                max="99"
                placeholder={`T${i + 1}`}
                value={tiempos[i]}
                onChange={e => handleTiempoChange(i, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-sm text-gray-500 sm:text-gray-600">min</span>

              <input
                type="number"
                inputMode="numeric"
                min="0"
                max="3000"
                placeholder={`P${i + 1}`}
                onChange={e => handlePresionChange(i, e.target.value)}
                value={presiones[i]}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-sm text-gray-500 sm:text-gray-600">PSI</span>
            </div>
          ))}
        </div>

        {/* Botón de configuración */}
        <div className="mt-4">
          <button
            onClick={enviarConfiguracion}
            disabled={loadingConfig}
            className="w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors font-medium text-sm sm:text-base"
          >
            {loadingConfig ? "Enviando..." : "Guardar configuración (tiempos y presiones)"}
          </button>
          
          {errorConfig && (
            <div className="mt-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
              {errorConfig}
            </div>
          )}
          
          {successConfig && (
            <div className="mt-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm">
              {successConfig}
            </div>
          )}
        </div>

        {/* Separador */}
        <div className="my-6 border-t border-gray-200"></div>

        {/* Temperatura de Vulcanización */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-700">Temperatura de Vulcanización</h3>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="number"
              min="0"
              max="190"
              placeholder="Temperatura (°C)"
              value={tempVulcanizado}
              onChange={e => setTempVulcanizado(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={enviarTemperaturaVulcanizado}
            disabled={loadingTempVulc}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium text-sm sm:text-base"
          >
            {loadingTempVulc ? "Enviando..." : "Guardar temperatura"}
          </button>
          
          {errorTempVulc && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
              {errorTempVulc}
            </div>
          )}
          
          {successTempVulc && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm">
              {successTempVulc}
            </div>
          )}
        </div>
      </div>

      {/* Separador entre secciones */}
      <div className="my-2 border-t-2 border-gray-200"></div>

      {/* Sección Centrifugadora */}
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 pb-2 border-b border-gray-200">
          Configuración Centrifugadora
        </h2>

        <div className="flex flex-col sm:flex-row gap-3 items-start">
          <div className="flex-1 w-full">
            <input
              type="number"
              min="0"
              max="99"
              placeholder="Tiempo centrifugado (segundos)"
              value={tiempoCentrifugado}
              onChange={e => setTiempoCentrifugado(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <span className="text-sm text-gray-500 sm:mt-2">segundos</span>
        </div>

        <button
          onClick={enviarCentrifugado}
          disabled={loadingCentrifugado}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium text-sm sm:text-base"
        >
          {loadingCentrifugado ? "Enviando..." : "Guardar tiempo centrifugado"}
        </button>

        {errorCentrifugado && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
            {errorCentrifugado}
          </div>
        )}
        
        {successCentrifugado && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm">
            {successCentrifugado}
          </div>
        )}
      </div>
    </div>
  );
}

export default ConfiguracionPLC;