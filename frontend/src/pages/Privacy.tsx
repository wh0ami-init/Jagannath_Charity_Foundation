import Layout from "../components/Layout";
import Reveal from "../components/Reveal";

export default function Privacy() {
  return (
    <Layout hideNewsletter>
      <Reveal as="section" className="wrap py-16 max-w-3xl">
        <h1 className="text-3xl font-serif-heading font-bold text-navy-950 mb-6">Privacy Policy</h1>
        <div className="prose prose-sm max-w-none text-navy-900/80 space-y-4">
          <h3 className="font-semibold text-navy-950">Data Collection &amp; Consent Notice (DPDP Act, 2023)</h3>
          <p><strong>What data we collect:</strong> If you submit a form, the Foundation stores the details you provide, such as your name, email, phone, message, volunteering interests, or pledge amount and cause. The website does not collect payment card details or PAN through its forms.</p>
          <p><strong>Why we process it:</strong> Form details are used by the Foundation team to respond to messages, follow up on volunteer interest or pledges, and manage requests for programme updates. A pledge form records an expression of interest only; it does not make a payment.</p>
          <p><strong>Access and deletion:</strong> Submissions are stored in the Foundation's website database and can be viewed by an authenticated site administrator. They remain there until an administrator deletes them. To request a copy, correction or deletion, or to withdraw consent, contact the Foundation at secretariatjagannathfoundation@gmail.com or +91 97006 43333.</p>
          <p><strong>Grievance Redressal:</strong> To exercise your rights, withdraw consent, or raise a grievance, please contact our Grievance Officer at secretariatjagannathfoundation@gmail.com or +91 97006 43333. If your grievance is not resolved, you have the right to file a complaint with the Data Protection Board of India.</p>
        </div>
      </Reveal>
    </Layout>
  );
}
