import { saveTag } from "../services/tagService";

function Example() {
  const handleSave = () => {
    saveTag("TEMP_HORNO", 850, "ALTA");
  };

  return (
    <button
      onClick={handleSave}
      className="bg-cyan-600 text-white px-4 py-2 rounded"
    >
      Guardar estado
    </button>
  );
}

export default Example;
