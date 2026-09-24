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
