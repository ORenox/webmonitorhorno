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
            value: toHex(val - 20 < 0 ? 0 : val - 20), // Ajusta según necesites
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
      <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-6 w-full h-full">
        <h2 className="text-2xl font-bold">Configuración de máquina vulcanizadora</h2>

        <div>
          <div className="grid gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="grid grid-cols-4 gap-1 items-center">
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="99"
                  placeholder={`T${i + 1} (min)`}
                  value={tiempos[i]}
                  onChange={e => handleTiempoChange(i, e.target.value)}
                  className="border rounded-lg px-3 py-2"
                />
                <span className="text-gray-600">min</span>

                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="3000"
                  placeholder={`P ${i + 1} (PSI)`}
                  onChange={e => handlePresionChange(i, e.target.value)}
                  value={presiones[i]}
                  className="border rounded-lg px-3 py-2"
                />
                <span className="text-gray-600">PSI</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center justify-center w-full mt-2">
            <button
              onClick={enviarConfiguracion}
              disabled={loadingConfig}
              className="w-full bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-400 disabled:opacity-50"
            >
              {loadingConfig ? "Enviando configuración..." : "Establecer configuración (tiempos y presiones)"}
            </button>
            
            {errorConfig && (
              <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg">
                {errorConfig}
              </div>
            )}
          </div>
          
          <hr className="border-black my-2" />
          <span className="text-gray-600 font-bold">Temperatura de Vulcanización</span>
          <div className="flex gap-4 items-center mt-2">
            <input
              type="number"
              min="0"
              max="190"
              placeholder="Temp Vulcanizado (°C)"
              value={tempVulcanizado}
              onChange={e => setTempVulcanizado(e.target.value)}
              className="border rounded-lg px-3 py-2 w-full"
            />
          </div>
        </div>
            
        

        <button
          onClick={enviarTemperaturaVulcanizado}
          disabled={loadingTempVulc}
          className="bg-green-500 text-white py-3 rounded-xl hover:bg-green-400 disabled:opacity-50"
        >
          {loadingTempVulc ? "Enviando temperatura..." : "Establecer temperatura vulcanizado"}
        </button>
        
        {errorTempVulc && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg">
            {errorTempVulc}
          </div>
        )}

        {/* ---------------- CENTRIFUGADORA ---------------- */}
        <div className="border-t pt-6 flex flex-col gap-4">
          <h2 className="text-2xl font-bold">
            Configuración de máquina centrifugadora
          </h2>

          <div className="flex gap-4 items-center">
            <input
              type="number"
              min="0"
              max="99"
              placeholder="Tiempo centrifugado (s)"
              value={tiempoCentrifugado}
              onChange={e => setTiempoCentrifugado(e.target.value)}
              className="border rounded-lg px-3 py-2 w-full"
            />
            <span className="text-gray-600">s</span>
          </div>

          <button
            onClick={enviarCentrifugado}
            disabled={loadingCentrifugado}
            className="bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-400 disabled:opacity-50"
          >
            {loadingCentrifugado ? "Enviando..." : "Establecer tiempo centrifugado"}
          </button>

          {errorCentrifugado && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg">
              {errorCentrifugado}
            </div>
          )}
        </div>
      </div>
    );
  }

  export default ConfiguracionPLC;