import { Link } from "@remix-run/react";

const navigasiLinks = [
  { label: "Beranda", href: "/" },
  { label: "Jelajahi", href: "/jelajahi" },
];

const kategoriLinks = [
  { label: "Seni Musik", href: "/browse/drama-original" },

];

const socialLinks = [
  { label: "YouTube", href: "https://youtube.com", icon: "YT" },
  { label: "Instagram", href: "https://instagram.com", icon: "IG" },
  { label: "Official Website", href: "https://imperviousgeneration.my.id", icon: "IG" },
];

const footerLinks = [
  { label: "Kebijakan Privasi", href: "/kebijakan-privasi" },
  { label: "Ketentuan Layanan", href: "/ketentuan-layanan" },
  { label: "Hak Cipta", href: "/hak-cipta" },
];

export function Footer() {
  return (
    <footer className="border-t border-[#C9A84C]/20 bg-[linear-gradient(180deg,rgba(10,8,4,0.95),rgba(12,10,6,1))] px-4 py-12 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-9 w-9"><img src="/icon-192.webp" alt="Logo" /> </div>
              
              <div className="flex items-center gap-1.5">
                
                <span className="text-base font-bold tracking-widest uppercase text-primary-soft">
                  Impervious Generation
                </span>
                
              </div>
            </Link>

            <p className="max-w-xs text-sm leading-6 text-text-muted">
              Platform streaming eksklusif resmi untuk Panggung Gembira Impervious Generation. Tonton siaran langsung dan arsip video penampilan panggung terbaik di sini.
            </p>

            <div className="flex items-center gap-3 pt-1">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-white/5 text-[10px] font-semibold uppercase tracking-wide text-primary-strong transition hover:border-primary/40 hover:bg-primary/10"
                >
                  {social.icon}
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

          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-strong">Tentang</h4>
            <p className="text-sm leading-6 text-text-muted">
              Semua tayangan diputar lewat platform YouTube.
            </p>
            
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