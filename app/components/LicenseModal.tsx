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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        
        <div className="modal-header">
          <div className="modal-badge">TIKET AKSES DIGITAL</div>
          <h2 className="modal-title">Aktivasi Kode Akses</h2>
          <p className="modal-sub">
            Masukkan kode tiket / lisensi eksklusif Panggung Gembira untuk membuka seluruh video penampilannya.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="input-group">
            <label htmlFor="license-code">Kode Lisensi / Access Key</label>
            <input
              id="license-code"
              type="text"
              placeholder="Contoh: MARHALAH-2024"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoFocus
            />
          </div>

          {error && <div className="modal-error">{error}</div>}

          <div className="demo-keys-hint">
            <span>💡 Kode Pengujian Pengembang:</span>
            <code>MARHALAH-2024</code> • <code>PG-VIP-8888</code>
          </div>

          <button type="submit" className="btn-primary btn-full" disabled={isLoading}>
            {isLoading ? "Verifikasi Kode..." : "Buka Akses Konten"}
          </button>
        </form>
      </div>
    </div>
  );
}
