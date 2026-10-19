import { createClient } from "@supabase/supabase-js";
import ws from "ws";

const url = "https://zcliqmlgfcppudvpsinn.supabase.co";
const key = "sb_publishable_F9bRzQOtBfajhouiutrKXg_lsrU6o4p";

const supabase = createClient(url, key, {
  realtime: { transport: ws },
});

async function test() {
  console.log("Testing Supabase connection...");
  try {
    const { data, error } = await supabase.from("posts").select("id, title, status").limit(5);
    if (error) {
      console.log("Supabase responded with error (table might need creation):", error.message);
    } else {
      console.log("Supabase connection SUCCESSFUL! Posts count in DB:", data?.length);
      console.log("Data:", data);
    }
  } catch (err) {
    console.error("Exception:", err);
  }
}

test();
