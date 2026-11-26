import { useEffect, useRef } from "react";

import { Home } from "@/components/sections/home";
import { Services } from "@/components/sections/services";
import { About } from "@/components/sections/about";
import { Blog } from "@/components/sections/blog";
import { Team } from "@/components/sections/team";
import { Trust } from "@/components/sections/trust";
import { ContactSection } from "@/components/sections/contact";

import { useSiteContent } from "./site-content-context";
import type { SiteContent } from "@/lib/site-content";

const sectionComponents = {
  home: Home,
  about: About,
  services: Services,
  team: Team,
  blog: Blog,
  faq: Trust,
};

export function HomePage({ preview = false }: { preview?: boolean }) {
  const { sections } = useSiteContent();
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const page = pageRef.current;
    if (preview || !page || !("IntersectionObserver" in window)) return;

    const targets = Array.from(page.querySelectorAll<HTMLElement>(".section-reveal"));
    const observer = new IntersectionObserver((entries) => {
      for (const { target, isIntersecting } of entries) {
        if (!isIntersecting) continue;

        target.setAttribute("data-reveal", "visible");
        observer.unobserve(target);
      }
    });

    for (const target of targets) {
      if (target.getBoundingClientRect().top >= window.innerHeight) {
        target.setAttribute("data-reveal", "pending");
        observer.observe(target);
      }
    }

    return () => {
      observer.disconnect();
      for (const target of targets) target.removeAttribute("data-reveal");
    };
  }, [sections, preview]);

  return (
    <div ref={pageRef} className="flex flex-col">
      {sections
        .filter((section) => section.enabled)
        .map((section) => {
          if (section.kind === "custom")
            return <CustomSection key={section.id} section={section} />;
          if (section.kind === "contact")
            return <ContactSection key={section.id} preview={preview} />;
          const Section = sectionComponents[section.kind];
          return <Section key={section.id} />;
        })}
    </div>
  );
}

function CustomSection({
  section,
}: {
  section: Extract<SiteContent["sections"][number], { kind: "custom" }>;
}) {
  return (
    <section id={section.id} className="scroll-mt-24 border-b bg-background">
      <div className="section-wrap">
        <div className="section-reveal max-w-3xl">
          <h2 className="section-title mt-0">{section.title}</h2>
          {section.text && <p className="mt-4 whitespace-pre-line leading-7">{section.text}</p>}
        </div>
        {section.image && (
          <img
            className="section-reveal mt-6 max-h-96 w-full object-cover"
            src={section.image}
            alt={section.title}
            loading="lazy"
          />
        )}
        {section.cards.length > 0 && (
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {section.cards.map((card) => (
              <li
                key={card.id}
                className="section-reveal interactive-card overflow-hidden border border-border"
              >
                {card.image && (
                  <img
                    className="aspect-video w-full object-cover"
                    src={card.image}
                    alt=""
                    loading="lazy"
                  />
                )}
                <div className="p-5">
                  <h3 className="font-display text-2xl">{card.title}</h3>
                  <p className="mt-2 whitespace-pre-line leading-7">{card.text}</p>
                  {card.link && (
                    <a className="mt-4 inline-block font-semibold underline" href={card.link}>
                      Saiba mais<span className="sr-only"> sobre {card.title}</span>
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
