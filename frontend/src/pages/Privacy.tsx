import Layout from "../components/Layout";

export default function Privacy() {
  return (
    <Layout hideNewsletter>
      <section className="wrap py-16 max-w-3xl">
        <h1 className="text-3xl font-serif-heading font-bold text-navy-950 mb-6">Privacy Policy</h1>
        <div className="prose prose-sm max-w-none text-navy-900/80 space-y-4">
          <h3 className="font-semibold text-navy-950">Data Collection &amp; Consent Notice (DPDP Act, 2023)</h3>
          <p><strong>What data we collect:</strong> We collect your full name, email address, phone number, and transaction details (if donating).</p>
          <p><strong>Why we process it:</strong> This data is processed strictly to facilitate your volunteer application, process your donation, provide tax-exemption receipts (PAN details if applicable), and communicate updates regarding Jagannath Foundation programmes.</p>
          <p><strong>Your Rights:</strong> Providing this data is voluntary. You have the right to access, correct, or erase your personal data, and the right to withdraw your consent at any time. Withdrawal of consent will not affect the legality of processing based on prior consent.</p>
          <p><strong>Grievance Redressal:</strong> To exercise your rights, withdraw consent, or raise a grievance, please contact our Grievance Officer at secretariatjagannathfoundation@gmail.com or +91 97006 43333. If your grievance is not resolved, you have the right to file a complaint with the Data Protection Board of India.</p>
        </div>
      </section>
    </Layout>
  );
}
