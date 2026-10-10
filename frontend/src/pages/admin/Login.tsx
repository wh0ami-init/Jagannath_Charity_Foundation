import { FormEvent, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { fetchSession, login } from "../../lib/api";
import "./admin.css";

gsap.registerPlugin(useGSAP);

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Little gold "seeds" that float up, same idea as the welcome screen.
const SEEDS = Array.from({ length: 16 }, (_, i) => ({
  x: `${(i * 37 + 8) % 96}%`,
  s: `${10 + ((i * 7) % 12)}px`,
  d: `${9 + ((i * 5) % 9)}s`,
  delay: `${-((i * 3) % 11)}s`,
}));

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Already signed in? Go straight to the console.
  useEffect(() => {
    fetchSession()
      .then(() => navigate("/admin"))
      .catch(() => undefined);
  }, [navigate]);

  // Card glides in, then its parts appear one by one.
  useGSAP(
    () => {
      const card = cardRef.current;
      if (!card || prefersReducedMotion()) return;
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        card,
        { autoAlpha: 0, y: 40, scale: 0.96 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.8 },
      );
      tl.from(
        card.querySelectorAll(
          ".ac-login-logo, h1, .ac-login-sub, form > *, .ac-login-back",
        ),
        {
          autoAlpha: 0,
          y: 16,
          duration: 0.5,
          stagger: 0.07,
          clearProps: "all",
        },
        "-=0.45",
      );
    },
    { scope: cardRef },
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      await login(username.trim(), password);
      setLeaving(true);
      window.setTimeout(
        () => navigate("/admin"),
        prefersReducedMotion() ? 0 : 450,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Sign in did not work. Please try again.",
      );
      if (cardRef.current && !prefersReducedMotion()) {
        gsap.to(cardRef.current, {
          keyframes: { x: [-10, 10, -8, 8, -4, 4, 0] },
          duration: 0.5,
          ease: "none",
        });
      }
      setLoading(false);
    }
  }

  return (
    <div className="ac-login">
      <div className="ac-seeds" aria-hidden="true">
        {SEEDS.map((seed, i) => (
          <span
            key={i}
            style={
              {
                "--x": seed.x,
                "--s": seed.s,
                "--d": seed.d,
                "--delay": seed.delay,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div
        ref={cardRef}
        className={`ac-login-card${leaving ? " is-leaving" : ""}`}
      >
        <img
          className="ac-login-logo"
          src="/images/logo-mark.png"
          alt="Jagannath Foundation logo"
        />
        <h1>Welcome back</h1>
        <p className="ac-login-sub">Sign in to manage your website.</p>

        <form onSubmit={handleSubmit}>
          {error && (
            <p className="ac-error" role="alert">
              {error}
            </p>
          )}

          <div>
            <label htmlFor="ac-user">Username</label>
            <div className="ac-input">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
              <input
                id="ac-user"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoCapitalize="none"
                required
                autoFocus
              />
            </div>
          </div>

          <div>
            <label htmlFor="ac-pass">Password</label>
            <div className="ac-input">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="4" y="11" width="16" height="10" rx="3" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </svg>
              <input
                id="ac-pass"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="ac-eye"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
                  <circle cx="12" cy="12" r="3" />
                  {showPassword && <path d="M4 4l16 16" />}
                </svg>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || leaving}
            className="ac-btn ac-btn--primary ac-btn--lg ac-btn--block"
          >
            {loading || leaving ? (
              <>
                <span className="ac-spin" aria-hidden="true" /> Signing in…
              </>
            ) : (
              <>
                Sign in
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </>
            )}
          </button>
        </form>

        <a className="ac-login-back" href="/">
          ← Back to website
        </a>
      </div>
    </div>
  );
}
