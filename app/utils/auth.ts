import { supabase } from "./supabase";

export interface LicenseInfo {
  code: string;
  planName: string;
  activatedAt: string;
  isValid: boolean;
}

const STORAGE_KEY = "media_marhalah_license";

// Check license against Supabase
export async function validateLicenseKeySupabase(
  code: string,
  userId: string
): Promise<{ success: boolean; planName?: string; error?: string }> {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) {
    return { success: false, error: "Kode lisensi tidak boleh kosong." };
  }

  try {
    // 1. Cek apakah kode ada di database
    const { data: license, error } = await supabase
      .from("licenses")
      .select("*")
      .eq("code", cleanCode)
      .single();

    if (error || !license) {
      // Fallback ke local keys jika diperlukan untuk testing (bisa dihapus nanti)
      if (cleanCode === "MARHALAH-2024" || cleanCode === "PG-VIP-8888") {
        return { success: true, planName: "VIP Pass" };
      }
      return { success: false, error: "Kode lisensi tidak valid atau tidak ditemukan." };
    }

    // 2. Cek kepemilikan
    if (!license.user_id) {
      // Kode belum digunakan, klaim untuk user ini
      const { error: updateError } = await supabase
        .from("licenses")
        .update({ user_id: userId, activated_at: new Date().toISOString() })
        .eq("id", license.id);

      if (updateError) {
        return { success: false, error: "Gagal mengklaim kode lisensi." };
      }

      return { success: true, planName: license.plan_name || "Standard Pass" };
    } else if (license.user_id === userId) {
      // Kode sudah diklaim oleh user ini sebelumnya
      return { success: true, planName: license.plan_name || "Standard Pass" };
    } else {
      // Kode sudah diklaim orang lain
      return { success: false, error: "Kode lisensi ini sudah digunakan oleh akun lain." };
    }
  } catch (err) {
    return { success: false, error: "Terjadi kesalahan sistem. Coba lagi." };
  }
}

// Fetch user's existing license from Supabase (if they login on a new device)
export async function fetchUserLicense(userId: string): Promise<LicenseInfo | null> {
  try {
    const { data, error } = await supabase
      .from("licenses")
      .select("*")
      .eq("user_id", userId)
      .order("activated_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;

    return {
      code: data.code,
      planName: data.plan_name || "Standard Pass",
      activatedAt: data.activated_at || new Date().toISOString(),
      isValid: true,
    };
  } catch {
    return null;
  }
}

// Local storage helpers (caching)
export function saveLicense(license: LicenseInfo): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(license));
  }
}

export function getStoredLicense(): LicenseInfo | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function clearLicense(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}
