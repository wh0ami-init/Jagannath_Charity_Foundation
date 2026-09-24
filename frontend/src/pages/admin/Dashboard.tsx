import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { getToken, clearToken, replaceImage, apiUrl, API_URL } from "../../lib/api";
import { useImages } from "../../lib/ImagesContext";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { images, refresh, loading } = useImages();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/admin/login");
      return;
    }
    fetch(apiUrl("/api/auth/me"), { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error("expired");
        setCheckingAuth(false);
      })
      .catch(() => {
        clearToken();
        navigate("/admin/login");
      });
  }, [navigate]);

  function handleLogout() {
    clearToken();
    navigate("/admin/login");
  }

  async function handleFileChange(slotKey: string, file: File | undefined) {
    if (!file) return;
    setUploadingSlot(slotKey);
    setMessage(null);
    try {
      await replaceImage(slotKey, file);
      await refresh();
      setMessage({ type: "ok", text: `Image updated for "${slotKey}". It's live on the site now.` });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Upload failed" });
    } finally {
      setUploadingSlot(null);
    }
  }

  if (checkingAuth || loading) {
    return <div className="min-h-screen flex items-center justify-center text-navy-900/50">Loading…</div>;
  }

  const grouped: Record<string, typeof images[string][]> = {};
  for (const slot of Object.values(images)) {
    grouped[slot.page] = grouped[slot.page] || [];
    grouped[slot.page].push(slot);
  }
  const pageOrder = ["Global", "Home", "About", "Work", "Impact", "Team", "Gallery"];
  const orderedPages = Object.keys(grouped).sort(
    (a, b) => pageOrder.indexOf(a) - pageOrder.indexOf(b)
  );

  return (
    <div className="min-h-screen bg-navy-50 bg-neutral-50">
      <header className="bg-navy-950 text-white">
        <div className="wrap flex items-center justify-between py-4">
          <div>
            <h1 className="font-serif-heading font-bold">Image manager</h1>
            <p className="text-xs text-white/60">Jagannath Foundation · Admin</p>
          </div>
          <div className="flex gap-3 items-center">
            <a href="/" target="_blank" rel="noreferrer" className="text-sm text-white/70 hover:text-white">
              View site ↗
            </a>
            <button onClick={handleLogout} className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full">
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="wrap py-4">
        {message && (
          <div
            className={`rounded-lg px-4 py-3 text-sm mb-4 ${
              message.type === "ok" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}
        <p className="text-sm text-navy-900/60 mb-6">
          Click "Replace image" on any photo below to upload a new one. It updates on the live
          site immediately — no code changes, no redeploy.
        </p>

        {orderedPages.map((page) => (
          <section key={page} className="mb-10">
            <h2 className="text-lg font-serif-heading font-bold text-navy-950 mb-4">{page}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {grouped[page]
                .sort((a, b) => a.label.localeCompare(b.label))
                .map((slot) => (
                  <div key={slot.slot_key} className="bg-white rounded-xl border border-navy-900/10 overflow-hidden">
                    <img
                      src={`${API_URL}${slot.url}`}
                      alt={slot.alt_text}
                      className="w-full h-36 object-cover bg-navy-900/5"
                    />
                    <div className="p-3">
                      <p className="text-sm font-medium text-navy-950 truncate" title={slot.label}>
                        {slot.label}
                      </p>
                      <p className="text-xs text-navy-900/40 mb-2">{slot.slot_key}</p>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        ref={(el) => (fileInputs.current[slot.slot_key] = el)}
                        onChange={(e) => handleFileChange(slot.slot_key, e.target.files?.[0])}
                      />
                      <button
                        onClick={() => fileInputs.current[slot.slot_key]?.click()}
                        disabled={uploadingSlot === slot.slot_key}
                        className="w-full text-xs font-semibold bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white py-1.5 rounded-full"
                      >
                        {uploadingSlot === slot.slot_key ? "Uploading…" : "Replace image"}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
