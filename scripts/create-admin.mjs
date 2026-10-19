import { createClient } from "@supabase/supabase-js";
import readline from "readline";
import crypto from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zcliqmlgfcppudvpsinn.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_F9bRzQOtBfajhouiutrKXg_lsrU6o4p";

const supabase = createClient(supabaseUrl, supabaseKey);

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log("\n========================================================");
  console.log("🛠️  SETUP AKUN ADMIN BLOG (DISIMPAN DI SUPABASE)");
  console.log("========================================================\n");

  const username = await question("Masukkan Username Admin Baru: ");
  if (!username.trim() || username.trim().length < 3) {
    console.error("❌ Username minimal 3 karakter!");
    rl.close();
    return;
  }

  const password = await question("Masukkan Password Admin: ");
  if (!password.trim() || password.trim().length < 6) {
    console.error("❌ Password minimal 6 karakter!");
    rl.close();
    return;
  }

  const email = await question("Masukkan Email (opsional, tekan enter untuk lewati): ");

  console.log("\n🔒 Mengenkripsi password dengan salted PBKDF2...");
  const hashedPassword = hashPassword(password.trim());

  console.log("📡 Menyimpan ke tabel 'admin_users' di database Supabase...");
  const { data, error } = await supabase
    .from("admin_users")
    .insert({
      username: username.trim(),
      password_hash: hashedPassword,
      email: email.trim() || null,
      role: "admin",
    })
    .select()
    .single();

  if (error) {
    console.error("\n❌ Gagal menyimpan ke Supabase:", error.message);
    console.log("💡 Pastikan tabel 'admin_users' sudah dibuat dengan menjalankan supabase/schema.sql di SQL Editor Supabase.");
  } else {
    console.log("\n🎉 BERHASIL!");
    console.log(`Akun admin '${username.trim()}' berhasil disimpan ke database Supabase!`);
    console.log("Password Anda tersimpan dalam bentuk enkripsi hash yang aman.");
    console.log("Silakan login di: http://localhost:3000/admin/login\n");
  }

  rl.close();
}

main();
