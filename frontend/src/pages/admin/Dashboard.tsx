import { ChangeEvent, DragEvent, FormEvent, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { apiUrl, API_URL, clearToken, deleteSubmission, fetchContent, fetchSubmissions, FormSubmission, getToken, replaceImage, SiteContent, updateContent } from "../../lib/api";
import { useImages } from "../../lib/ImagesContext";
import Reveal from "../../components/Reveal";

type Status = { tone: "success" | "error"; message: string } | null;
type Section = "images" | "text" | "inbox";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 8 * 1024 * 1024;

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { images, refresh, loading } = useImages();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [section, setSection] = useState<Section>("images");
  const [imagePage, setImagePage] = useState<string>("Home");
  const [inboxFilter, setInboxFilter] = useState<"all" | FormSubmission["kind"]>("all");
  const [uploading, setUploading] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [content, setContent] = useState<SiteContent>({});
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  // Add-image form state (frontend only)
  const addFileInput = useRef<HTMLInputElement | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newImage, setNewImage] = useState<{ title: string; alt: string; file: File | null }>({ title: "", alt: "", file: null });
  const [newPreview, setNewPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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

  // Close the add form with the Escape key and lock page scroll while it is open
  useEffect(() => {
    if (!showAddForm) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") closeAddForm(); };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAddForm]);

  function logout() { clearToken(); navigate("/admin/login"); }

  function closeAddForm() {
    setNewPreview((current) => { if (current) URL.revokeObjectURL(current); return null; });
    setNewImage({ title: "", alt: "", file: null });
    setFormError(null);
    setDragging(false);
    setShowAddForm(false);
  }

  function pickNewFile(file?: File) {
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) { setFormError("Please choose a JPG, PNG, WEBP or GIF image."); return; }
    if (file.size > MAX_SIZE) { setFormError("This file is larger than 8 MB. Please choose a smaller image."); return; }
    setFormError(null);
    setNewPreview((current) => { if (current) URL.revokeObjectURL(current); return URL.createObjectURL(file); });
    setNewImage((current) => ({ ...current, file, title: current.title || file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ") }));
  }

  function removeNewFile() {
    setNewPreview((current) => { if (current) URL.revokeObjectURL(current); return null; });
    setNewImage((current) => ({ ...current, file: null }));
    if (addFileInput.current) addFileInput.current.value = "";
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    pickNewFile(event.dataTransfer.files?.[0]);
  }

  function submitNewImage(event: FormEvent) {
    event.preventDefault();
    if (!newImage.file) { setFormError("Please choose a photo to upload."); return; }
    if (!newImage.title.trim()) { setFormError("Please enter a title for this image."); return; }
    // TODO: connect to your backend upload API here
    console.log("New gallery image:", newImage);
    setStatus({ tone: "success", message: `“${newImage.title.trim()}” is ready to add. (Frontend only, backend not connected yet.)` });
    closeAddForm();
  }

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
  const pageOrder = ["Home", "Team", "Gallery", "Global", "About", "Work", "Impact"];
  const orderedPages = Object.keys(grouped).sort((a, b) => {
    const ai = pageOrder.indexOf(a), bi = pageOrder.indexOf(b);
    return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi) || a.localeCompare(b);
  });
  const activeImagePage = orderedPages.includes(imagePage) ? imagePage : orderedPages[0];
  const contentPages = [...new Set(Object.values(content).map((field) => field.page))];
  const visibleSubmissions = inboxFilter === "all" ? submissions : submissions.filter((item) => item.kind === inboxFilter);

  const navItems: { key: Section; label: string; count: number }[] = [
    { key: "images", label: "Images", count: Object.keys(images).length },
    { key: "text", label: "Website text", count: Object.keys(content).length },
    { key: "inbox", label: "Inbox", count: submissions.length },
  ];

  const canSubmit = !!newImage.file && !!newImage.title.trim();

  return <div className="admin-shell min-h-screen">
    <header className="admin-header">
      <div className="wrap flex min-h-20 flex-wrap items-center justify-between gap-4 py-3">
        <div><h1 className="font-serif-heading text-xl font-bold">Jagannath Foundation</h1><p className="text-xs text-white/65">Website administration</p></div>
        <div className="flex items-center gap-3"><a href="/" target="_blank" rel="noreferrer" className="text-sm text-white/80 hover:text-white">View website ↗</a><button onClick={logout} className="border border-white/30 px-3 py-2 text-xs text-white hover:bg-white/10">Sign out</button></div>
      </div>
    </header>

    <div className="flex min-h-[calc(100vh-5rem)] flex-col items-start md:flex-row">
      {/* Sidebar: stays fixed in view while the page scrolls */}
      <aside className="sticky top-0 z-20 w-full shrink-0 border-b border-navy-950/10 bg-white p-2 md:h-screen md:w-60 md:self-start md:overflow-y-auto md:border-b-0 md:border-r md:p-4">
        <nav role="tablist" aria-orientation="vertical" aria-label="Dashboard sections" className="flex flex-row gap-1 overflow-x-auto md:flex-col">
          {navItems.map((item) => {
            const active = section === item.key;
            return <button key={item.key} role="tab" aria-selected={active} onClick={() => setSection(item.key)}
              className={`flex items-center justify-between gap-2 whitespace-nowrap border-b-[3px] px-4 py-3 text-left text-sm font-semibold transition-colors md:w-full md:border-b-0 md:border-l-[3px] ${active ? "border-navy-950 bg-navy-950/5 text-navy-950" : "border-transparent text-navy-700 hover:bg-navy-950/5"}`}>
              <span>{item.label}</span>
              <span className={`min-w-[1.5rem] rounded-full px-2 py-1 text-center font-mono text-[11px] font-semibold leading-none tabular-nums tracking-tight transition-colors ${active ? "bg-navy-950 text-white" : "bg-navy-950/10 text-navy-700"}`}>{item.count}</span>
            </button>;
          })}
        </nav>
      </aside>

      <main className="admin-content w-full min-w-0 flex-1 px-4 pb-16 pt-5 md:px-8 md:pt-8" key={section}>
        {status && <div role="status" className={`mb-5 border px-4 py-3 text-sm ${status.tone === "success" ? "form-success border-green-300 bg-green-50 text-green-900" : "border-red-300 bg-red-50 text-red-900"}`}>{status.message}</div>}
        {section === "images" ? <>
          <div className="mb-5"><p className="eyebrow"><span />Photo library</p><h2 className="mt-2 font-serif-heading text-4xl text-navy-950">Make the story visible.</h2><p className="mt-2 max-w-2xl text-sm text-navy-700">Replace an image below and it will appear on the public website as soon as the upload finishes. JPG, PNG, WEBP and GIF files up to 8 MB.</p></div>
          <div className="mb-6 flex flex-wrap gap-1 border-b border-navy-950/15" role="tablist" aria-label="Image pages">
            {orderedPages.map((page) => {
              const active = activeImagePage === page;
              return <button key={page} role="tab" aria-selected={active} onClick={() => setImagePage(page)}
                className={`-mb-px flex items-center border-b-[3px] px-4 py-2.5 text-sm font-semibold transition-colors ${active ? "border-navy-950 text-navy-950" : "border-transparent text-navy-700 hover:text-navy-950"}`}>
                {page}
                <span className={`ml-2 inline-block min-w-[1.25rem] rounded-full px-1.5 py-1 text-center font-mono text-[11px] font-semibold leading-none tabular-nums transition-colors ${active ? "bg-navy-950 text-white" : "bg-navy-950/10 text-navy-700"}`}>{grouped[page].length}</span>
              </button>;
            })}
          </div>

          {activeImagePage === "Gallery" && <>
            <div className="mb-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-1.5 border border-navy-950 bg-navy-950 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-navy-700">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                Add image
              </button>
            </div>

            {showAddForm && (
              <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-navy-950/60 p-4 backdrop-blur-sm" onClick={closeAddForm}>
                <form
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="add-image-title"
                  onSubmit={submitNewImage}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-lg overflow-hidden bg-white shadow-2xl">

                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 bg-navy-950 px-6 py-5 text-white">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-white/60">Gallery</p>
                      <h3 id="add-image-title" className="font-serif-heading text-2xl font-bold">Add new image</h3>
                      <p className="mt-1 text-xs text-white/70">Upload a photo to show on the public Gallery page.</p>
                    </div>
                    <button type="button" onClick={closeAddForm} aria-label="Close" className="-mr-2 -mt-1 p-2 text-white/70 transition-colors hover:text-white">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
                    </button>
                  </div>

                  {/* Body */}
                  <div className="space-y-5 px-6 py-6">
                    {formError && <div role="alert" className="border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-800">{formError}</div>}

                    {/* Photo */}
                    <div>
                      <span className="mb-2 block text-sm font-semibold text-navy-950">Photo <span className="text-red-600">*</span></span>
                      <input
                        ref={addFileInput}
                        id="new-image-file"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={(e: ChangeEvent<HTMLInputElement>) => pickNewFile(e.target.files?.[0])} />

                      {!newPreview ? (
                        <div
                          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                          onDragLeave={() => setDragging(false)}
                          onDrop={onDrop}
                          onClick={() => addFileInput.current?.click()}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); addFileInput.current?.click(); } }}
                          role="button"
                          tabIndex={0}
                          className={`flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed px-4 py-10 text-center transition-colors ${dragging ? "border-navy-950 bg-navy-950/5" : "border-navy-950/25 bg-navy-50 hover:border-navy-950/60 hover:bg-navy-950/5"}`}>
                          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-navy-700" aria-hidden="true">
                            <path d="M4 16.5V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1.5" /><path d="M12 15V4" /><path d="M7.5 8.5L12 4l4.5 4.5" />
                          </svg>
                          <p className="text-sm font-semibold text-navy-950">Drag and drop your photo here</p>
                          <p className="text-xs text-navy-700">or <span className="underline">browse from your device</span></p>
                          <p className="mt-1 text-[11px] text-navy-500">JPG, PNG, WEBP or GIF · up to 8 MB</p>
                        </div>
                      ) : (
                        <div className="border border-navy-950/15">
                          <img src={newPreview} alt="Selected preview" className="h-52 w-full bg-navy-50 object-contain" />
                          <div className="flex items-center justify-between gap-3 border-t border-navy-950/10 bg-navy-50 px-3 py-2">
                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold text-navy-950">{newImage.file?.name}</p>
                              <p className="text-[11px] text-navy-500">{newImage.file ? formatSize(newImage.file.size) : ""}</p>
                            </div>
                            <div className="flex shrink-0 gap-3 text-xs font-semibold">
                              <button type="button" onClick={() => addFileInput.current?.click()} className="text-navy-700 hover:text-navy-950 hover:underline">Change</button>
                              <button type="button" onClick={removeNewFile} className="text-red-600 hover:text-red-800 hover:underline">Remove</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <div>
                      <div className="mb-1.5 flex items-baseline justify-between">
                        <label htmlFor="new-image-title" className="text-sm font-semibold text-navy-950">Title <span className="text-red-600">*</span></label>
                        <span className="font-mono text-[11px] tabular-nums text-navy-500">{newImage.title.length}/80</span>
                      </div>
                      <input
                        id="new-image-title"
                        type="text"
                        maxLength={80}
                        placeholder="e.g. Annual health camp, Darjeeling"
                        value={newImage.title}
                        onChange={(e) => setNewImage((current) => ({ ...current, title: e.target.value }))}
                        className="w-full border border-navy-950/20 bg-white px-3 py-2.5 text-sm text-navy-950 outline-none transition-colors placeholder:text-navy-500/70 focus:border-navy-950 focus:ring-2 focus:ring-navy-950/10" />
                    </div>

                    {/* Description */}
                    <div>
                      <div className="mb-1.5 flex items-baseline justify-between">
                        <label htmlFor="new-image-alt" className="text-sm font-semibold text-navy-950">Description <span className="font-normal text-navy-500">(optional)</span></label>
                        <span className="font-mono text-[11px] tabular-nums text-navy-500">{newImage.alt.length}/200</span>
                      </div>
                      <textarea
                        id="new-image-alt"
                        rows={3}
                        maxLength={200}
                        placeholder="Briefly describe what is in the photo. This also helps screen readers and search engines."
                        value={newImage.alt}
                        onChange={(e) => setNewImage((current) => ({ ...current, alt: e.target.value }))}
                        className="w-full resize-none border border-navy-950/20 bg-white px-3 py-2.5 text-sm text-navy-950 outline-none transition-colors placeholder:text-navy-500/70 focus:border-navy-950 focus:ring-2 focus:ring-navy-950/10" />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-end gap-3 border-t border-navy-950/10 bg-navy-50 px-6 py-4">
                    <button type="button" onClick={closeAddForm} className="border border-navy-950/25 bg-white px-4 py-2 text-sm font-semibold text-navy-700 transition-colors hover:bg-navy-950/5">Cancel</button>
                    <button type="submit" disabled={!canSubmit} className="bg-navy-950 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-40">Add to gallery</button>
                  </div>
                </form>
              </div>
            )}
          </>}

          {activeImagePage && <section key={activeImagePage}>
            <div className="admin-image-grid">{[...grouped[activeImagePage]].sort((a, b) => a.label.localeCompare(b.label)).map((slot) => <Reveal as="article" className="admin-image-card flex h-full flex-col" key={slot.slot_key}>
              {slot.url.endsWith("/placeholder.jpg")
                ? <div className="admin-image-empty h-48 w-full shrink-0">Photo not added</div>
                : <img className="h-48 w-full shrink-0 object-cover" src={`${API_URL}${slot.url}`} alt={slot.alt_text || slot.label} />}
              <div className="admin-image-card-content flex flex-1 flex-col">
                <p className="mb-1 truncate text-sm font-semibold text-navy-950" title={slot.label}>{slot.label}</p>
                <p className="mb-3 text-[10px] text-navy-500">{slot.page} · Updated {new Date(slot.updated_at).toLocaleDateString()}</p>
                <input ref={(el) => { fileInputs.current[slot.slot_key] = el; }} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(event) => { void upload(slot.slot_key, event.target.files?.[0]); event.currentTarget.value = ""; }} />
                {/* mt-auto pushes the buttons to the bottom so they line up across every card */}
                <div className="mt-auto flex items-center gap-2">
                  <button className="admin-upload flex-1" disabled={uploading === slot.slot_key} onClick={() => fileInputs.current[slot.slot_key]?.click()}>{uploading === slot.slot_key ? "Uploading…" : "↑  Replace image"}</button>
                  {activeImagePage === "Gallery" && <button type="button" aria-label={`Delete ${slot.label}`} title="Delete image"
                    className="grid h-9 w-9 shrink-0 place-items-center border border-red-300 bg-red-50 text-red-600 transition-colors hover:bg-red-600 hover:text-white">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />
                    </svg>
                  </button>}
                </div>
              </div>
            </Reveal>)}</div>
          </section>}
        </> : section === "text" ? <>
          <div className="mb-7"><p className="eyebrow"><span />Editorial desk</p><h2 className="mt-2 font-serif-heading text-4xl text-navy-950">Update the words.</h2><p className="mt-2 max-w-2xl text-sm text-navy-700">Edit the Foundation’s homepage and introduction. Save each field to publish the change immediately.</p></div>
          {contentPages.map((page) => <section key={page}><Reveal as="h3" className="admin-section-title">{page}</Reveal>{Object.entries(content).filter(([, field]) => field.page === page).map(([key, field]) => <Reveal className="admin-copy-row" key={key}>
            <label htmlFor={`content-${key}`}>{field.label}</label><textarea id={`content-${key}`} maxLength={12000} value={drafts[key] ?? field.value} onChange={(event) => setDrafts((current) => ({ ...current, [key]: event.target.value }))} />
            <button className="admin-save" disabled={saving === key || drafts[key] === field.value} onClick={() => void saveText(key)}>{saving === key ? "Saving…" : drafts[key] === field.value ? "Saved" : "Save"}</button>
          </Reveal>)}</section>)}
        </> : <>
          <div className="inbox-heading"><div><p className="eyebrow"><span />Private inbox</p><h2 className="mt-2 font-serif-heading text-4xl text-navy-950">Messages &amp; requests.</h2><p className="mt-2 max-w-2xl text-sm text-navy-700">Contact messages, volunteer interests, pledge notes, update requests and community service applications.</p></div><div className="inbox-actions"><label htmlFor="inbox-kind">Show</label><select id="inbox-kind" value={inboxFilter} onChange={(event) => setInboxFilter(event.target.value as typeof inboxFilter)}><option value="all">All requests</option><option value="contact">Contact</option><option value="volunteer">Volunteer</option><option value="pledge">Pledge notes</option><option value="newsletter">Update requests</option><option value="service">Community services</option></select><button className="inbox-export" disabled={!visibleSubmissions.length} onClick={exportSubmissions}>↓  Download CSV</button></div></div>
          {!submissions.length ? <div className="inbox-empty">Nothing has been submitted yet.</div> : !visibleSubmissions.length ? <div className="inbox-empty">No requests in this category.</div> : <div className="inbox-list">{visibleSubmissions.map((item) => <Reveal as="article" className="inbox-item" key={item.id}>
            <div className="inbox-meta"><span className={`inbox-type type-${item.kind}`}>{item.kind === "pledge" ? "Pledge note" : item.kind}</span><time>{new Date(item.created_at).toLocaleString()}</time></div>
            <div className="inbox-item-main"><div className="inbox-person"><h3>{item.name || "Newsletter request"}</h3><a href={`mailto:${item.email}`}>{item.email}</a>{item.phone && <a href={`tel:${item.phone}`}>{item.phone}</a>}</div><div className="inbox-details">
              {item.subject && <strong>{item.subject}</strong>}{item.message && <p>{item.message}</p>}{item.district && <p><b>District:</b> {item.district}</p>}{item.skill && <p><b>Skill:</b> {item.skill}</p>}{item.cause && <p><b>Cause:</b> {item.cause}</p>}{item.amount && <p><b>Pledge amount:</b> INR {Number(item.amount).toLocaleString("en-IN")}</p>}
            </div><button aria-label={`Delete submission ${item.id}`} title="Delete submission" className="inbox-delete" onClick={() => void removeSubmission(item)}>×</button></div>
          </Reveal>)}</div>}
        </>}
      </main>
    </div>
  </div>;
}