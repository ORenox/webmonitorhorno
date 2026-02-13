import { supabase } from "../services/supabaseClient";
import { useEffect, useState } from "react";

function Datos(){
    const [history, setHistory] = useState([]);
    const [eventosIndustriales, setEventosIndustriales] = useState([]);

    // ================= SUPABASE - TABLA 1 (process_history) =================
    const fetchHistory = async () => {
        const { data, error } = await supabase
            .from("process_history")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(20);

        if (error) {
            console.error("Error cargando historial:", error);
        } else {
            setHistory(data);
        }
    };

    // ================= SUPABASE - TABLA 2 (eventos_industriales) =================
    const fetchEventosIndustriales = async () => {
        const { data, error } = await supabase
            .from("eventos_industriales")
            .select("*")
            .order("timestamp", { ascending: false })
            .limit(30);

        if (error) {
            console.error("Error cargando eventos industriales:", error);
        } else {
            setEventosIndustriales(data);
        }
    };

    useEffect(() => {
        fetchHistory();
        fetchEventosIndustriales();
        
        // Opcional: Refrescar cada 30 segundos
        const interval = setInterval(() => {
            fetchHistory();
            fetchEventosIndustriales();
        }, 30000);
        
        return () => clearInterval(interval);
    }, []);

    // Función para formatear valores según el tipo
    const formatearValor = (row) => {
        if (row.tipo === 'lectura') {
            return `${row.valor} ${row.unidad || ''}`;
        } else if (row.tipo === 'evento') {
            return row.comentario;
        }
        return '-';
    };

    return (
        <>
            {/* ===== TABLA 1: HISTORIAL DE PROCESOS (EXISTENTE) ===== */}
            <div className="mb-2 bg-slate-100 p-6 flex flex-col gap-8">
                <h1 className="text-3xl font-bold text-center">
                    Tabla de datos históricos de uso de máquinas
                </h1>
            </div>
            <div className="bg-white rounded-2xl shadow-lg mb-8">
                <div className="p-6 flex flex-col gap-4">
                    <h2 className="text-xl font-semibold mb-4">Historial de Procesos</h2>
                    <div className="overflow-auto">
                        <table className="w-full text-sm border">
                            <thead className="bg-slate-200">
                                <tr>
                                    <th className="p-2 border">Modo</th>
                                    <th className="p-2 border">Máquina</th>
                                    <th className="p-2 border">Presión (PSI)</th>
                                    <th className="p-2 border">Temperatura (°C)</th>
                                    <th className="p-2 border">Tiempo Vulcanización (s)</th>
                                    <th className="p-2 border">Tiempo Centrífuga (s)</th>
                                    <th className="p-2 border">Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((row) => (
                                    <tr key={row.id} className="text-center hover:bg-slate-50">
                                        <td className="border p-2">{row.mode}</td>
                                        <td className="border p-2">{row.machine}</td>
                                        <td className="border p-2">{row.pressure}</td>
                                        <td className="border p-2">{row.temperature}</td>
                                        <td className="border p-2">{row.tiempo_vulcanizacion}</td>
                                        <td className="border p-2">{row.tiempo_centrifuga}</td>
                                        <td className="border p-2">
                                            {new Date(row.created_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                                {history.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="text-center p-4 text-gray-500">
                                            No hay datos disponibles
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ===== TABLA 2: EVENTOS INDUSTRIALES (NUEVA) ===== */}
            <div className="mb-2 bg-slate-100 p-6 flex flex-col gap-8">
                <h1 className="text-3xl font-bold text-center">
                    Monitoreo en Tiempo Real - PLC
                </h1>
            </div>
            <div className="bg-white rounded-2xl shadow-lg">
                <div className="p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Eventos y Lecturas del PLC</h2>
                    </div>
                    
                    <div className="overflow-auto">
                        <table className="w-full text-sm border">
                            <thead className="bg-slate-200">
                                <tr>
                                    <th className="p-2 border">Tipo</th>
                                    <th className="p-2 border">Señal / Sensor</th>
                                    <th className="p-2 border">Descripción</th>
                                    <th className="p-2 border">Valor / Evento</th>
                                    <th className="p-2 border">Máquina</th>
                                    <th className="p-2 border">Modo</th>
                                    <th className="p-2 border">Fecha y Hora</th>
                                </tr>
                            </thead>
                            <tbody>
                                {eventosIndustriales.map((row) => (
                                    <tr key={row.id} className={`text-center hover:bg-slate-50 ${
                                        row.tipo === 'evento' ? 'bg-blue-50' : 'bg-green-50'
                                    }`}>
                                        <td className="border p-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium
                                                ${row.tipo === 'evento' 
                                                    ? 'bg-blue-200 text-blue-800' 
                                                    : 'bg-green-200 text-green-800'
                                                }`}>
                                                {row.tipo === 'evento' ? '⚡ Evento' : '📊 Lectura'}
                                            </span>
                                        </td>
                                        <td className="border p-2 font-mono text-xs">
                                            {row.signal_id || row.sensor || '-'}
                                        </td>
                                        <td className="border p-2">
                                            {row.sensor || row.maquina || '-'}
                                        </td>
                                        <td className="border p-2 font-medium">
                                            {row.tipo === 'lectura' 
                                                ? `${row.valor} ${row.unidad || ''}`
                                                : row.comentario
                                            }
                                        </td>
                                        <td className="border p-2">
                                          {row.maquina || 
                                              (row.sensor?.includes('vulcanizadora') ? 'vulcanizadora' : 
                                              row.sensor?.includes('centrifugo') ? 'horno centrifugo' : '-')}
                                      </td>
                                        <td className="border p-2">
                                            {row.modo_operacion || '-'}
                                        </td>
                                        <td className="border p-2 text-xs">
                                            {new Date(row.timestamp || row.created_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                                {eventosIndustriales.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="text-center p-4 text-gray-500">
                                            No hay eventos o lecturas disponibles
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Leyenda de colores */}
                    <div className="flex gap-4 mt-4 text-xs">
                        <div className="flex items-center gap-1">
                            <span className="w-3 h-3 bg-blue-200 rounded-full"></span>
                            <span>Eventos digitales</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="w-3 h-3 bg-green-200 rounded-full"></span>
                            <span>Lecturas analógicas</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Datos;
