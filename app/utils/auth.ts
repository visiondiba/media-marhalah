export interface LicenseInfo {
  code: string;
  planName: string;
  activatedAt: string;
  isValid: boolean;
}

const VALID_KEYS: Record<string, string> = {
  "MARHALAH-2024": "VIP Pass",
  "PG-VIP-8888": "Producer Pass",
  "GOLDEN-SPECTACLE": "Lifetime Pass",
  "DEMO-PASS": "Standard Pass",
};

const STORAGE_KEY = "media_marhalah_license";

export function validateLicenseKey(code: string): { success: boolean; planName?: string; error?: string } {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) {
    return { success: false, error: "Kode lisensi tidak boleh kosong." };
  }

  if (VALID_KEYS[cleanCode]) {
    const licenseInfo: LicenseInfo = {
      code: cleanCode,
      planName: VALID_KEYS[cleanCode],
      activatedAt: new Date().toISOString(),
      isValid: true,
    };
    saveLicense(licenseInfo);
    return { success: true, planName: VALID_KEYS[cleanCode] };
  }

  return { success: false, error: "Kode lisensi tidak valid atau telah kadaluarsa." };
}

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
