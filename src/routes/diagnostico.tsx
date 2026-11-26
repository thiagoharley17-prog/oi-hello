import { useEffect } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { LeadForm } from "@/components/sections/lead-form";
import { useSiteContent } from "@/components/sections/site-content-context";
import { trackFunnelEvent } from "@/lib/telemetry";

export const Route = createFileRoute("/diagnostico")({
  component: Diagnostico,
  head: () => ({
    meta: [
      { title: "Fale com o escritório | HL & Bezerra Advocacia" },
      {
        name: "description",
        content: "Entre em contato com a HL & Bezerra para solicitar atendimento jurídico.",
      },
      { property: "og:title", content: "Fale com o escritório | HL & Bezerra Advocacia" },
    ],
  }),
});

function Diagnostico() {
  const { contact } = useSiteContent();
  useEffect(() => {
    trackFunnelEvent("contact_reached", "diagnostico", "/diagnostico");
  }, []);

  return (
    <section id="formulario" className="scroll-mt-24 bg-secondary">
      <div className="section-wrap grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
          >
            <ArrowLeft size={16} /> Voltar para o início
          </Link>
          <h1 className="section-title mt-8">Fale com o escritório</h1>
          <p className="mt-5 max-w-md leading-7 text-muted-foreground">
            Entre em contato para explicar brevemente o que você precisa e saber quais informações
            podem ajudar na análise do caso.
          </p>
          <a
            href={`https://wa.me/${contact.whatsapp}`}
            onClick={() =>
              trackFunnelEvent("whatsapp_direct_click", "diagnostico_link", "/diagnostico")
            }
            className="mt-6 inline-block font-semibold underline underline-offset-4"
          >
            WhatsApp {contact.phone}
          </a>
        </div>
        <LeadForm />
      </div>
    </section>
  );
}
