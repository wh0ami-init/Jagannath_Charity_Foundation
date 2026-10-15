import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useReducedMotion } from "motion/react";
import Layout from "../components/Layout";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import { fetchPublicBeneficiaries, type PublicBeneficiary } from "../lib/api";
import "./campaigns.css";
import "./active-beneficiaries.css";

gsap.registerPlugin(useGSAP);

export default function ActiveBeneficiaries() {
  const [beneficiaries, setBeneficiaries] = useState<PublicBeneficiary[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    let active = true;
    fetchPublicBeneficiaries()
      .then((records) => { if (active) setBeneficiaries(records); })
      .catch(() => { if (active) setLoadError("We couldn’t load the directory just now. Please refresh to try again."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const categories = useMemo(() => Array.from(new Set(beneficiaries.map((item) => item.category))).sort(), [beneficiaries]);
  const visibleBeneficiaries = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return beneficiaries.filter((item) => (
      (status === "all" || item.status === status)
      && (category === "all" || item.category === category)
      && (!query || `${item.display_name} ${item.category}`.toLocaleLowerCase().includes(query))
    ));
  }, [beneficiaries, category, search, status]);

  useGSAP(() => {
    const cards = listRef.current?.querySelectorAll(".beneficiary-directory-card");
    if (!cards?.length || reducedMotion) return;
    gsap.fromTo(cards, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: .45, stagger: .07, ease: "power2.out" });
  }, { scope: listRef, dependencies: [visibleBeneficiaries.length, reducedMotion], revertOnUpdate: true });

  return (
    <Layout>
      <main className="campaigns-page active-beneficiaries-page">
        <PageHero
          theme="work"
          motif="beneficiary-directory"
          eyebrow="Beneficiaries"
          title="Support, shared with dignity."
          description="Meet the people who have chosen to share their support journey with the Foundation community."
          actions={<Link className="pagehero-button" href="/beneficiaries/apply">Apply for support <span aria-hidden="true">↗</span></Link>}
        />

        <div className="wrap beneficiaries-content">
          <Reveal className="beneficiaries-filter-panel" aria-label="Beneficiary filters">
            <label className="beneficiaries-filter-field beneficiaries-search" htmlFor="beneficiary-search">
              <span><i aria-hidden="true">⌕</i> Search beneficiaries</span>
              <input id="beneficiary-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or support category…" />
            </label>
            <label className="beneficiaries-filter-field" htmlFor="beneficiary-category-filter">
              <span><i aria-hidden="true">◆</i> Category</span>
              <select id="beneficiary-category-filter" value={category} onChange={(event) => setCategory(event.target.value)}>
                <option value="all">All categories</option>
                {categories.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <fieldset className="beneficiaries-status-field">
              <legend>Status</legend>
              <div className="beneficiaries-status-options">
                {[ ["all", "All"], ["active", "Active"], ["inactive", "Inactive"] ].map(([value, label]) => (
                  <button key={value} type="button" className={status === value ? "is-selected" : ""} aria-pressed={status === value} onClick={() => setStatus(value)}>
                    <span aria-hidden="true" />{label}
                  </button>
                ))}
              </div>
            </fieldset>
          </Reveal>

          <section className="beneficiaries-list" aria-labelledby="beneficiaries-list-title">
            <div className="beneficiaries-list-heading">
              <div>
                <p className="beneficiaries-kicker">Public support directory</p>
                <h2 id="beneficiaries-list-title">Beneficiary list</h2>
              </div>
              <span className="beneficiaries-count" aria-live="polite">◈ &nbsp;{visibleBeneficiaries.length} {visibleBeneficiaries.length === 1 ? "profile" : "profiles"}</span>
            </div>

            {loading ? (
              <div className="beneficiaries-empty" role="status"><span className="beneficiaries-loading-spinner" aria-hidden="true" /><h3>Loading the directory</h3><p>Please wait while we get the latest public profiles.</p></div>
            ) : loadError ? (
              <div className="beneficiaries-empty" role="alert"><span className="beneficiaries-empty-icon" aria-hidden="true">!</span><h3>Directory temporarily unavailable</h3><p>{loadError}</p></div>
            ) : visibleBeneficiaries.length ? (
              <div className="beneficiaries-grid" ref={listRef}>
                {visibleBeneficiaries.map((item) => (
                  <article className="beneficiary-directory-card" key={item.id}>
                    <span className="beneficiary-profile-mark" aria-hidden="true">{item.display_name.trim().charAt(0).toLocaleUpperCase()}</span>
                    <div className="beneficiary-profile-copy">
                      <div className="beneficiary-profile-meta"><span className="beneficiary-active-dot" /> Active</div>
                      <h3>{item.display_name}</h3>
                      <p>{item.category}</p>
                    </div>
                    <span className="beneficiary-profile-heart" aria-hidden="true">♡</span>
                  </article>
                ))}
              </div>
            ) : (
              <div className="beneficiaries-empty" aria-live="polite">
                <div className="beneficiaries-empty-orbit" aria-hidden="true"><span /><span /><span /></div>
                <span className="beneficiaries-empty-icon" aria-hidden="true">
                  <svg viewBox="0 0 64 64" fill="none"><circle cx="24" cy="19" r="8" /><circle cx="43" cy="23" r="7" /><path d="M8 49c0-11 7-18 16-18s16 7 16 18M36 36c2-4 5-6 9-6 7 0 12 6 12 15" /><path d="M32 13c-4-6-14-4-14 4 0 7 14 15 14 15s14-8 14-15c0-8-10-10-14-4Z" className="beneficiary-empty-heart" /></svg>
                </span>
                <h3>{beneficiaries.length ? "No profiles match these filters" : "No public profiles yet"}</h3>
                <p>{beneficiaries.length ? "Try another name or choose a different category or status." : "Beneficiary profiles appear here only when applicants choose to share them."}</p>
                {beneficiaries.length > 0 && <button className="beneficiaries-reset" type="button" onClick={() => { setSearch(""); setCategory("all"); setStatus("all"); }}>Clear filters</button>}
              </div>
            )}
          </section>

          <aside className="beneficiaries-support">
            <div><span className="beneficiaries-support-icon" aria-hidden="true">♡</span><div><p>Need our support?</p><h2>Send a private request to the Foundation.</h2></div></div>
            <Link href="/beneficiaries/apply">Apply for support <span aria-hidden="true">↗</span></Link>
          </aside>
        </div>
      </main>
    </Layout>
  );
}
