import { lazy, Suspense, useCallback, useState } from "react";
import { Redirect, Route, Switch, useLocation } from "wouter";
import { ImagesProvider } from "./lib/ImagesContext";
import { SiteContentProvider } from "./lib/SiteContentContext";
import WelcomeScreen from "./components/WelcomeScreen";

const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Programmes = lazy(() => import("./pages/Programmes"));
const Projects = lazy(() => import("./pages/Projects"));
const Partners = lazy(() => import("./pages/Partners"));
const Impact = lazy(() => import("./pages/Impact"));
const Team = lazy(() => import("./pages/Team"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Donate = lazy(() => import("./pages/Donate"));
const Contact = lazy(() => import("./pages/Contact"));
const Volunteer = lazy(() => import("./pages/Volunteer"));
const Services = lazy(() => import("./pages/Services"));
const Privacy = lazy(() => import("./pages/Privacy"));
const AdminLogin = lazy(() => import("./pages/admin/Login"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));

const welcomeScreenEnabled = import.meta.env.VITE_ENABLE_WELCOME_SCREEN === "true";

export default function App() {
  const [location] = useLocation();
  const [welcomeVisible, setWelcomeVisible] = useState(() =>
    welcomeScreenEnabled && location === "/",
  );
  const [portalRevealStarted, setPortalRevealStarted] = useState(false);
  const finishWelcome = useCallback(() => setWelcomeVisible(false), []);
  const startPortalReveal = useCallback(() => setPortalRevealStarted(true), []);

  return (
    <ImagesProvider>
      <SiteContentProvider>
        <div className={`welcome-portal${welcomeVisible && !portalRevealStarted ? " is-covered" : ""}${portalRevealStarted ? " is-revealing" : ""}`}>
          <Suspense fallback={<div className="min-h-screen grid place-items-center text-navy-900/60">Loading page…</div>}>
            <Switch>
              <Route path="/">
                <Home isWelcomeVisible={welcomeVisible} />
              </Route>
              <Route path="/about" component={About} />
              <Route path="/programmes" component={Programmes} />
              <Route path="/work">
                <Redirect to={`/programmes${window.location.search}${window.location.hash}`} />
              </Route>
              <Route path="/projects" component={Projects} />
              <Route path="/partners" component={Partners} />
              <Route path="/impact" component={Impact} />
              <Route path="/team" component={Team} />
              <Route path="/gallery" component={Gallery} />
              <Route path="/donate" component={Donate} />
              <Route path="/contact" component={Contact} />
              <Route path="/volunteer" component={Volunteer} />
              <Route path="/services" component={Services} />
              <Route path="/privacy-policy" component={Privacy} />
              <Route path="/admin/login" component={AdminLogin} />
              <Route path="/admin" component={AdminDashboard} />
              <Route>
                <div className="min-h-screen flex items-center justify-center text-navy-900/50">
                  Page not found
                </div>
              </Route>
            </Switch>
          </Suspense>
        </div>
        {welcomeVisible && <WelcomeScreen onExitStart={startPortalReveal} onComplete={finishWelcome} />}
      </SiteContentProvider>
    </ImagesProvider>
  );
}
