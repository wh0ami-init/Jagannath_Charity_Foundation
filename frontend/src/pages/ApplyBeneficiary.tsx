import { tr as translateText, localize as localizeText, trError as translateError } from "../i18n";
import { useTranslation as usePageTranslation } from "react-i18next";
import { FormEvent, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useReducedMotion } from "motion/react";
import Layout from "../components/Layout";
import PageHero from "../components/PageHero";
import { submitBeneficiaryApplication } from "../lib/api";
import "./apply-beneficiary.css";
gsap.registerPlugin(useGSAP);
const statesAndTerritories = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];
export default function ApplyBeneficiary() {
    usePageTranslation();
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [category, setCategory] = useState("");
    const [publicListing, setPublicListing] = useState(false);
    const [publicDisplayName, setPublicDisplayName] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{
        tone: "success" | "error";
        text: string;
    } | null>(null);
    const formCardRef = useRef<HTMLElement>(null);
    const reducedMotion = useReducedMotion();
    const age = useMemo(() => {
        if (!dateOfBirth)
            return "";
        const today = new Date();
        const birthDate = new Date(`${dateOfBirth}T00:00:00`);
        let years = today.getFullYear() - birthDate.getFullYear();
        const beforeBirthday = today.getMonth() < birthDate.getMonth()
            || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate());
        if (beforeBirthday)
            years -= 1;
        return years >= 0 && years <= 120 ? String(years) : "";
    }, [dateOfBirth]);
    useGSAP(() => {
        const card = formCardRef.current;
        if (!card || reducedMotion)
            return;
        gsap.fromTo(card, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: .75, ease: "power3.out" });
        gsap.fromTo(card.querySelectorAll(".beneficiary-form-section"), { autoAlpha: 0, y: 16 }, {
            autoAlpha: 1,
            y: 0,
            duration: .55,
            stagger: .1,
            delay: .16,
            ease: "power2.out",
        });
        gsap.to(card.querySelector(".apply-beneficiary-glow--green"), { x: 24, y: -14, scale: 1.14, duration: 9, repeat: -1, yoyo: true, ease: "sine.inOut" });
        gsap.to(card.querySelector(".apply-beneficiary-glow--gold"), { x: -20, y: 14, scale: 1.12, duration: 11, delay: .5, repeat: -1, yoyo: true, ease: "sine.inOut" });
    }, { scope: formCardRef, dependencies: [reducedMotion], revertOnUpdate: true });
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = event.currentTarget;
        if (!form.reportValidity())
            return;
        const values = new FormData(form);
        const value = (name: string) => String(values.get(name) ?? "").trim();
        const fullName = value("full_name");
        const reason = value("reason");
        setSubmitting(true);
        setFeedback(null);
        try {
            const result = await submitBeneficiaryApplication({
                full_name: fullName,
                gender: value("gender"),
                date_of_birth: value("date_of_birth") || null,
                father_name: value("father_name"),
                caste_category: value("caste_category"),
                email: value("email"),
                phone: value("phone"),
                address: value("address"),
                state: value("state"),
                district: value("district"),
                beneficiary_category: category,
                other_category: category === "Other" ? value("other_category") : "",
                reason,
                consent: values.get("consent") === "on",
                public_listing: publicListing,
                public_display_name: publicListing ? value("public_display_name") : "",
                website: value("website"),
            });
            form.reset();
            setDateOfBirth("");
            setCategory("");
            setPublicListing(false);
            setPublicDisplayName("");
            setFeedback({
                tone: "success",
                text: result.listed
                    ? "Your application was received, and your chosen display name has been added to the Beneficiary list."
                    : "Your application was received privately by the Foundation. It will not appear in the public Beneficiary list.",
            });
            window.scrollTo({ top: formCardRef.current?.offsetTop ?? 0, behavior: "smooth" });
        }
        catch (error) {
            setFeedback({ tone: "error", text: error instanceof Error ? error.message : "We could not send your application. Please try again." });
        }
        finally {
            setSubmitting(false);
        }
    }
    return (<Layout>
      <main className="apply-beneficiary-page">
        <PageHero theme="work" motif="beneficiary-apply" eyebrow={translateText("Beneficiaries")} title={translateText("A little support can open new possibilities.")} description={translateText("Tell us about the support you\u2019re seeking. Our team will review your request and contact you about next steps.")} actions={<a className="pagehero-button" href="#beneficiary-application">{translateText("Start an application")}<span aria-hidden="true">↘</span></a>}/>

        <section className="apply-beneficiary-content" aria-labelledby="beneficiary-application-title">
          <div className="apply-beneficiary-wrap">
            <header className="apply-beneficiary-intro">
              <p className="apply-beneficiary-eyebrow"><span />{translateText("A request for support")}</p>
              <h2 id="beneficiary-application-title">{translateText("Beneficiary application")}</h2>
              <p>{translateText("Share the details we need to understand your request. Required fields are marked with an asterisk.")}</p>
            </header>

            <section className="apply-beneficiary-card" id="beneficiary-application" ref={formCardRef}>
              <div className="apply-beneficiary-atmosphere" aria-hidden="true">
                <span className="apply-beneficiary-glow apply-beneficiary-glow--green"/>
                <span className="apply-beneficiary-glow apply-beneficiary-glow--gold"/>
              </div>
              <header className="apply-beneficiary-card-header">
                <span className="apply-beneficiary-mark" aria-hidden="true">
                  <svg viewBox="0 0 48 48" fill="none"><circle cx="18" cy="16" r="6"/><circle cx="32" cy="18" r="5"/><path d="M5 39c0-9 5-15 13-15s13 6 13 15M29 27c2-2 4-3 7-3 6 0 9 5 9 12"/><path d="M24 12c-3-5-10-3-10 3 0 5 10 11 10 11s10-6 10-11c0-6-7-8-10-3Z"/></svg>
                </span>
                <div>
                  <p>{translateText("Jagannath Foundation")}</p>
                  <span>{translateText("Beneficiary Support")}</span>
                </div>
                <span className="apply-beneficiary-secure"><span aria-hidden="true">✳</span>{translateText("Private application")}</span>
              </header>

              <form className="apply-beneficiary-form" onSubmit={handleSubmit}>
                <div className="beneficiary-form-section">
                  <div className="beneficiary-section-heading"><span>01</span><div><h3>{translateText("About you")}</h3><p>{translateText("Basic personal details for your request.")}</p></div></div>
                  <div className="beneficiary-form-grid">
                    <label className="beneficiary-field" htmlFor="beneficiary-full-name"><span>{translateText("Full name")}<b>*</b></span><input id="beneficiary-full-name" name="full_name" autoComplete="name" minLength={2} maxLength={150} placeholder={translateText("Enter your full name")} required/></label>
                    <label className="beneficiary-field" htmlFor="beneficiary-gender"><span>{translateText("Gender")}<b>*</b></span><select id="beneficiary-gender" name="gender" defaultValue="" required><option value="" disabled>{translateText("Select gender")}</option><option value="Female">{translateText("Female")}</option><option value="Male">{translateText("Male")}</option><option value="Other">{translateText("Other")}</option><option value="Prefer not to say">{translateText("Prefer not to say")}</option></select></label>
                    <label className="beneficiary-field" htmlFor="beneficiary-dob"><span>{translateText("Date of birth")}</span><input id="beneficiary-dob" name="date_of_birth" type="date" max={new Date().toISOString().slice(0, 10)} value={dateOfBirth} onChange={(event) => setDateOfBirth(event.target.value)}/></label>
                    <label className="beneficiary-field" htmlFor="beneficiary-age"><span>{translateText("Age")}</span><input id="beneficiary-age" name="age" type="number" value={age} placeholder={translateText("Calculated from date of birth")} readOnly/></label>
                    <label className="beneficiary-field" htmlFor="beneficiary-guardian"><span>{translateText("Father / guardian name")}</span><input id="beneficiary-guardian" name="father_name" autoComplete="name" maxLength={150} placeholder={translateText("Enter father or guardian name")}/></label>
                    <label className="beneficiary-field" htmlFor="beneficiary-caste"><span>{translateText("Caste category")}</span><select id="beneficiary-caste" name="caste_category" defaultValue=""><option value="">{translateText("Choose if applicable")}</option><option value="General">{translateText("General")}</option><option value="OBC">{translateText("OBC")}</option><option value="SC">{translateText("SC")}</option><option value="ST">{translateText("ST")}</option><option value="EWS">{translateText("EWS")}</option><option value="Other">{translateText("Other")}</option><option value="Prefer not to say">{translateText("Prefer not to say")}</option></select></label>
                  </div>
                </div>

                <div className="beneficiary-form-section">
                  <div className="beneficiary-section-heading"><span>02</span><div><h3>{translateText("How can we reach you?")}</h3><p>{translateText("We\u2019ll use these details to follow up on your application.")}</p></div></div>
                  <div className="beneficiary-form-grid">
                    <label className="beneficiary-field" htmlFor="beneficiary-phone"><span>{translateText("Phone number")}<b>*</b></span><input id="beneficiary-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" maxLength={15} pattern="[+0-9() -]{7,15}" placeholder={translateText("Enter your phone number")} required/></label>
                    <label className="beneficiary-field" htmlFor="beneficiary-email"><span>{translateText("Email address")}<small>{translateText("Optional")}</small></span><input id="beneficiary-email" name="email" type="email" autoComplete="email" maxLength={254} placeholder={translateText("you@example.com")}/></label>
                    <label className="beneficiary-field beneficiary-field--wide" htmlFor="beneficiary-address"><span>{translateText("Full address")}</span><textarea id="beneficiary-address" name="address" autoComplete="street-address" maxLength={700} rows={3} placeholder={translateText("House, street, locality or village")}/></label>
                    <label className="beneficiary-field" htmlFor="beneficiary-state"><span>{translateText("State / territory")}</span><select id="beneficiary-state" name="state" defaultValue=""><option value="">{translateText("Select state or territory")}</option>{localizeText(statesAndTerritories.map((state) => <option key={state} value={state}>{localizeText(state)}</option>))}</select></label>
                    <label className="beneficiary-field" htmlFor="beneficiary-district"><span>{translateText("District")}</span><input id="beneficiary-district" name="district" maxLength={120} autoComplete="address-level2" placeholder={translateText("Enter district")}/></label>
                  </div>
                </div>

                <div className="beneficiary-form-section">
                  <div className="beneficiary-section-heading"><span>03</span><div><h3>{translateText("What support do you need?")}</h3><p>{translateText("Tell us a little about the assistance you\u2019re looking for.")}</p></div></div>
                  <div className="beneficiary-form-grid">
                    <label className="beneficiary-field" htmlFor="beneficiary-category"><span>{translateText("Beneficiary category")}<b>*</b></span><select id="beneficiary-category" name="beneficiary_category" value={category} onChange={(event) => setCategory(event.target.value)} required><option value="" disabled>{translateText("Select a category")}</option><option value="Education">{translateText("Education")}</option><option value="Healthcare">{translateText("Healthcare")}</option><option value="Livelihood">{translateText("Livelihood")}</option><option value="Food and essentials">{translateText("Food and essentials")}</option><option value="Community support">{translateText("Community support")}</option><option value="Other">{translateText("Other")}</option></select></label>
                    {localizeText(category === "Other" && <label className="beneficiary-field" htmlFor="beneficiary-other-category"><span>{translateText("Please specify")}<b>*</b></span><input id="beneficiary-other-category" name="other_category" maxLength={120} placeholder={translateText("Name the type of support")} required/></label>)}
                    <label className="beneficiary-field beneficiary-field--wide" htmlFor="beneficiary-reason"><span>{translateText("Reason / details")}<b>*</b></span><textarea id="beneficiary-reason" name="reason" rows={5} minLength={10} maxLength={1600} placeholder={translateText("Describe the support you\u2019re seeking and any context that may help us review your request.")} required/><small className="beneficiary-field-hint">{translateText("Please share only information relevant to your request. Do not include bank details or identity numbers.")}</small></label>
                  </div>
                </div>

                <div className="beneficiary-form-note"><span aria-hidden="true">{translateText("i")}</span><p>{translateText("Your application details are sent to the Foundation\u2019s private admin inbox. Do not attach identity documents or include bank details or identity numbers here; if supporting documents are needed, we\u2019ll advise you on a safe way to share them.")}</p></div>
                <label className="beneficiary-consent"><input name="consent" type="checkbox" required/><span>{translateText("I consent to Jagannath Foundation using the information above to review my request and contact me about it.")}<b>*</b> <Link href="/privacy-policy">{translateText("Privacy policy")}</Link></span></label>
                <div className="beneficiary-public-choice">
                  <label className="beneficiary-consent beneficiary-public-consent">
                    <input name="public_listing" type="checkbox" checked={publicListing} onChange={(event) => { setPublicListing(event.target.checked); if (!event.target.checked)
        setPublicDisplayName(""); }}/>
                    <span>{translateText("I want to be included in the public Beneficiary list. I understand that only my chosen display name and support category will be visible to visitors.")}</span>
                  </label>
                  {localizeText(publicListing && <label className="beneficiary-field beneficiary-public-name" htmlFor="beneficiary-public-name"><span>{translateText("Public display name")}<b>*</b></span><input id="beneficiary-public-name" name="public_display_name" value={publicDisplayName} onChange={(event) => setPublicDisplayName(event.target.value)} maxLength={80} placeholder={translateText("Name you agree to display publicly")} required/></label>)}
                </div>
                <input className="beneficiary-honeypot" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"/>

                {localizeText(feedback && <p className={`apply-beneficiary-feedback is-${feedback.tone}`} role="status" aria-live="polite">{localizeText(feedback.text)}</p>)}
                <div className="apply-beneficiary-actions">
                  <Link className="apply-beneficiary-back" href="/beneficiaries/active">{translateText("\u2190 Beneficiaries")}</Link>
                  <button type="submit" className="apply-beneficiary-submit" disabled={submitting}>{localizeText(submitting ? "Sending your request…" : "Submit application")}<span aria-hidden="true">↗</span></button>
                </div>
              </form>
            </section>
          </div>
        </section>
      </main>
    </Layout>);
}
