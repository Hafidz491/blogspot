import { supabase } from "./supabase";
import crypto from "crypto";

export const ADMIN_COOKIE_NAME = "kindsight_admin_session";
const SECRET_KEY = process.env.AUTH_SECRET || "kindsight_secure_jwt_secret_salt_2026_random";

/**
 * Hash a password using PBKDF2 with a cryptographically secure random salt
 * Format: "salt:hash"
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify password against stored hash with timing attack protection
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !password) return false;

  try {
    // Check if hash is in standard "salt:hash" format
    if (storedHash.includes(":")) {
      const [salt, originalHash] = storedHash.split(":");
      if (!salt || !originalHash) return false;

      const hashToVerify = crypto
        .pbkdf2Sync(password, salt, 10000, 64, "sha512")
        .toString("hex");

      const bufA = Buffer.from(hashToVerify, "hex");
      const bufB = Buffer.from(originalHash, "hex");

      if (bufA.length !== bufB.length) return false;
      return crypto.timingSafeEqual(bufA, bufB);
    }

    // Direct string match fallback (if admin was created with plain text directly in Supabase)
    return password === storedHash;
  } catch {
    return false;
  }
}

export const SESSION_DURATION_SECONDS = 2 * 60 * 60; // 2 hours (7200 seconds)
export const SESSION_DURATION_MS = SESSION_DURATION_SECONDS * 1000; // 2 hours in ms (7,200,000 ms)

/**
 * Generate a signed session token with 2-hour expiration
 */
export function createSessionToken(username: string): string {
  const expiresAt = Date.now() + SESSION_DURATION_MS; // Exactly 2 hours
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
 * Decode and extract session payload if valid and not expired
 */
export function getSessionPayload(token: string | undefined | null): { username: string; expiresAt: number } | null {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [base64Payload, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", SECRET_KEY)
      .update(base64Payload)
      .digest("base64url");

    if (signature !== expectedSignature) return null;

    const payloadStr = Buffer.from(base64Payload, "base64url").toString("utf-8");
    const payload = JSON.parse(payloadStr);

    if (!payload.expiresAt || payload.expiresAt < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Check if at least one admin account exists in Supabase
 */
export async function hasAdminAccount(): Promise<boolean> {
  try {
    const { count, error } = await supabase
      .from("admin_users")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.warn("admin_users check error:", error.message);
      return false;
    }
    return (count ?? 0) > 0;
  } catch {
    return false;
  }
}

/**
 * Authenticate admin ONLY against the Supabase database
 * (No hardcoded username or password in the codebase)
 */
export async function authenticateAdmin(
  usernameInput: string,
  passwordInput: string
): Promise<{ success: boolean; error?: string }> {
  const username = usernameInput.trim();
  const password = passwordInput.trim();

  if (!username || !password) {
    return { success: false, error: "Username and password are required." };
  }

  try {
    const { data, error } = await supabase
      .from("admin_users")
      .select("id, username, password_hash, role")
      .eq("username", username)
      .maybeSingle();

    if (error) {
      console.error("Supabase query error:", error.message);
      return {
        success: false,
        error:
          "The 'admin_users' table was not found in database. Please run npm run db:setup first.",
      };
    }

    if (!data) {
      return { success: false, error: "Invalid username or password." };
    }

    const isValid = verifyPassword(password, data.password_hash);
    if (!isValid) {
      return { success: false, error: "Invalid username or password." };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error occurred";
    return { success: false, error: message };
  }
}

/**
 * Create initial admin user in Supabase (only allowed when 0 admin exists)
 */
export async function createFirstAdmin(
  usernameInput: string,
  passwordInput: string,
  emailInput?: string
): Promise<{ success: boolean; error?: string }> {
  const username = usernameInput.trim();
  const password = passwordInput.trim();
  const email = emailInput?.trim() || null;

  if (username.length < 3) {
    return { success: false, error: "Username must be at least 3 characters." };
  }

  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters." };
  }

  const exists = await hasAdminAccount();
  if (exists) {
    return {
      success: false,
      error: "Setup rejected: An administrator account already exists.",
    };
  }

  const hashedPassword = hashPassword(password);

  try {
    const { error } = await supabase.from("admin_users").insert({
      username,
      password_hash: hashedPassword,
      email,
      role: "admin",
    });

    if (error) {
      return {
        success: false,
        error: "Failed to save admin user: " + error.message,
      };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error occurred";
    return { success: false, error: message };
  }
}

/**
 * Update an existing admin's password in Supabase
 */
export async function updateAdminPassword(
  username: string,
  currentPasswordInput: string,
  newPasswordInput: string
): Promise<{ success: boolean; error?: string }> {
  const currentPassword = currentPasswordInput.trim();
  const newPassword = newPasswordInput.trim();

  if (!currentPassword || !newPassword) {
    return { success: false, error: "Current password and new password are required." };
  }

  if (newPassword.length < 6) {
    return { success: false, error: "New password must be at least 6 characters long." };
  }

  if (currentPassword === newPassword) {
    return { success: false, error: "New password cannot be identical to current password." };
  }

  try {
    const { data: user, error: fetchError } = await supabase
      .from("admin_users")
      .select("id, username, password_hash")
      .eq("username", username)
      .maybeSingle();

    if (fetchError || !user) {
      return { success: false, error: "Administrator account not found in database." };
    }

    const isValid = verifyPassword(currentPassword, user.password_hash);
    if (!isValid) {
      return { success: false, error: "Current password does not match our records." };
    }

    const newHashedPassword = hashPassword(newPassword);

    const { error: updateError } = await supabase
      .from("admin_users")
      .update({
        password_hash: newHashedPassword,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      return { success: false, error: "Failed to update password: " + updateError.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error occurred while updating password";
    return { success: false, error: message };
  }
}
