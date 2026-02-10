  import { useEffect, useState } from "react";
  import { Card, CardContent } from "./ui/Card";
  import { Button } from "./ui/Button";

  const API_BASE = "https://a49sbz67r1.execute-api.us-east-1.amazonaws.com"; // ← tu API Gateway

 const tagsConfig = [
  { key: "M..1:36-1", label: "Pistón", sourceKey: "Q..1:10-1" },
  { key: "M..1:37-1", label: "Motor", sourceKey: "Q..1:8-1" },
  { key: "M..1:39-1", label: "Gata", sourceKey: "Q..1:12-1" },
  { key: "M..1:38-1", label: "Resistencias", sourceKey: "Q..1:9-1" },

  { key: "Q..1:8-1", label: "Motor Centrifugadora", readOnly: true, noshowTag: true },
  { key: "Q..1:10-1", label: "Piston centrifugadora", readOnly: true, noshowTag: true },
  { key: "Q..1:9-1", label: "Resistencias vulcanizadora", readOnly: true, noshowTag: true },
  { key: "Q..1:12-1", label: "motor Vulcanizadora", readOnly: true, noshowTag: true },

  { key: "I..1:10-1", label: "Emergencia", readOnly: true }


];


const MODE_TAG = "Q..1:5-1";
const MACHINE_TAG = "Q..1:4-1";

  export default function TagsForTags() {
    const [shadow, setShadow] = useState({});
    const [loadingTags, setLoadingTags] = useState({});

    const fetchShadow = async () => {
      try {
        const res = await fetch(`${API_BASE}/shadow`);
        const data = await res.json();
        setShadow(data);
      } catch (err) {
        console.error("Error obteniendo shadow", err);
      }
    };

    const updateTag = async (key, value) => {
      setLoading(true);
      try {
        await fetch(`${API_BASE}/shadow`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attribute: key, value })
        });
        fetchShadow();
      } catch (err) {
        console.error("Error actualizando", err);
      }
      setLoading(false);
    };


    const pulseTag = async (key, duration = 2000) => {
      // marcar SOLO este tag como activo
      setLoadingTags(prev => ({ ...prev, [key]: true }));

      try {
        // Encender
        await fetch(`${API_BASE}/shadow`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attribute: key, value: "01" })
        });

        // Apagar luego de 2s
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


    useEffect(() => {
      fetchShadow();
      const interval = setInterval(fetchShadow, 4000);
      return () => clearInterval(interval);
    }, []);

    const isModeEnabled = shadow[MODE_TAG] === "01";

  
  return (

    <> 
    {!isModeEnabled && (
        <p className="text-sm text-red-500">
          Modo Manual Deshabilitado
        </p>
      )}

      <div className="min-h-screen bg-slate-100 p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      
      
      {tagsConfig
        .filter(tag => !tag.noshowTag)
        .map(tag => {
          const realKey = tag.sourceKey || tag.key;
          const value = shadow[realKey] ?? "--";
          const isOn = value === "01";

          return (
            <Card key={tag.key} className="rounded-2xl shadow-lg">
              <CardContent className="p-6 flex flex-col gap-4">
                <h2 className="text-xl font-semibold">{tag.label}</h2>
                <p className="text-lg">
                  Estado:{" "}
                  <span className={isOn ? "text-green-600" : "text-grey-600"}>
                    {isOn ? "ENCENDIDO" : "APAGADO"}
                  </span>
                </p>

                {!tag.readOnly && (
                  <div className="flex gap-2">
                    <Button disabled={!isModeEnabled || loadingTags[tag.key]} onClick={() => pulseTag(tag.key)}>
                      {loadingTags[tag.key] ? "Encendiendo..." : "Encender"}
                    </Button>
                    <Button disabled={!isModeEnabled} onClick={() => updateTag(tag.key, "00")}>
                      Apagar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
    </div>
       </>
    
  );

  }
