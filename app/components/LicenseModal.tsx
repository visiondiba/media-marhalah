import { useState } from "react";
import { validateLicenseKey } from "~/utils/auth";

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (planName: string) => void;
}

export function LicenseModal({ isOpen, onClose, onSuccess }: LicenseModalProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    setTimeout(() => {
      const result = validateLicenseKey(code);
      setIsLoading(false);

      if (result.success && result.planName) {
        onSuccess(result.planName);
        onClose();
      } else {
        setError(result.error || "Kode lisensi salah.");
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0A0804]/85 px-4 py-8 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-[28px] border border-primary/25 bg-[#16130A] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)] sm:p-8" onClick={(e) => e.stopPropagation()}>
        <button className="ml-auto flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 text-text-muted transition hover:border-primary/50 hover:text-text-primary" onClick={onClose} aria-label="Close modal">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>

        <div className="mt-2 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary-strong">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
              <path d="M12 3v18" />
              <path d="M3 12h18" />
            </svg>
            <span>Tiket Akses Digital</span>
          </div>
          <h2 className="text-2xl font-semibold uppercase tracking-[0.08em] text-primary-soft">Aktivasi Kode Akses</h2>
          <p className="mt-2 text-sm leading-6 text-text-muted">
            Masukkan kode tiket / lisensi eksklusif Panggung Gembira untuk membuka seluruh video penampilannya.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="license-code" className="mb-2 block text-sm font-medium uppercase tracking-[0.12em] text-[#D9C08F]">
              Kode Lisensi / Access Key
            </label>
            <input
              id="license-code"
              type="text"
              placeholder="Contoh: MARHALAH-2024"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoFocus
              className="w-full rounded-2xl border border-primary/20 bg-[#0A0804] px-4 py-3 text-sm text-text-primary outline-none ring-0 placeholder:text-text-muted focus:border-primary/60"
            />
          </div>

          {error && <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

          <div className="rounded-2xl border border-primary/15 bg-primary/10 px-4 py-3 text-sm text-text-secondary">
            <span className="font-semibold">Kode Pengujian Pengembang:</span>
            <span className="ml-2 rounded bg-[#0A0804]/60 px-2 py-1 font-mono text-xs text-primary-soft">MARHALAH-2024</span>
            <span className="mx-1">•</span>
            <span className="rounded bg-[#0A0804]/60 px-2 py-1 font-mono text-xs text-primary-soft">PG-VIP-8888</span>
          </div>

          <button type="submit" className="flex w-full items-center justify-center rounded-full bg-primary px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#0A0804] transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-70" disabled={isLoading}>
            {isLoading ? "Verifikasi Kode..." : "Buka Akses Konten"}
          </button>
        </form>
      </div>
    </div>
  );
}
