import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { apiUrl, API_URL, clearToken, deleteSubmission, fetchContent, fetchSubmissions, FormSubmission, getToken, replaceImage, SiteContent, updateContent } from "../../lib/api";
import { useImages } from "../../lib/ImagesContext";
import Reveal from "../../components/Reveal";

type Status = { tone: "success" | "error"; message: string } | null;

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { images, refresh, loading } = useImages();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [section, setSection] = useState<"images" | "text" | "inbox">("images");
  const [inboxFilter, setInboxFilter] = useState<"all" | FormSubmission["kind"]>("all");
  const [uploading, setUploading] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [content, setContent] = useState<SiteContent>({});
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    const token = getToken();
    if (!token) { navigate("/admin/login"); return; }
    Promise.all([
      fetch(apiUrl("/api/auth/me"), { headers: { Authorization: `Bearer ${token}` } }),
      fetchContent(),
      fetchSubmissions(),
    ]).then(async ([auth, text, inbox]) => {
      if (!auth.ok) throw new Error("Session expired");
      setContent(text);
      setSubmissions(inbox);
      setDrafts(Object.fromEntries(Object.entries(text).map(([key, field]) => [key, field.value])));
      setCheckingAuth(false);
    }).catch(() => { clearToken(); navigate("/admin/login"); });
  }, [navigate]);

  function logout() { clearToken(); navigate("/admin/login"); }

  async function upload(slotKey: string, file?: File) {
    if (!file) return;
    setStatus(null);
    setUploading(slotKey);
    try {
      await replaceImage(slotKey, file);
      await refresh();
      setStatus({ tone: "success", message: "Image updated. The new photo is now live on the website." });
    } catch (error) {
      setStatus({ tone: "error", message: error instanceof Error ? error.message : "The image could not be uploaded." });
    } finally {
      setUploading(null);
    }
  }

  async function saveText(key: string) {
    setSaving(key);
    setStatus(null);
    try {
      await updateContent(key, drafts[key] || "");
      setContent((current) => ({ ...current, [key]: { ...current[key], value: drafts[key] || "" } }));
      window.dispatchEvent(new Event("site-content-updated"));
      setStatus({ tone: "success", message: `Saved “${content[key].label}”. The public website has been updated.` });
    } catch (error) {
      setStatus({ tone: "error", message: error instanceof Error ? error.message : "This change could not be saved." });
    } finally {
      setSaving(null);
    }
  }

  async function removeSubmission(item: FormSubmission) {
    if (!window.confirm(`Delete the ${item.kind} submission from ${item.name || item.email}?`)) return;
    try {
      await deleteSubmission(item.id);
      setSubmissions((current) => current.filter((row) => row.id !== item.id));
      setStatus({ tone: "success", message: "Submission deleted." });
    } catch (error) {
      setStatus({ tone: "error", message: error instanceof Error ? error.message : "Could not delete this submission." });
    }
  }

  function exportSubmissions() {
    const columns: (keyof FormSubmission)[] = ["id", "kind", "name", "email", "phone", "subject", "message", "district", "skill", "amount", "cause", "created_at"];
    const csvCell = (value: string) => {
      const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
      return `"${safe.replace(/"/g, '""')}"`;
    };
    const csv = [columns.join(","), ...visibleSubmissions.map((item) => columns.map((key) => csvCell(String(item[key] ?? ""))).join(","))].join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "foundation-submissions.csv";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  if (checkingAuth || loading) return <div className="admin-shell min-h-screen grid place-items-center bg-navy-50 text-navy-700">Opening your dashboard…</div>;

  const grouped: Record<string, typeof images[string][]> = {};
  Object.values(images).forEach((slot) => { (grouped[slot.page] ||= []).push(slot); });
  const pageOrder = ["Global", "Home", "About", "Work", "Impact", "Team", "Gallery"];
  const orderedPages = Object.keys(grouped).sort((a, b) => {
    const ai = pageOrder.indexOf(a), bi = pageOrder.indexOf(b);
    return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi) || a.localeCompare(b);
  });
  const contentPages = [...new Set(Object.values(content).map((field) => field.page))];
  const visibleSubmissions = inboxFilter === "all" ? submissions : submissions.filter((item) => item.kind === inboxFilter);

  return <div className="admin-shell min-h-screen">
    <header className="admin-header">
      <div className="wrap flex min-h-20 flex-wrap items-center justify-between gap-4 py-3">
        <div><h1 className="font-serif-heading text-xl font-bold">Jagannath Foundation</h1><p className="text-xs text-white/65">Website administration</p></div>
        <div className="flex items-center gap-3"><a href="/" target="_blank" rel="noreferrer" className="text-sm text-white/80 hover:text-white">View website ↗</a><button onClick={logout} className="border border-white/30 px-3 py-2 text-xs text-white hover:bg-white/10">Sign out</button></div>
      </div>
      <div className="wrap admin-nav-tabs" role="tablist" aria-label="Dashboard sections">
        <button className="admin-tab" aria-selected={section === "images"} role="tab" onClick={() => setSection("images")}>Images <span>{Object.keys(images).length}</span></button>
        <button className="admin-tab" aria-selected={section === "text"} role="tab" onClick={() => setSection("text")}>Website text <span>{Object.keys(content).length}</span></button>
        <button className="admin-tab" aria-selected={section === "inbox"} role="tab" onClick={() => setSection("inbox")}>Inbox <span>{submissions.length}</span></button>
      </div>
    </header>

    <div className="wrap admin-content" key={section}>
      {status && <div role="status" className={`mb-5 border px-4 py-3 text-sm ${status.tone === "success" ? "form-success border-green-300 bg-green-50 text-green-900" : "border-red-300 bg-red-50 text-red-900"}`}>{status.message}</div>}
      {section === "images" ? <>
        <div className="mb-7"><p className="eyebrow"><span />Photo library</p><h2 className="mt-2 font-serif-heading text-4xl text-navy-950">Make the story visible.</h2><p className="mt-2 max-w-2xl text-sm text-navy-700">Replace an image below and it will appear on the public website as soon as the upload finishes. JPG, PNG, WEBP and GIF files up to 8 MB.</p></div>
        {orderedPages.map((page) => <section key={page}>
          <Reveal as="h3" className="admin-section-title">{page}</Reveal>
          <div className="admin-image-grid">{grouped[page].sort((a,b) => a.label.localeCompare(b.label)).map((slot) => <Reveal as="article" className="admin-image-card" key={slot.slot_key}>
            {slot.url.endsWith("/placeholder.jpg") ? <div className="admin-image-empty">Photo not added</div> : <img src={`${API_URL}${slot.url}`} alt={slot.alt_text || slot.label} />}
            <div className="admin-image-card-content"><p className="mb-1 text-sm font-semibold text-navy-950" title={slot.label}>{slot.label}</p><p className="mb-3 text-[10px] text-navy-500">{slot.page} · Updated {new Date(slot.updated_at).toLocaleDateString()}</p>
              <input ref={(el) => { fileInputs.current[slot.slot_key] = el; }} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(event) => { void upload(slot.slot_key, event.target.files?.[0]); event.currentTarget.value = ""; }} />
              <button className="admin-upload" disabled={uploading === slot.slot_key} onClick={() => fileInputs.current[slot.slot_key]?.click()}>{uploading === slot.slot_key ? "Uploading…" : "↑  Replace image"}</button>
            </div>
          </Reveal>)}</div>
        </section>)}
      </> : section === "text" ? <>
        <div className="mb-7"><p className="eyebrow"><span />Editorial desk</p><h2 className="mt-2 font-serif-heading text-4xl text-navy-950">Update the words.</h2><p className="mt-2 max-w-2xl text-sm text-navy-700">Edit the Foundation’s homepage and introduction. Save each field to publish the change immediately.</p></div>
        {contentPages.map((page) => <section key={page}><Reveal as="h3" className="admin-section-title">{page}</Reveal>{Object.entries(content).filter(([, field]) => field.page === page).map(([key, field]) => <Reveal className="admin-copy-row" key={key}>
          <label htmlFor={`content-${key}`}>{field.label}</label><textarea id={`content-${key}`} maxLength={12000} value={drafts[key] ?? field.value} onChange={(event) => setDrafts((current) => ({ ...current, [key]: event.target.value }))} />
          <button className="admin-save" disabled={saving === key || drafts[key] === field.value} onClick={() => void saveText(key)}>{saving === key ? "Saving…" : drafts[key] === field.value ? "Saved" : "Save"}</button>
        </Reveal>)}</section>)}
      </> : <>
        <div className="inbox-heading"><div><p className="eyebrow"><span />Private inbox</p><h2 className="mt-2 font-serif-heading text-4xl text-navy-950">Messages &amp; requests.</h2><p className="mt-2 max-w-2xl text-sm text-navy-700">Contact messages, volunteer interests, pledge notes and update requests submitted through the website.</p></div><div className="inbox-actions"><label htmlFor="inbox-kind">Show</label><select id="inbox-kind" value={inboxFilter} onChange={(event) => setInboxFilter(event.target.value as typeof inboxFilter)}><option value="all">All requests</option><option value="contact">Contact</option><option value="volunteer">Volunteer</option><option value="pledge">Pledge notes</option><option value="newsletter">Update requests</option></select><button className="inbox-export" disabled={!visibleSubmissions.length} onClick={exportSubmissions}>↓  Download CSV</button></div></div>
        {!submissions.length ? <div className="inbox-empty">Nothing has been submitted yet.</div> : !visibleSubmissions.length ? <div className="inbox-empty">No requests in this category.</div> : <div className="inbox-list">{visibleSubmissions.map((item) => <Reveal as="article" className="inbox-item" key={item.id}>
          <div className="inbox-meta"><span className={`inbox-type type-${item.kind}`}>{item.kind === "pledge" ? "Pledge note" : item.kind}</span><time>{new Date(item.created_at).toLocaleString()}</time></div>
          <div className="inbox-item-main"><div className="inbox-person"><h3>{item.name || "Newsletter request"}</h3><a href={`mailto:${item.email}`}>{item.email}</a>{item.phone && <a href={`tel:${item.phone}`}>{item.phone}</a>}</div><div className="inbox-details">
            {item.subject && <strong>{item.subject}</strong>}{item.message && <p>{item.message}</p>}{item.district && <p><b>District:</b> {item.district}</p>}{item.skill && <p><b>Skill:</b> {item.skill}</p>}{item.cause && <p><b>Cause:</b> {item.cause}</p>}{item.amount && <p><b>Pledge amount:</b> INR {Number(item.amount).toLocaleString("en-IN")}</p>}
          </div><button aria-label={`Delete submission ${item.id}`} title="Delete submission" className="inbox-delete" onClick={() => void removeSubmission(item)}>×</button></div>
        </Reveal>)}</div>}
      </>}
    </div>
  </div>;
}
