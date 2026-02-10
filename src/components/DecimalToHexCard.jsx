import { useState } from "react";

const API_BASE = "https://a49sbz67r1.execute-api.us-east-1.amazonaws.com";
const HEX_TAG = "V..4:0-1";

function DecimalToHexCard() {
  const [decimalValue, setDecimalValue] = useState("");
  const [hexValue, setHexValue] = useState("0000");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const dec = e.target.value;
    setDecimalValue(dec);

    if (dec === "") {
      setHexValue("0000");
      return;
    }

    const hex = parseInt(dec, 10)
      .toString(16)
      .toUpperCase()
      .padStart(4, "0");

    setHexValue(hex);
  };

  const sendToApi = async () => {
    setLoading(true);
    try {
      await fetch(`${API_BASE}/shadow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attribute: HEX_TAG,
          value: hexValue
        })
      });
    } catch (err) {
      console.error("Error enviando valor", err);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg">
      <div className="p-6 flex flex-col gap-4">
        <h2 className="text-xl font-semibold">
          Enviar valor a V..4:0-1
        </h2>

        <input
          type="number"
          placeholder="Valor decimal"
          value={decimalValue}
          onChange={handleChange}
          className="border rounded-lg px-3 py-2"
        />

        <div className="text-lg">
          Hexadecimal:{" "}
          <span className="font-bold text-blue-600">
            {hexValue}
          </span>
        </div>

        <button
          onClick={sendToApi}
          disabled={loading}
          className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Enviar a PLC"}
        </button>
      </div>
    </div>
  );
}

export default DecimalToHexCard;