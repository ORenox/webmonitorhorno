
function InfoConfigPLC({ shadow }){

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
    if (!raw) return "--";

    const decimal = parseInt(raw, 16);
    return isNaN(decimal) ? "--" : decimal;
    };

    return(
    <>
        {/* ===== INFORMACIÓN CONFIGURACIÓN ACTUAL ===== */}
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-6">

        {/* 🔵 Tiempos entre presiones */}
        <div>
            <h3 className="text-xl font-semibold mb-2">
            Tiempos entre presiones de Vulcanización
            </h3>
            <div className="grid md:grid-cols-6 gap-3">
            {tiemposTags.map((tag, index) => (
                <div key={tag} className="bg-slate-100 p-3 rounded-xl">
                <span>
                    T{index + 1}:
                </span>{" "}
                {getDecimalValue(tag)} min
                </div>
            ))}
            </div>
        </div>

        {/* 🔴 Presiones */}
        <div>
            <h3 className="text-xl font-semibold mb-2">
            Presiones para Vulcanización
            </h3>
            <div className="grid md:grid-cols-6 gap-3">
            {presionesOnTags.map((tag, index) => (
                <div key={tag} className="bg-slate-100 p-3 rounded-xl">
                <span >
                    P{index + 1}:
                </span>{" "}
                {getDecimalValue(tag)} PSI
                </div>
            ))}
            </div>
        </div>
        {/* 🔴 Temperatura de vulcanizado */}
        <div>
            <h3 className="text-xl font-semibold mb-2">
            Temperatura de vulcanizado
            </h3>
            <div className="bg-slate-100 p-3 rounded-xl w-fit">
            {getDecimalValue(tempVulcanizadoTag)} °C
            </div>
        </div>

        {/* 🟢 Tiempo centrifugación */}
        <div>
            <h3 className="text-xl font-semibold mb-2">
            Tiempo de centrifugación
            </h3>
            <div className="bg-slate-100 p-3 rounded-xl w-fit">
            {getDecimalValue(tiempoCentrifugadoTag)} s
            </div>
        </div>
        </div>
        </>
    );

}

export default InfoConfigPLC;