import { useSiteContent } from "./site-content-context";
import { useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { LeadForm } from "@/components/sections/lead-form";
import { trackFunnelEvent } from "@/lib/telemetry";

export function ContactSection({ preview = false }: { preview?: boolean }) {
  const { contact } = useSiteContent();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (preview || !el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          trackFunnelEvent("contact_reached", "contact_section");
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [preview]);

  return (
    <section ref={sectionRef} id="contato" className="scroll-mt-24 bg-secondary">
      <div className="section-wrap grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div className="section-reveal">
          <h2 className="section-title mt-0">{contact.title}</h2>
          <a
            href={`https://wa.me/${contact.whatsapp}`}
            onClick={() => trackFunnelEvent("whatsapp_direct_click", "contact_link")}
            className="mt-6 inline-flex items-center gap-2 font-semibold underline underline-offset-4"
          >
            WhatsApp {contact.phone} <ArrowUpRight size={16} />
          </a>
          <address className="mt-8 space-y-4 text-sm not-italic leading-6 text-muted-foreground">
            {contact.addresses.map(({ city, address }, index) => (
              <p key={index}>
                <strong className="text-foreground">{city}</strong>
                <br />
                {address}
              </p>
            ))}
          </address>
        </div>
        <div className="section-reveal">
          {preview ? <p className="border p-5">Formulário de contato</p> : <LeadForm />}
        </div>
      </div>
    </section>
  );
}
