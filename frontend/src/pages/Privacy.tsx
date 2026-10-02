import Layout from "../components/Layout";
import DataCollectionNotice from "../components/DataCollectionNotice";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";

export default function Privacy() {
  return (
    <Layout hideNewsletter>
      <PageHero theme="privacy" motif="privacy" eyebrow="Privacy" title="Privacy Policy" description="How the Foundation handles the information you share through this website." />
      <Reveal as="section" className="wrap py-16 max-w-3xl">
        <div className="prose prose-sm max-w-none text-navy-900/80 space-y-4">
          <DataCollectionNotice />
        </div>
      </Reveal>
    </Layout>
  );
}
