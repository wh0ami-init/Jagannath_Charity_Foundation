import LanguageDocument from "./components/LanguageDocument";
import { tr } from "./i18n";
import { useTranslation } from "react-i18next";
import { lazy, Suspense, useState } from "react";
import { Redirect, Route, Switch, useLocation } from "wouter";
import { ImagesProvider } from "./lib/ImagesContext";
import { SiteContentProvider } from "./lib/SiteContentContext";
import WelcomeScreen from "./components/WelcomeScreen";
import { comingSoonSections } from "./lib/comingSoonSections";

const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Programmes = lazy(() => import("./pages/Programmes"));
const Projects = lazy(() => import("./pages/Projects"));
const Partners = lazy(() => import("./pages/Partners"));
const Impact = lazy(() => import("./pages/Impact"));
const Team = lazy(() => import("./pages/Team"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Certificates = lazy(() => import("./pages/Certificates"));
const Donate = lazy(() => import("./pages/Donate"));
const Contact = lazy(() => import("./pages/Contact"));
const Volunteer = lazy(() => import("./pages/Volunteer"));
const Services = lazy(() => import("./pages/Services"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Campaigns = lazy(() => import("./pages/Campaigns"));
const ProgramsAndEvents = lazy(() => import("./pages/ProgramsAndEvents"));
const ProjectExpenses = lazy(() => import("./pages/ProjectExpenses"));
const Careers = lazy(() => import("./pages/Careers"));
const AvailableInternships = lazy(() => import("./pages/AvailableInternships"));
const CertificateVerification = lazy(() => import("./pages/CertificateVerification"));
const ComingSoon = lazy(() => import("./pages/ComingSoon"));
const ActiveBeneficiaries = lazy(() => import("./pages/ActiveBeneficiaries"));
const ApplyBeneficiary = lazy(() => import("./pages/ApplyBeneficiary"));
const AdminLogin = lazy(() => import("./pages/admin/Login"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));

const welcomeScreenEnabled = import.meta.env.VITE_ENABLE_WELCOME_SCREEN === "true";

export default function App() {
  useTranslation();
  const [location] = useLocation();
  const [welcomeVisible, setWelcomeVisible] = useState(() =>
    welcomeScreenEnabled && location === "/",
  );
  const [portalRevealStarted, setPortalRevealStarted] = useState(false);

  return (
    <ImagesProvider>
      <LanguageDocument />
      <SiteContentProvider>
        <div className={`welcome-portal${welcomeVisible && !portalRevealStarted ? " is-covered" : ""}${portalRevealStarted ? " is-revealing" : ""}`}>
          <Suspense fallback={<div className="min-h-screen grid place-items-center text-navy-900/60">{tr("Loading page…")}</div>}>
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
              <Route path="/certificates" component={Certificates} />
              <Route path="/donate" component={Donate} />
              <Route path="/contact" component={Contact} />
              <Route path="/volunteer" component={Volunteer} />
              <Route path="/services" component={Services} />
              <Route path="/campaigns" component={Campaigns} />
              <Route path="/programs-and-events" component={ProgramsAndEvents} />
              <Route path="/project-expenses" component={ProjectExpenses} />
              <Route path="/careers" component={Careers} />
              <Route path="/internships/available" component={AvailableInternships} />
              <Route path="/internships/certificate-verification" component={CertificateVerification} />
              <Route path="/beneficiaries/active" component={ActiveBeneficiaries} />
              <Route path="/beneficiaries/apply" component={ApplyBeneficiary} />
              {comingSoonSections.filter((section) => !["/campaigns", "/programs-and-events", "/project-expenses", "/careers", "/internships/available", "/internships/certificate-verification", "/beneficiaries/active", "/beneficiaries/apply"].includes(section.href)).map((section) => (
                <Route key={section.href} path={section.href}>
                  <ComingSoon section={section} />
                </Route>
              ))}
              <Route path="/privacy-policy" component={Privacy} />
              <Route path="/admin/login" component={AdminLogin} />
              <Route path="/admin" component={AdminDashboard} />
              <Route>
                <div className="min-h-screen flex items-center justify-center text-navy-900/50">
                  {tr("Page not found")}
                </div>
              </Route>
            </Switch>
          </Suspense>
        </div>
        {welcomeVisible && (
          <WelcomeScreen
            onExitStart={() => setPortalRevealStarted(true)}
            onComplete={() => setWelcomeVisible(false)}
          />
        )}
      </SiteContentProvider>
    </ImagesProvider>
  );
}
