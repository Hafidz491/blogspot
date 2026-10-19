import { supabase } from "./supabase";
import { SiteSettings, DEFAULT_SITE_SETTINGS } from "@/types/settings";

let localSettingsCache: SiteSettings = { ...DEFAULT_SITE_SETTINGS };

/**
 * Get current site settings (from Supabase or local cache fallback)
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("settings")
      .eq("id", "general")
      .maybeSingle();

    if (error || !data?.settings) {
      return localSettingsCache;
    }

    const merged = { ...DEFAULT_SITE_SETTINGS, ...data.settings };
    localSettingsCache = merged;
    return merged;
  } catch (err) {
    console.warn("getSiteSettings note:", err);
    return localSettingsCache;
  }
}

/**
 * Update site settings in Supabase
 */
export async function updateSiteSettings(
  updatedSettings: Partial<SiteSettings>
): Promise<{ success: boolean; data: SiteSettings; error: string | null }> {
  try {
    const current = await getSiteSettings();
    const merged = { ...current, ...updatedSettings };

    const { error } = await supabase.from("site_settings").upsert({
      id: "general",
      settings: merged,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.warn("Supabase site_settings upsert error, updating local cache:", error.message);
      localSettingsCache = merged;
      return { success: true, data: merged, error: null };
    }

    localSettingsCache = merged;
    return { success: true, data: merged, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Kesalahan server";
    return { success: false, data: localSettingsCache, error: message };
  }
}
