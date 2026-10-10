const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
// The localhost fallback is useful during local development, but a production
// build without VITE_API_URL should use same-origin API routes instead of
// accidentally sending visitors' browsers to their own localhost.
export const API_URL = (
  configuredApiUrl || (import.meta.env.DEV ? "http://localhost:8010" : "")
).replace(/\/+$/, "");

export function apiUrl(path: string) {
  return `${API_URL}${path}`;
}

// The admin session lives in an HttpOnly cookie that JavaScript cannot read.
// The CSRF token is kept only in memory and restored from /api/auth/me after a refresh.
let csrfToken: string | null = null;

// Remove any token saved in localStorage by earlier versions of the site.
try { localStorage.removeItem("jf_admin_token"); } catch { /* storage unavailable */ }

function csrfHeaders(): Record<string, string> {
  return csrfToken ? { "X-CSRF-Token": csrfToken } : {};
}

export async function login(username: string, password: string) {
  const res = await fetch(apiUrl("/api/auth/login"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (res.status === 429) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.detail || "Too many login attempts. Please try again later.");
  }
  if (!res.ok) {
    throw new Error("Invalid username or password");
  }
  const data = await res.json();
  csrfToken = data.csrf_token;
  return data;
}

/** Checks the cookie session and restores the CSRF token. Throws if not signed in. */
export async function fetchSession() {
  const res = await fetch(apiUrl("/api/auth/me"), { credentials: "include" });
  if (!res.ok) throw new Error("Session expired");
  const data = await res.json();
  csrfToken = data.csrf_token;
  return data as { username: string };
}

export async function logout() {
  csrfToken = null;
  await fetch(apiUrl("/api/auth/logout"), { method: "POST", credentials: "include" }).catch(() => undefined);
}

export interface ImageSlot {
  slot_key: string;
  label: string;
  page: string;
  alt_text: string;
  url: string;
  updated_at: string;
  category?: "national" | "public" | "regional" | "culture" | null;
}

export type SiteContent = Record<string, { label: string; page: string; value: string }>;

export interface FormSubmission {
  id: number;
  kind: "contact" | "volunteer" | "pledge" | "newsletter" | "service";
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  district: string;
  skill: string;
  amount: number | null;
  cause: string;
  created_at: string;
}

export function submissionPayload(form: HTMLFormElement, kind: FormSubmission["kind"]) {
  const values = new FormData(form);
  const field = (name: string) => String(values.get(name) ?? "").trim();
  const payload: Record<string, string | number | boolean> = {
    kind,
    name: field("name"),
    email: field("email"),
    phone: field("phone"),
    subject: field("subject"),
    message: field("message"),
    district: field("district"),
    skill: field("skill"),
    cause: field("cause"),
    consent: values.get("consent") === "on",
    website: field("website"),
  };
  const amount = field("amount");
  if (amount) payload.amount = Number(amount);
  return payload;
}

export async function submitForm(payload: Record<string, string | number | boolean>) {
  const res = await fetch(apiUrl("/api/submissions"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Your submission could not be saved." }));
    throw new Error(error.detail || "Your submission could not be saved.");
  }
  return res.json();
}

export async function fetchSubmissions(): Promise<FormSubmission[]> {
  const res = await fetch(apiUrl("/api/submissions"), { credentials: "include" });
  if (!res.ok) throw new Error("Could not load the admin inbox");
  return res.json();
}

export async function deleteSubmission(id: number) {
  const res = await fetch(apiUrl(`/api/submissions/${id}`), {
    method: "DELETE",
    credentials: "include",
    headers: csrfHeaders(),
  });
  if (!res.ok) throw new Error("Could not delete this submission");
}

export async function fetchContent(): Promise<SiteContent> {
  const res = await fetch(apiUrl("/api/content"));
  if (!res.ok) throw new Error("Failed to load website content");
  return res.json();
}

export async function updateContent(key: string, value: string) {
  const res = await fetch(apiUrl(`/api/content/${key}`), {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json", ...csrfHeaders() },
    body: JSON.stringify({ value }),
  });
  if (!res.ok) throw new Error("Could not save this update");
  return res.json();
}

export async function fetchImages(): Promise<ImageSlot[]> {
  const res = await fetch(apiUrl("/api/images"));
  if (!res.ok) throw new Error("Failed to load images");
  return res.json();
}

export async function replaceImage(slotKey: string, file: File): Promise<ImageSlot> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(apiUrl(`/api/images/${slotKey}`), {
    method: "POST",
    credentials: "include",
    headers: csrfHeaders(),
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(err.detail || "Upload failed");
  }
  return res.json();
}

export async function addGalleryImage(input: { label: string; alt_text: string; category: NonNullable<ImageSlot["category"]>; file: File }): Promise<ImageSlot> {
  const form = new FormData();
  form.append("label", input.label);
  form.append("alt_text", input.alt_text);
  form.append("category", input.category);
  form.append("file", input.file);
  const res = await fetch(apiUrl("/api/images"), { method: "POST", credentials: "include", headers: csrfHeaders(), body: form });
  if (!res.ok) { const err = await res.json().catch(() => ({ detail: "Could not add this photo" })); throw new Error(err.detail || "Could not add this photo"); }
  return res.json();
}

export async function updateGalleryImage(slotKey: string, input: { label: string; alt_text: string; category: NonNullable<ImageSlot["category"]> }): Promise<ImageSlot> {
  const res = await fetch(apiUrl(`/api/images/${encodeURIComponent(slotKey)}`), { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json", ...csrfHeaders() }, body: JSON.stringify(input) });
  if (!res.ok) { const err = await res.json().catch(() => ({ detail: "Could not save this photo" })); throw new Error(err.detail || "Could not save this photo"); }
  return res.json();
}

export async function deleteGalleryImage(slotKey: string): Promise<void> {
  const res = await fetch(apiUrl(`/api/images/${encodeURIComponent(slotKey)}`), { method: "DELETE", credentials: "include", headers: csrfHeaders() });
  if (!res.ok) { const err = await res.json().catch(() => ({ detail: "Could not delete this photo" })); throw new Error(err.detail || "Could not delete this photo"); }
}
