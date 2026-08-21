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
    if (!message.trim()) {
      setNotification({ type: 'error', text: 'Pesan tidak boleh kosong.' });
      return;
    }

    setIsSubmitting(true);
    setNotification(null);

    try {
      const complaintData = {
        uid: user?.id || "anonymous",
        name: user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || "Anonim (Guest)",
        email: user?.email || "anonymous@guest.local",
        photo: user?.user_metadata?.avatar_url || user?.user_metadata?.picture || "",
        type: type || "saran",
        message: message.trim(),
        createdAt: serverTimestamp(),
      };

      console.log("Submitting complaint to Firestore...", complaintData);
      const docRef = await addDoc(collection(db, "complaints"), complaintData);
      console.log("Complaint saved successfully with ID:", docRef.id);
      
      setNotification({ type: 'success', text: 'Pesan Anda berhasil dikirim! Terima kasih.' });
      setMessage("");
      setType("saran");
      
      setTimeout(() => {
        setNotification(null);
        setIsOpen(false);
      }, 3000);
    } catch (error: any) {
      console.error("Error submitting complaint to Firestore:", error);
      setNotification({ type: 'error', text: 'Gagal mengirim pesan: ' + (error?.message || 'Terjadi kesalahan.') });
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
