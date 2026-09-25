export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8010";

export function apiUrl(path: string) {
  return `${API_URL}${path}`;
}

const TOKEN_KEY = "jf_admin_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function login(username: string, password: string) {
  const res = await fetch(apiUrl("/api/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    throw new Error("Invalid username or password");
  }
  const data = await res.json();
  setToken(data.access_token);
  return data;
}

export interface ImageSlot {
  slot_key: string;
  label: string;
  page: string;
  alt_text: string;
  url: string;
  updated_at: string;
}

export type SiteContent = Record<string, { label: string; page: string; value: string }>;

export interface FormSubmission {
  id: number;
  kind: "contact" | "volunteer" | "pledge" | "newsletter";
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
  const res = await fetch(apiUrl("/api/submissions"), {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Could not load the admin inbox");
  return res.json();
}

export async function deleteSubmission(id: number) {
  const res = await fetch(apiUrl(`/api/submissions/${id}`), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` },
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
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
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
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(apiUrl(`/api/images/${slotKey}`), {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(err.detail || "Upload failed");
  }
  return res.json();
}
