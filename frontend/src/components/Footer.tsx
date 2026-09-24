import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-white/70 mt-20">
      <div className="wrap py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <strong className="text-white block mb-2">Jagannath Foundation</strong>
          <p className="text-sm leading-relaxed">
            A public charitable trust working across India. Education, health, youth skills,
            women's livelihoods and household energy reform nationwide.
          </p>
          <p className="text-sm leading-relaxed mt-3">
            Foundation House, Raj Bhavan<br />
            Tapaswini Colony, Near Z1, Nandan Kanan Road<br />
            Bhubaneswar, Khordha 751024
          </p>
        </div>
        <div>
          <strong className="text-white block mb-2">The Foundation</strong>
          <ul className="space-y-1 text-sm">
            <li><Link href="/about" className="hover:text-white">Who we are</Link></li>
            <li><Link href="/work" className="hover:text-white">What we do</Link></li>
            <li><Link href="/impact" className="hover:text-white">Impact</Link></li>
            <li><Link href="/team" className="hover:text-white">Team</Link></li>
            <li><Link href="/gallery" className="hover:text-white">Gallery</Link></li>
          </ul>
        </div>
        <div>
          <strong className="text-white block mb-2">Take part</strong>
          <ul className="space-y-1 text-sm">
            <li><Link href="/donate" className="hover:text-white">Donate</Link></li>
            <li><Link href="/volunteer" className="hover:text-white">Volunteer</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
          </ul>
        </div>
        <div>
          <strong className="text-white block mb-2">Write plainly</strong>
          <p className="text-sm leading-relaxed">
            <a href="tel:+919700643333" className="hover:text-white">+91 97006 43333</a><br />
            <a href="mailto:chairman@jagannathfoundation.charity" className="hover:text-white">
              chairman@jagannathfoundation.charity
            </a><br />
            PAN AAFTJ8006Q<br />
            DARPAN OR/2026/1196699
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="wrap py-4 flex flex-col sm:flex-row justify-between gap-2 text-xs text-white/50">
          <span>Public charitable trust · Established 17 August 2026 · Recorded with DARPAN</span>
          <span>The Trust does not carry on any activity with the object of earning profit.</span>
        </div>
      </div>
    </footer>
  );
}
