import { policies } from "@/data/policies";

function Paragraphs({ lines }: { lines: readonly string[] }) {
  const blocks = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("* ")) {
      const items = [line.slice(2)];
      while (lines[i + 1]?.startsWith("* ")) items.push(lines[++i].slice(2));
      blocks.push(
        <ul key={i} className="my-4 list-disc space-y-2 pl-6">
          {items.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    } else if (line.startsWith("### ")) {
      blocks.push(
        <h3 key={i} className="mt-6 text-lg font-semibold text-[#173226]">
          {line.slice(4)}
        </h3>
      );
    } else {
      blocks.push(
        <p key={i} className="my-4">
          {line.includes("info@callcarebpo.com") ? (
            <>
              {line.split("info@callcarebpo.com")[0]}
              <a
                href="mailto:info@callcarebpo.com"
                className="underline underline-offset-4"
              >
                info@callcarebpo.com
              </a>
            </>
          ) : (
            line
          )}
        </p>
      );
    }
  }
  return <>{blocks}</>;
}

export default function Legal({ kind }: { kind: keyof typeof policies }) {
  const policy = policies[kind];

  return (
    <div className="min-h-screen bg-[#fbfdfc] text-[#173226]">
      <header className="border-b border-[#c4d6cb] px-5 py-5 lg:px-10">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
          <a href="/" className="font-display text-xl font-bold">
            CALLCARE <span className="text-[#338461]">BPO</span>
          </a>
          <a
            href="/"
            className="text-sm font-semibold underline underline-offset-4"
          >
            Back to main website
          </a>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-12 sm:py-20 lg:px-10">
        <p className="text-xs font-bold uppercase tracking-widest text-[#516b5e]">
          CallCare BPO / Legal
        </p>
        <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight sm:text-6xl">
          {policy.title}
        </h1>
        <p className="mt-5 text-sm text-[#516b5e]">
          Last updated: <time dateTime="2026-09-15">15 September 2026</time>
        </p>
        <nav
          aria-label="Policy contents"
          className="my-10 border-y border-[#c4d6cb] py-6"
        >
          <h2 className="mb-4 font-semibold">On this page</h2>
          <ol className="grid list-inside list-decimal gap-3 text-sm sm:grid-cols-2">
            {policy.sections.map((section, i) => (
              <li key={section.title}>
                <a
                  className="underline underline-offset-4 hover:text-[#338461]"
                  href={`#section-${i + 1}`}
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <article className="max-w-3xl text-base leading-8 text-[#405b4e]">
          <Paragraphs lines={policy.intro} />
          {policy.sections.map((section, i) => (
            <section
              key={section.title}
              id={`section-${i + 1}`}
              className="scroll-mt-8 border-t border-[#c4d6cb] pt-7 mt-9"
            >
              <h2 className="font-display text-2xl font-semibold leading-snug text-[#173226]">
                {i + 1}. {section.title}
              </h2>
              <Paragraphs lines={section.lines} />
            </section>
          ))}
        </article>
      </main>
    </div>
  );
}
