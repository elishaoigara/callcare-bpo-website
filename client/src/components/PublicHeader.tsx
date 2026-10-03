import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import "@/pages/engagement.css";

const links = [
  ["Home", "/"],
  ["Services", "/#services"],
  ["Our Operations", "/operations"],
  ["About", "/#about"],
  ["Contact", "/contact"],
];

export default function PublicHeader({ current }: { current: string }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="cc-header">
      <div className="cc-header-inner">
        <a href="/" aria-label="CallCare BPO home" className="cc-logo">
          <img src="/brand/logo_primary_horizontal.svg" alt="CallCare BPO" />
        </a>
        <nav aria-label="Primary navigation" className="cc-desktop-nav">
          {links.map(([label, href]) => (
            <a
              key={label}
              href={href}
              aria-current={current === href ? "page" : undefined}
            >
              {label}
            </a>
          ))}
        </nav>
        <a
          className="cc-button cc-nav-cta"
          href="/work-with-us"
          aria-current={current === "/work-with-us" ? "page" : undefined}
        >
          Let’s Work Together <ArrowUpRight size={16} />
        </a>
        <button
          type="button"
          className="cc-menu"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="public-mobile-nav"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav
          id="public-mobile-nav"
          aria-label="Mobile navigation"
          className="cc-mobile-nav"
        >
          {links.map(([label, href]) => (
            <a
              key={label}
              href={href}
              aria-current={current === href ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {label}
            </a>
          ))}
          <a
            href="/work-with-us"
            className="cc-button"
            onClick={() => setOpen(false)}
          >
            Let’s Work Together <ArrowUpRight size={16} />
          </a>
        </nav>
      )}
    </header>
  );
}
