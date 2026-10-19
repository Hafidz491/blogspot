import { supabase } from "./supabase";
import crypto from "crypto";

export const ADMIN_COOKIE_NAME = "kindsight_admin_session";
const SECRET_KEY = process.env.AUTH_SECRET || "kindsight_secret_super_key_2026_blog_admin_987654";

// Preset admin credentials
export const DEFAULT_ADMIN_USERNAME = "adminblog";
export const DEFAULT_ADMIN_PASSWORD = "blogadmin";

/**
 * Generate a signed session token
 */
export function createSessionToken(username: string): string {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const payload = JSON.stringify({ username, expiresAt });
  const base64Payload = Buffer.from(payload).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(base64Payload)
    .digest("base64url");
  return `${base64Payload}.${signature}`;
}

/**
 * Verify signed session token
 */
export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return false;

    const [base64Payload, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", SECRET_KEY)
      .update(base64Payload)
      .digest("base64url");

    if (signature !== expectedSignature) return false;

    const payloadStr = Buffer.from(base64Payload, "base64url").toString("utf-8");
    const payload = JSON.parse(payloadStr);

    if (!payload.expiresAt || payload.expiresAt < Date.now()) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Validate admin credentials against Supabase admin_users table (with fallback)
 */
export async function authenticateAdmin(
  usernameInput: string,
  passwordInput: string
): Promise<{ success: boolean; error?: string }> {
  const username = usernameInput.trim();
  const password = passwordInput.trim();

  // 1. Direct validation against default credentials
  if (username === DEFAULT_ADMIN_USERNAME && password === DEFAULT_ADMIN_PASSWORD) {
    return { success: true };
  }

  // 2. Database validation against Supabase `admin_users` table
  try {
    const { data, error } = await supabase
      .from("admin_users")
      .select("username, password_hash")
      .eq("username", username)
      .maybeSingle();

    if (!error && data) {
      if (data.password_hash === password) {
        return { success: true };
      }
    }
  } catch (err) {
    console.warn("Supabase admin_users check note:", err);
  }

  return { success: false, error: "Username atau password yang Anda masukkan salah." };
}
