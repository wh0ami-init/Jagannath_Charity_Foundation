import type { ReactNode } from "react";
import Layout from "../components/Layout";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import "./privacy.css";

const contents = [
  ["information", "Information you share"],
  ["purposes", "How we use it"],
  ["payments", "Payments"],
  ["sharing", "Who can access it"],
  ["retention", "Storage & retention"],
  ["security", "Security & cookies"],
  ["your-choices", "Your choices"],
  ["children", "Children’s privacy"],
  ["changes", "Policy updates"],
] as const;

export default function Privacy() {
  return (
    <Layout hideNewsletter>
      <div className="privacy-page">
        <PageHero
          theme="privacy"
          motif="privacy"
          eyebrow="The Foundation"
          title="Your information, handled with care."
          description="A plain-language guide to the personal information this website receives, why we use it, and how to contact us about it."
          facts={[
            { value: "Only what you submit", label: "Collection" },
            { value: "No advertising trackers", label: "Public pages" },
            { value: "You can contact us", label: "Requests" },
          ]}
        />

        <div className="wrap privacy-layout">
          <aside className="privacy-sidebar" aria-label="Privacy policy contents">
            <div className="privacy-sidebar-card">
              <p className="privacy-kicker">On this page</p>
              <nav>
                {contents.map(([id, label], index) => (
                  <a href={`#${id}`} key={id}>
                    <span>{String(index + 1).padStart(2, "0")}</span>{label}
                  </a>
                ))}
              </nav>
              <p className="privacy-reviewed">Last reviewed · 10 October 2026</p>
            </div>
          </aside>

          <div className="privacy-content">
            <Reveal className="privacy-opening">
              <p className="privacy-kicker">A clear promise</p>
              <h2>We ask for details to respond and keep the work moving.</h2>
              <p>
                The Foundation does not sell personal information. We limit its use to the request, pledge, volunteer interest or update request you send us, and to the operation and security of this website.
              </p>
            </Reveal>

            <PolicySection id="information" number="01" title="Information you share">
              <p>Depending on the form, you may choose to provide:</p>
              <ul>
                <li><strong>Contact:</strong> your name, email address, phone number, subject and message.</li>
                <li><strong>Volunteering:</strong> contact details, district or city, skills and the interests you describe.</li>
                <li><strong>Pledges:</strong> contact details, a named cause and an optional pledge amount. A pledge is an expression of interest, not a payment.</li>
                <li><strong>Programme updates:</strong> your email address and consent to be contacted. Update emails are not sent automatically by the current site.</li>
                <li><strong>Community portal requests:</strong> contact details, district or city, selected service and the message you send.</li>
              </ul>
              <p>
                The form asks for an email address and your consent before it can be submitted. Please avoid including sensitive information that is not needed to answer your request. If you email or call the Foundation directly, the details you choose to share are also received by the relevant team.
              </p>
              <p>
                For abuse prevention, the website’s server temporarily processes network information such as an IP address when applying request limits. Hosting infrastructure may also handle technical request data under its own operating and security practices.
              </p>
            </PolicySection>

            <PolicySection id="purposes" number="02" title="How we use it">
              <p>We use submitted information to:</p>
              <ul>
                <li>reply to messages and community service requests;</li>
                <li>follow up on volunteer interest or a donation pledge;</li>
                <li>record a request for programme updates;</li>
                <li>maintain the website, prevent misuse and protect administrative access; and</li>
                <li>meet legal or accounting obligations where they apply.</li>
              </ul>
              <p>
                We do not use a pledge as evidence that a payment has been made. We do not use the newsletter form to send recurring emails automatically at this time.
              </p>
            </PolicySection>

            <PolicySection id="payments" number="03" title="Payments">
              <div className="privacy-callout">
                <span className="privacy-callout-mark" aria-hidden="true">₹</span>
                <p>
                  <strong>The current online checkout is in test mode.</strong>
                  It is configured for a ₹100 test transaction and is not a live donation service. Do not treat a test checkout as a real donation or tax receipt.
                </p>
              </div>
              <p>
                If you open the test checkout, Razorpay processes the checkout interaction under its own privacy terms. The Foundation’s payment database stores the test amount, currency, Razorpay order and payment identifiers, status and timestamps. The website does not store card numbers, bank login credentials or PAN in that payment record.
              </p>
              <p>
                Bank transfers are arranged directly by you through your bank. If you email the Foundation to identify a transfer or request a receipt, the details in that email are handled as correspondence. A payment confirmation and any applicable tax certificate are separate documents; the current site does not automatically email either one.
              </p>
            </PolicySection>

            <PolicySection id="sharing" number="04" title="Who can access it">
              <p>
                Form submissions are available to authenticated Foundation administrators so they can respond and manage requests. Service providers may process technical information to host, secure and deliver the site. Google Fonts is loaded from Google’s font service; Razorpay is contacted only when someone starts the online test checkout.
              </p>
              <p>
                We do not sell personal information or share it for advertising. We may disclose information if required by law or to protect the website, its users or the Foundation from misuse.
              </p>
            </PolicySection>

            <PolicySection id="retention" number="05" title="Storage & retention">
              <p>
                Form submissions are stored in the website database and remain there until an authorized administrator deletes them. The administrator can remove a submission from the site inbox. Copies held in infrastructure backups may remain until those backups expire under the relevant provider’s schedule.
              </p>
              <p>
                Payment records are currently test transactions. The application does not yet apply an automatic deletion schedule to them. The Foundation should set a retention period before enabling live online donations.
              </p>
            </PolicySection>

            <PolicySection id="security" number="06" title="Security & cookies">
              <p>
                The site uses authenticated administrator access and technical safeguards intended to protect the information it stores. No internet service can promise that transmission or storage is risk-free; please contact us if you believe your information has been exposed.
              </p>
              <p>
                Public pages do not currently use advertising or analytics trackers. An essential, HTTP-only session cookie is used when an administrator signs in. The browser may also contact external services that provide site fonts or payment checkout.
              </p>
            </PolicySection>

            <PolicySection id="your-choices" number="07" title="Your choices">
              <p>
                You can choose not to submit a form. You may also ask us to provide a copy of information you sent, correct it, delete it or stop using it for a request. If you asked for programme updates, you can withdraw that request. We will review and handle requests under the requirements that apply.
              </p>
              <p>
                Contact the Foundation at <a href="mailto:secretariatjagannathfoundation@gmail.com">secretariatjagannathfoundation@gmail.com</a> or <a href="tel:+919700643333">+91 97006 43333</a>. Please tell us which form or request you are referring to so we can locate it.
              </p>
            </PolicySection>

            <PolicySection id="children" number="08" title="Children’s privacy">
              <p>
                This website’s forms are intended for people able to make their own request. Please do not submit a child’s personal details unless you are authorized to do so. If you believe a child’s information was sent to us by mistake, contact the Foundation and ask us to review it.
              </p>
            </PolicySection>

            <PolicySection id="changes" number="09" title="Policy updates">
              <p>
                We may update this notice when the website or its data practices change. The review date at the top of this page shows the latest revision. If a change affects a form’s purpose or the information it asks for, the form notice should be updated as well.
              </p>
            </PolicySection>

            <Reveal className="privacy-contact-card">
              <div>
                <p className="privacy-kicker">Questions or requests</p>
                <h2>Talk to the Foundation.</h2>
                <p>Include the email address you used and the type of request you sent. We’ll route it to the right person.</p>
              </div>
              <div className="privacy-contact-actions">
                <a href="mailto:secretariatjagannathfoundation@gmail.com">Email the secretariat <span aria-hidden="true">↗</span></a>
                <a href="tel:+919700643333">Call +91 97006 43333</a>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function PolicySection({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <Reveal as="section" className="privacy-policy-section" aria-labelledby={`${id}-heading`}>
      <p className="privacy-kicker">{number} · Privacy practice</p>
      <h2 id={`${id}-heading`}>{title}</h2>
      <div className="privacy-policy-copy" id={id}>{children}</div>
    </Reveal>
  );
}
