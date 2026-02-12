import { supabase } from "./supabaseClient";

export async function saveTag(processData) {

  const { data, error } = await supabase
    .from("process_history")
    .insert([processData]);

  if (error) {
    console.error("Error guardando en process_history:", error);
    return null;
  }

  return data;
}