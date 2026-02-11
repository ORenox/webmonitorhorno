import { useState } from "react";

const API_BASE = "https://a49sbz67r1.execute-api.us-east-1.amazonaws.com";
const HEX_TAG = "V..4:0-1";
const HEX_TAG2 = "V..4:2-1";

function DecimalToHexCard() {
  const [decimalValue, setDecimalValue] = useState("");
  const [hexValue, setHexValue] = useState("0000");
  const [hexValue2, setHexValue2] = useState("0000");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const dec = parseInt(e.target.value, 10);
    setDecimalValue(e.target.value);

    if (isNaN(dec)) {
      setHexValue("0000");
      setHexValue2("0000");
      return;
    }

    // HEX 1 → valor original
    const hex1 = dec
      .toString(16)
      .toUpperCase()
      .padStart(4, "0");

    // HEX 2 → valor - 10
    const hex2 = Math.max(dec - 10, 0)
      .toString(16)
      .toUpperCase()
      .padStart(4, "0");

    setHexValue(hex1);
    setHexValue2(hex2);
  };

  const sendToApi = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetch(`${API_BASE}/shadow`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attribute: HEX_TAG,
            value: hexValue
          })
        }),
        fetch(`${API_BASE}/shadow`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attribute: HEX_TAG2,
            value: hexValue2
          })
        })
      ]);
    } catch (err) {
      console.error("Error enviando valores", err);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg">
      <div className="p-6 flex flex-col gap-4">
        <h2 className="text-xl font-semibold">
          Envío decimal → hexadecimal
        </h2>

        <input
          type="number"
          placeholder="Valor decimal"
          value={decimalValue}
          onChange={handleChange}
          className="border rounded-lg px-3 py-2"
        />

        <div className="text-lg">
          Hex (V..4:0-1):{" "}
          <span className="font-bold text-blue-600">{hexValue}</span>
        </div>

        <div className="text-lg">
          Hex − 10 (V..4:0-2):{" "}
          <span className="font-bold text-green-600">{hexValue2}</span>
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
