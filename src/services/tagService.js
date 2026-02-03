import { supabase } from "./supabaseClient";

export async function saveTag(tagName, value, status) {
  const { data, error } = await supabase
    .from("tags")
    .insert([
      {
        tag_name: tagName,
        value: value,
        status: status,
      },
    ]);

  if (error) {
    console.error("Error guardando tag:", error);
  }

  return data;
}
