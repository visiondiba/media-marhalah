import { Link } from "@remix-run/react";

const navigasiLinks = [
  { label: "Beranda", href: "/" },
  { label: "Jelajahi", href: "/jelajahi" },
];

const kategoriLinks = [
  { label: "Seni Musik", href: "/browse/drama-original" },

];

const socialLinks = [
  { label: "YouTube", href: "https://youtube.com", type: "youtube" as const },
  { label: "Instagram", href: "https://instagram.com", type: "instagram" as const },
  { label: "Official Website", href: "https://imperviousgeneration.my.id", type: "website" as const },
];

const footerLinks = [
  { label: "Kebijakan Privasi", href: "/kebijakan-privasi" },
  { label: "Ketentuan Layanan", href: "/ketentuan-layanan" },
  { label: "Hak Cipta", href: "/hak-cipta" },
];

function SocialIcon({ type }: { type: "youtube" | "instagram" | "website" }) {
  switch (type) {
    case "youtube":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M23.5 7.2a2.9 2.9 0 0 0-2.1-2.1C19.5 4.7 12 4.7 12 4.7s-7.5 0-9.4.4A2.9 2.9 0 0 0 .5 7.2 29.8 29.8 0 0 0 0 12a29.8 29.8 0 0 0 .5 4.8 2.9 2.9 0 0 0 2.1 2.1c1.9.4 9.4.4 9.4.4s7.5 0 9.4-.4a2.9 2.9 0 0 0 2.1-2.1A29.8 29.8 0 0 0 24 12a29.8 29.8 0 0 0-.5-4.8ZM9.5 15.5V8.5l6.5 3.5-6.5 3.5Z" />
        </svg>
      );
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
          <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
          <path d="M16.5 7.5h.01" />
          <path d="M7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0Z" />
        </svg>
      );
    case "website":
      return (
        <img src="/logo.png" alt="Logo" className="h-4 w-4" />
      );
    default:
      return null;
  }
}

export function Footer() {
  return (
    <footer className="border-t border-[#C9A84C]/20 bg-[linear-gradient(180deg,rgba(10,8,4,0.95),rgba(12,10,6,1))] px-4 py-12 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-9 w-9"><img src="/logo.png" alt="Logo" /> </div>

              <div className="flex items-center gap-1.5">

                <h1 className="text-2xl font-black lowercase text-secondary-soft">
                  catalyst<span className="text-[#C9A84C] uppercase">STREAM</span>
                </h1>

              </div>
            </Link>

            <p className="max-w-xs text-sm leading-6 text-text-muted">
              Platform streaming eksklusif resmi untuk Panggung Gembira 6101 ~ Impervious Generation. Tonton siaran langsung dan arsip video penampilan panggung terbaik di sini.
            </p>

            <div className="flex items-center gap-3 pt-1">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-white/5 text-primary-strong transition hover:border-primary/40 hover:bg-primary/10"
                >
                  <SocialIcon type={social.type} />
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-strong">Navigasi</h4>
            <ul className="space-y-3 text-sm text-text-muted">
              {navigasiLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="transition hover:text-primary-strong">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>


        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-text-muted sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} Impervious Play. Seluruh hak cipta konten dimiliki oleh
            tim media Impervious Generation.
          </p>
          <div className="flex flex-wrap items-center gap-5">
            {footerLinks.map((link) => (
              <Link key={link.label} to={link.href} className="transition hover:text-primary-strong">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}