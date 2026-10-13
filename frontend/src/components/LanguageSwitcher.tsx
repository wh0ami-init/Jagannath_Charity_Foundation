import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();


    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function selectLanguage(language: "en" | "hi") {
        if (loading || i18n.resolvedLanguage === language) return;
        setLoading(true);
        setError("");
        try {
            // Keep the current page visible while its next language downloads.
            await i18n.loadLanguages(language);
            if (!i18n.hasResourceBundle(language, "translation")) {
                throw new Error("Missing translations");
            }
            await i18n.changeLanguage(language);
        } catch {
            setError("Could not load the language. Check your connection and refresh to retry.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="language-switcher" role="group" aria-busy={loading} aria-label="Language / भाषा">
            <button
                type="button"
                lang="en"
                aria-pressed={i18n.resolvedLanguage === "en"}
                disabled={loading}
                onClick={() => void selectLanguage("en")}
            >
                English    
            </button>

            <button
                type="button"
                lang="hi"
                aria-pressed={i18n.resolvedLanguage === "hi"}
                disabled={loading}
                onClick={() => void selectLanguage("hi")}
                >
                   हिन्दी
                </button>
            {error && <span className="language-switcher-error" role="alert">{i18n.t(error)}</span>}
        </div>
    );
}