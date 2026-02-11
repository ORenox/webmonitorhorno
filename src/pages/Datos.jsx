import { supabase } from "../services/supabaseClient";
import { useEffect, useState } from "react";
import Example from "../components/Example";

function Datos(){
    const [history, setHistory] = useState([]);

    // ================= SUPABASE =================
      const fetchHistory = async () => {
        const { data, error } = await supabase
          .from("tags")      // 👈 nombre de tu tabla
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20);
    
        if (error) {
        console.error("Error cargando historial:", error);
        } else {
        setHistory(data);
    }
      };
    
      useEffect(() => {
        fetchHistory();
      }, []);
    

    return <>
    {/* ===== HISTORIAL ===== */}
    <div className="mb-2 bg-slate-100 p-6 flex flex-col gap-8">
        <h1 className="text-3xl font-bold text-center">
        Tabla de datos históricos de uso de máquinas
      </h1>
    </div>
      <div className="bg-white rounded-2xl shadow-lg">
        <div className="p-6 flex flex-col gap-4">
          <h2 className="text-xl font-semibold mb-4">Historial de Datos</h2>

          <div className="overflow-auto">
            <table className="w-full text-sm border">
              <thead className="bg-slate-200">
                <tr>
                  <th className="p-2 border">Tag</th>
                  <th className="p-2 border">Valor</th>
                  <th className="p-2 border">Estado</th>
                  <th className="p-2 border">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => (
                  <tr key={row.id} className="text-center">
                    <td className="border p-2">{row.tag}</td>
                    <td className="border p-2">{row.value}</td>
                    <td className="border p-2">{row.status}</td>
                    <td className="border p-2">
                      {new Date(row.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      <Example/>
    
    
    </>

}

export default Datos;