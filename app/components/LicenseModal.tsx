import { useState, useRef, useEffect } from "react";
import { validateLicenseKeySupabase, saveLicense, type LicenseInfo } from "~/utils/auth";
import { useAuth } from "~/hooks/useAuth";

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (planName: string) => void;
  mode?: "activate" | "info";
  license?: LicenseInfo | null;
}

export function LicenseModal({ isOpen, onClose, onSuccess, mode = "activate", license }: LicenseModalProps) {
  const { user, isLoading: isAuthLoading, signInWithGoogle, sendOtpCode, verifyOtpCode } = useAuth();
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [currentMode, setCurrentMode] = useState(mode);
  const isMounted = useRef(true);

  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  if (!isOpen) return null;

  // Handle pengiriman kode lisensi
  const handleSubmitLicense = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!user) return;

    setError("");
    setIsLoading(true);

    try {
      const result = await validateLicenseKeySupabase(code, user.id);

      if (result.success && result.planName) {
        const licenseInfo: LicenseInfo = {
          code: code.trim().toUpperCase(),
          planName: result.planName,
          activatedAt: new Date().toISOString(),
          isValid: true,
        };
        saveLicense(licenseInfo);

        // Set success message with plan name
        setInfoMessage(`Lisensi berhasil diaktifkan: ${result.planName}`);

        // Call onSuccess callback
        onSuccess(result.planName);

        // Close modal after 2 seconds to show success message
        setTimeout(() => {
          if (isMounted.current) {
            onClose();
          }
        }, 2000);
      } else {
        setError(result.error || "Kode lisensi salah.");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat memvalidasi lisensi.");
      console.error(err);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  // Kirim OTP ke Email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setError("");
    setIsLoading(true);
    const result = await sendOtpCode(email.trim());
    setIsLoading(false);

    if (result.success) {
      setIsOtpSent(true);
      setInfoMessage("Kode OTP telah dikirim ke email Anda. Silakan periksa inbox/spam.");
    } else {
      setError(result.error || "Gagal mengirim OTP.");
    }
  };

  // Verifikasi OTP dari Email
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpToken.trim() || !email.trim()) return;

    setError("");
    setIsLoading(true);
    const result = await verifyOtpCode(email.trim(), otpToken.trim());
    setIsLoading(false);

    if (result.success) {
      setInfoMessage("Login berhasil!");
      setIsOtpSent(false);
      setShowEmailForm(false);
    } else {
      setError(result.error || "Kode OTP tidak valid.");
    }
  };

  const isInfoMode = currentMode === "info";
  const accountName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "Akun Google";
  const hasLicense = Boolean(license?.isValid);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[var(--color-background)]/85 px-4 py-8 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-[28px] border border-primary/25 bg-[var(--color-surface-strong)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)] sm:p-8" onClick={(e) => e.stopPropagation()}>
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
            <span>{isInfoMode ? "Info Lisensi" : "Tiket Akses Digital"}</span>
          </div>
          <h2 className="text-2xl font-semibold uppercase tracking-[0.08em] text-primary-soft">
            {!user ? "Login Diperlukan" : isInfoMode ? "Status Lisensi Anda" : "Aktivasi Kode Akses"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-text-muted">
            {!user
              ? "Silakan login untuk melihat status lisensi atau mengaktifkan kode akses Anda."
              : isInfoMode
                ? "Di sini Anda dapat melihat plan lisensi aktif dan detail akun."
                : "Masukkan kode tiket / lisensi eksklusif untuk membuka seluruh video penampilannya."}
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {infoMessage && (
          <div className="mt-4 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary-strong">
            {infoMessage}
          </div>
        )}

        {isAuthLoading ? (
          <div className="mt-8 flex justify-center py-6">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        ) : !user ? (
          <div className="mt-8 space-y-6">
            {/* Opsi Login Google */}
            {!showEmailForm && (
              <>
                <button
                  onClick={signInWithGoogle}
                  className="flex w-full items-center justify-center gap-3 rounded-full bg-white px-4 py-3.5 text-sm font-bold text-gray-900 transition hover:bg-gray-100 shadow-lg"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Lanjutkan dengan Google
                </button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-primary/10"></div>
                  <span className="flex-shrink mx-4 text-xs uppercase tracking-[0.16em] text-text-muted">atau</span>
                  <div className="flex-grow border-t border-primary/10"></div>
                </div>

                <button
                  onClick={() => setShowEmailForm(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-3.5 text-sm font-semibold uppercase tracking-[0.16em] text-text-primary transition hover:bg-primary/10"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 text-primary">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  Masuk dengan Kode Email (OTP)
                </button>
              </>
            )}

            {/* Opsi Login Email OTP */}
            {showEmailForm && (
              <div className="space-y-4">
                {!isOtpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="mb-2 block text-sm font-medium uppercase tracking-[0.12em] text-text-secondary">
                        Alamat Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        placeholder="nama@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-2xl border border-primary/20 bg-[var(--color-background)] px-4 py-3 text-sm text-text-primary outline-none focus:border-primary/60"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-background)] transition hover:bg-primary-strong disabled:opacity-75"
                    >
                      {isLoading ? "Mengirim kode..." : "Kirim Kode OTP"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div>
                      <label htmlFor="otp" className="mb-2 block text-sm font-medium uppercase tracking-[0.12em] text-text-secondary">
                        Masukkan 6-Digit Kode OTP
                      </label>
                      <input
                        id="otp"
                        type="text"
                        required
                        maxLength={8}
                        placeholder="XXXXXXX"
                        value={otpToken}
                        onChange={(e) => setOtpToken(e.target.value)}
                        className="w-full rounded-2xl border border-primary/20 bg-[var(--color-background)] px-4 py-3 text-center text-lg font-bold tracking-[0.5em] text-text-primary outline-none focus:border-primary/60"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-background)] transition hover:bg-primary-strong disabled:opacity-75"
                    >
                      {isLoading ? "Memverifikasi..." : "Verifikasi & Masuk"}
                    </button>
                  </form>
                )}
                <button
                  onClick={() => { setShowEmailForm(false); setIsOtpSent(false); setError(""); setInfoMessage(""); }}
                  className="w-full text-center text-xs font-semibold uppercase tracking-[0.12em] text-text-muted hover:text-text-primary"
                >
                  Kembali ke Opsi Lain
                </button>
              </div>
            )}
          </div>
        ) : isInfoMode ? (
          <div className="mt-6 space-y-4 rounded-3xl border border-primary/20 bg-[#0A0804]/80 p-5 text-text-primary">
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-soft">Akun</div>
              <div className="rounded-3xl bg-[#14100B]/80 p-4 text-sm">
                <div className="font-semibold text-text-primary">{accountName}</div>
                <div className="mt-1 text-xs text-text-muted">{user.email}</div>
              </div>
            </div>

            {hasLicense ? (
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-soft">Plan Lisensi</div>
                <div className="rounded-3xl bg-[#14100B]/80 p-4 text-sm">
                  <div className="font-semibold text-primary-strong">{license?.planName}</div>
                  <div className="mt-1 text-xs text-text-muted">Kode: {license?.code}</div>
                  <div className="mt-1 text-xs text-text-muted">Aktif sejak: {new Date(license?.activatedAt ?? Date.now()).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="rounded-3xl border border-primary/15 bg-[#14100B]/80 p-4 text-sm text-text-muted">
                  <p className="font-semibold text-text-primary">Belum ada lisensi aktif.</p>
                  <p className="mt-2">Silakan aktifkan lisensi untuk mengakses konten penuh.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentMode("activate");
                    setIsOtpSent(false);
                    setShowEmailForm(false);
                    setCode("");
                    setError("");
                    setInfoMessage("");
                  }}
                  className="w-full rounded-full border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-primary-strong transition hover:bg-primary/15"
                >
                  Aktivasi Lisensi
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Input Lisensi (jika sudah login) */
          <form onSubmit={handleSubmitLicense} className="mt-6 space-y-4">
            <div>
              <label htmlFor="license-code" className="mb-2 block text-sm font-medium uppercase tracking-[0.12em] text-text-secondary">
                Kode Lisensi / Access Key
              </label>
              <input
                id="license-code"
                type="text"
                placeholder="Contoh: MARHALAH-2024"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoFocus
                className="w-full rounded-2xl border border-primary/20 bg-[var(--color-background)] px-4 py-3 text-sm text-text-primary outline-none ring-0 placeholder:text-text-muted focus:border-primary/60"
              />
            </div>

            <div className="rounded-2xl border border-primary/15 bg-primary/10 px-4 py-3 text-xs text-text-secondary flex items-center justify-between">
              <div>
                <span className="font-semibold block">Akun terhubung:</span>
                <span className="text-primary-soft">{user.email}</span>
              </div>
            </div>

            <button type="submit" className="flex w-full items-center justify-center rounded-full bg-primary px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-background)] transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-70" disabled={isLoading || !code.trim()}>
              {isLoading ? "Verifikasi Kode..." : "Buka Akses Konten"}
            </button>
          </form>
        )}

        {/* Success Message */}
        {infoMessage && (
          <div className="mt-6 rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300 text-center">
            {infoMessage}
          </div>
        )}
      </div>
    </div>
  );
}
