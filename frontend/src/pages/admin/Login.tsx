import { useState, FormEvent } from "react";
import { useLocation } from "wouter";
import { login } from "../../lib/api";
import Reveal from "../../components/Reveal";

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      navigate("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login min-h-screen flex items-center justify-center px-4 py-10">
      <Reveal as="form" onSubmit={handleSubmit} className="bg-white p-8 w-full max-w-sm space-y-4 shadow-2xl">
        <div>
          <p className="eyebrow"><span />Private area</p>
          <h1 className="text-3xl font-serif-heading font-bold text-navy-950">Welcome back.</h1>
          <p className="text-sm text-navy-700">Jagannath Foundation · Administrator</p>
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        <div>
          <label className="text-sm font-medium block mb-1">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full border border-navy-900/20 px-3 py-2.5 text-sm"
            autoFocus
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-navy-900/20 px-3 py-2.5 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-navy-900 hover:bg-orange-500 disabled:opacity-50 text-white py-3 text-sm font-semibold transition-colors"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </Reveal>
    </div>
  );
}
