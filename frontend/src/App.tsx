import { Route, Switch } from "wouter";
import { ImagesProvider } from "./lib/ImagesContext";
import { SiteContentProvider } from "./lib/SiteContentContext";
import Home from "./pages/Home";
import About from "./pages/About";
import Work from "./pages/Work";
import Impact from "./pages/Impact";
import Team from "./pages/Team";
import Gallery from "./pages/Gallery";
import Donate from "./pages/Donate";
import Contact from "./pages/Contact";
import Volunteer from "./pages/Volunteer";
import Privacy from "./pages/Privacy";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";

export default function App() {
  return (
    <ImagesProvider>
      <SiteContentProvider>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/work" component={Work} />
        <Route path="/impact" component={Impact} />
        <Route path="/team" component={Team} />
        <Route path="/gallery" component={Gallery} />
        <Route path="/donate" component={Donate} />
        <Route path="/contact" component={Contact} />
        <Route path="/volunteer" component={Volunteer} />
        <Route path="/privacy-policy" component={Privacy} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin" component={AdminDashboard} />
        <Route>
          <div className="min-h-screen flex items-center justify-center text-navy-900/50">
            Page not found
          </div>
        </Route>
      </Switch>
      </SiteContentProvider>
    </ImagesProvider>
  );
}
