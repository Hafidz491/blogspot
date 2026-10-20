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
  console.log("🛠️  SETUP BLOG ADMIN ACCOUNT (SAVED IN SUPABASE)");
  console.log("========================================================\n");

  const username = await question("Enter New Admin Username: ");
  if (!username.trim() || username.trim().length < 3) {
    console.error("❌ Username must be at least 3 characters!");
    rl.close();
    return;
  }

  const password = await question("Enter Admin Password: ");
  if (!password.trim() || password.trim().length < 6) {
    console.error("❌ Password must be at least 6 characters!");
    rl.close();
    return;
  }

  const email = await question("Enter Email (optional, press Enter to skip): ");

  console.log("\n🔒 Encrypting password with salted PBKDF2...");
  const hashedPassword = hashPassword(password.trim());

  console.log("📡 Saving to 'admin_users' table in Supabase database...");
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
    console.error("\n❌ Failed to save to Supabase:", error.message);
    console.log("💡 Ensure the 'admin_users' table exists by running: npm run db:setup");
  } else {
    console.log("\n🎉 SUCCESS!");
    console.log(`Admin account '${username.trim()}' has been saved to Supabase database!`);
    console.log("Your password is encrypted with secure salted hash.");
    console.log("Please log in at: http://localhost:3000/admin/login\n");
  }

  rl.close();
}

main();
