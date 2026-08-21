import { useState } from "react";
import { useAuth } from "~/hooks/useAuth";
import { db } from "~/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export function ComplaintForm() {
  const { user, signInWithGoogle, isLoading: authLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  const [type, setType] = useState("saran");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!message.trim()) return;

    setIsSubmitting(true);
    setNotification(null);

    try {
      await addDoc(collection(db, "complaints"), {
        uid: user.id,
        name: user.user_metadata?.full_name || user.email,
        email: user.email,
        photo: user.user_metadata?.avatar_url || "",
        type,
        message,
        createdAt: serverTimestamp(),
      });
      
      setNotification({ type: 'success', text: 'Pesan Anda berhasil dikirim! Terima kasih.' });
      setMessage("");
      setType("saran");
      
      setTimeout(() => {
        setNotification(null);
        setIsOpen(false);
      }, 3000);
    } catch (error: any) {
      console.error("Error submitting complaint:", error);
      setNotification({ type: 'error', text: 'Gagal mengirim pesan: ' + error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[999] bg-primary text-black font-semibold p-4 rounded-full shadow-xl hover:scale-105 transition-transform"
        aria-label="Saran & Komplain"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[999] w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-5 text-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Saran & Komplain</h3>
            <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          {authLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : !user ? (
            <div className="text-center py-4">
              <p className="text-sm text-zinc-400 mb-4">Silakan login terlebih dahulu untuk mengirim saran, kritik, atau komplain.</p>
              <button
                onClick={signInWithGoogle}
                className="w-full bg-white text-black font-semibold py-2 px-4 rounded hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Login dengan Google
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {notification && (
                <div className={`p-2 text-sm rounded ${notification.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {notification.text}
                </div>
              )}
              
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Jenis</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-primary"
                  disabled={isSubmitting}
                >
                  <option value="saran">Saran</option>
                  <option value="kritik">Kritik</option>
                  <option value="komplain">Komplain</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Pesan</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ketik pesan Anda di sini..."
                  rows={4}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-primary resize-none"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="w-full bg-primary text-black font-bold py-2 rounded hover:opacity-90 disabled:opacity-50 transition-opacity flex justify-center items-center gap-2"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                ) : (
                  "Kirim"
                )}
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
