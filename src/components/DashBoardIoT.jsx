  import { useEffect, useState } from "react";
  import { Card, CardContent } from "./ui/Card";
  import { Button } from "./ui/Button";

  const API_BASE = "https://a49sbz67r1.execute-api.us-east-1.amazonaws.com"; // ← tu API Gateway

  const tagsConfig = [
    { key: "M..1:36-1", label: "Pistón" },
    { key: "M..1:37-1", label: "Motor" },
    { key: "M..1:39-1", label: "Gata" },
    { key: "M..1:38-1", label: "Resistencias" },
    { key: "I..1:10-1", label: "Emergencia", readOnly: true }
  ];

  export default function DashboardIoT() {
    const [shadow, setShadow] = useState({});
    const [loading, setLoading] = useState(false);

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

    useEffect(() => {
      fetchShadow();
      const interval = setInterval(fetchShadow, 4000);
      return () => clearInterval(interval);
    }, []);

    return (
      <div className="min-h-screen bg-slate-100 p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tagsConfig.map(tag => {
          const value = shadow[tag.key] ?? "--";
          const isOn = value === "01";
          return (
            <Card key={tag.key} className="rounded-2xl shadow-lg">
              <CardContent className="p-6 flex flex-col gap-4">
                <h2 className="text-xl font-semibold">{tag.label}</h2>
                <p className="text-lg">
                  Estado: <span className={isOn ? "text-green-600" : "text-red-600"}>
                    {isOn ? "ENCENDIDO" : "APAGADO"}
                  </span>
                </p>

                {!tag.readOnly && (
                  <div className="flex gap-2">
                    <Button disabled={loading} onClick={() => updateTag(tag.key, "01")}>Encender</Button>
                    <Button disabled={loading} onClick={() => updateTag(tag.key, "00")}>Apagar</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }
