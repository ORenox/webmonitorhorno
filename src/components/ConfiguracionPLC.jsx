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

function toHex(value) {
  return Math.max(value, 0)
    .toString(16)
    .toUpperCase()
    .padStart(4, "0");
}

function ConfiguracionPLC() {
  const [loading, setLoading] = useState(false); 
  const [tiempos, setTiempos] = useState(Array(6).fill("")); 
  const [presiones, setPresiones] = useState(Array(6).fill("")); 
  const [error1, setError1] = useState("");
  const [error2, setError2] = useState("");
  const [tiempoCentrifugado, setTiempoCentrifugado] = useState("");
  const handleTiempoChange = (i, value) => 
    { const nuevos = [...tiempos];
      nuevos[i] = value;
      setTiempos(nuevos);
    }; 
  const handlePresionChange = (i, value) => {
     const nuevos = [...presiones];
      nuevos[i] = value;
      setPresiones(nuevos);
    };




  const enviarConfiguracion = async () => {
    setError1(""); 

    const tiemposNum = [];
    const presionesNum = [];

    let datosEnviar = {};

    // VALIDAR TIEMPOS
    for (let i = 0; i < tiempos.length; i++) {
      if (tiempos[i] === "") {
        tiemposNum.push(null);
        continue;
      }

      const val = Number(tiempos[i]);

      if (isNaN(val) || val < 0 || val > 99) {
        setError1(`El Tiempo ${i + 1} debe estar entre 0 y 99 minutos`);
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
        setError1(`La Presión ${i + 1} debe estar entre 0 y 3000 PSI`);
        return;
      }

      presionesNum.push(val);
    }

      // VALIDAR ORDEN CRECIENTE
    const presionesFiltradas = presionesNum.filter(p => p !== null);

    for (let i = 1; i < presionesFiltradas.length; i++) {
      if (presionesFiltradas[i] <= presionesFiltradas[i - 1]) {
        setError1("Las presiones deben ser estrictamente crecientes");
        return;
      }
    }

  console.log("Datos a enviar:", datosEnviar);





    setLoading(true);

    const payloads = [];

    // SOLO ENVÍA LOS QUE NO SON NULL
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
      setLoading(false);
      
    } catch (err) {
      console.error("Error enviando configuración", err);
      setLoading(false);
    }

    
  };

  const enviarCentrifugado = async () => {
      setError2("");

      if (tiempoCentrifugado === "") {
        setError2("Debe ingresar el tiempo de centrifugado");
        return;
      }

      const val = Number(tiempoCentrifugado);

      if (isNaN(val) || val < 0 || val > 99) {
        setError2("El tiempo de centrifugado debe estar entre 0 y 99 segundos");
        return;
      }

      setLoading(true);

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
        setLoading(false);

      } catch (err) {
        console.error("Error enviando centrifugado", err);
        setLoading(false);
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
      </div>
          
      <button
        onClick={enviarConfiguracion}
        disabled={loading}
        className=" bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50"
      >
        {
        loading ? "Enviando configuración..." : "Establecer configuración"}
      </button>
      {error1 && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg">
          {error1}
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
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Establecer tiempo centrifugado"}
          </button>
        </div>





      {error2 && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg">
          {error2}
        </div>
      )}
    </div>
  );
}

export default ConfiguracionPLC;