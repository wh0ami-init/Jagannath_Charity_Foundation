import { tr } from "../i18n";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
export default function LanguageDocument() {
 const [location] = useLocation(); const { i18n } = useTranslation();
 useEffect(() => {
   const admin = location.startsWith("/admin");
   document.documentElement.lang = admin ? "en" : (i18n.resolvedLanguage || "en");
   const title = "Jagannath Foundation | Service with dignity";
   document.title = admin ? title : tr(title);
 }, [location, i18n.resolvedLanguage]);
 return null;
}
