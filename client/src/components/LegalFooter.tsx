export default function LegalFooter() {
  return (
    <footer className="border-t border-white/15 bg-[#173226] px-5 py-6 text-[#c5d9cd]">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4 text-xs">
        <span>© {new Date().getFullYear()} CallCare BPO</span>
        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap gap-x-6 gap-y-3"
        >
          <a
            href="/operations"
            className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-white"
          >
            Our Operations
          </a>
          <a
            href="/privacy"
            className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-white"
          >
            Privacy Policy
          </a>
          <a
            href="/terms"
            className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-white"
          >
            Terms &amp; Conditions
          </a>
        </nav>
      </div>
    </footer>
  );
}
