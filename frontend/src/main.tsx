import "./i18n"
import { tr } from "./i18n";
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={<div role="status" className="min-h-screen grid place-items-center">{tr("Loading…")}</div>}>
      <App />
    </Suspense>
  </StrictMode>
);
