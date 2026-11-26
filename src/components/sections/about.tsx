import { useSiteContent } from "./site-content-context";
export function About() {
  const { about } = useSiteContent();
  return (
    <section id="escritorio" className="scroll-mt-24 border-b bg-background">
      <div className="section-wrap grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div className="section-reveal border-l-2 border-gold pl-5 sm:pl-7">
          <p className="section-label">O escritório</p>
          <h2 className="section-title">{about.title}</h2>
        </div>
        <div className="section-reveal max-w-2xl space-y-4 text-base leading-8 text-muted-foreground">
          {about.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
