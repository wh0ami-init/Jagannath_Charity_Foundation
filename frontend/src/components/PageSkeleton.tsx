import Header from "./Header";
import { tr } from "../i18n";

export default function PageSkeleton({ publicPage }: { publicPage: boolean }) {
  return (
    <div className="min-h-screen bg-navy-50">
      {publicPage && <Header />}
      <main className="wrap py-16" role="status">
        <span className="sr-only">{tr("Loading page…")}</span>
        <div aria-hidden="true" className="space-y-6 motion-safe:animate-pulse">
          <div className="h-3 w-28 rounded bg-navy-200" />
          <div className="h-12 w-3/4 max-w-2xl rounded bg-navy-200" />
          <div className="h-4 w-2/3 max-w-lg rounded bg-navy-100" />
          <div className="grid gap-5 pt-8 sm:grid-cols-3">
            {[0, 1, 2].map(card => <div key={card} className="h-40 rounded-xl bg-navy-100" />)}
          </div>
        </div>
      </main>
    </div>
  );
}
