import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Newsletter from "./Newsletter";

export default function Layout({
  children,
  hideNewsletter = false,
}: {
  children: ReactNode;
  hideNewsletter?: boolean;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      {!hideNewsletter && <Newsletter />}
      <Footer />
    </div>
  );
}
