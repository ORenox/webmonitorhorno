function InfoConfigPLC({ shadow }) {
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

  const tiempoCentrifugadoTag = "V..4:44-1";
  const tempVulcanizadoTag = "V..4:0-1";

  const getDecimalValue = (key) => {
    const raw = shadow?.[key];
    if (!raw) return "---";
    const decimal = parseInt(raw, 16);
    return isNaN(decimal) ? "---" : decimal;
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl p-6 flex flex-col gap-6 border border-cyan-500/30 backdrop-blur-sm">
      
      {/* HEADER DEL PANEL */}
      <div className="flex items-center gap-3 border-b border-cyan-500/30 pb-4">
        <div className="w-2 h-8 bg-cyan-400 rounded-full animate-pulse"></div>
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
          CONFIGURACIÓN ACTIVA
        </h2>
        <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/30 ml-auto">
          ⚡ PARÁMETROS CARGADOS
        </span>
      </div>

      {/* 📊 TIEMPOS ENTRE PRESIONES */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-lg text-cyan-400">⏱️</span>
          <h3 className="text-lg font-semibold text-white tracking-wide">
            TIEMPOS ENTRE PRESIONES
          </h3>
          <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
            VULCANIZADORA
          </span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {tiemposTags.map((tag, index) => (
            <div
              key={tag}
              className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-4 rounded-xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 group"
            >
              <div className="flex flex-col">
                <span className="text-xs font-mono text-cyan-400/70 mb-1">
                  Tiempo {String(index + 1).padStart(2, '0')}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">
                    {getDecimalValue(tag)}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">min</span>
                </div>
                <div className="w-full h-0.5 bg-gradient-to-r from-cyan-500/0 via-cyan-500/50 to-cyan-500/0 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 mt-2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🔧 PRESIONES DE VULCANIZACIÓN */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-lg text-blue-400">⚙️</span>
          <h3 className="text-lg font-semibold text-white tracking-wide">
            PRESIONES DE VULCANIZACIÓN
          </h3>
          <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
            PSI
          </span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {presionesOnTags.map((tag, index) => (
            <div
              key={tag}
              className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-4 rounded-xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 group"
            >
              <div className="flex flex-col">
                <span className="text-xs font-mono text-blue-400/70 mb-1">
                  Presión {String(index + 1).padStart(2, '0')}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">
                    {getDecimalValue(tag)}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">PSI</span>
                </div>
                <div className="w-full h-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 mt-2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 📈 PARÁMETROS DE CONTROL - 2 COLUMNAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        
        {/* 🌡️ TEMPERATURA VULCANIZADO */}
        <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-xl border border-orange-500/30 p-5 hover:border-orange-500/50 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl text-orange-400">🌡️</span>
            <h3 className="text-md font-semibold text-white tracking-wide">
              TEMPERATURA VULCANIZADO
            </h3>
          </div>
          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white">
                {getDecimalValue(tempVulcanizadoTag)}
              </span>
              <span className="text-lg text-orange-400">°C</span>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-orange-500/30 flex items-center justify-center">
              <span className="text-2xl">🔥</span>
            </div>
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full mt-4 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
              style={{ width: `${Math.min((getDecimalValue(tempVulcanizadoTag) / 190) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* ⏲️ TIEMPO CENTRIFUGACIÓN */}
        <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-xl border border-purple-500/30 p-5 hover:border-purple-500/50 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl text-purple-400">⏲️</span>
            <h3 className="text-md font-semibold text-white tracking-wide">
              TIEMPO CENTRIFUGACIÓN
            </h3>
          </div>
          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white">
                {getDecimalValue(tiempoCentrifugadoTag)}
              </span>
              <span className="text-lg text-purple-400">s</span>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-purple-500/30 flex items-center justify-center">
              <span className="text-2xl">🔄</span>
            </div>
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full mt-4 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
              style={{ width: `${Math.min((getDecimalValue(tiempoCentrifugadoTag) / 99) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* FOOTER - TIMESTAMP */}
      <div className="flex justify-end items-center mt-2 pt-4 border-t border-slate-700/50">
        <span className="text-xs text-slate-500 font-mono flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          CONFIGURACIÓN EN MEMORIA PLC • {new Date().toLocaleTimeString('es-EC')}
        </span>
      </div>
    </div>
  );
}

export default InfoConfigPLC;