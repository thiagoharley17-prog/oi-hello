import { ArrowUpRight } from "lucide-react";
import { siteMeta } from "@/data/site";
import { LeadForm } from "@/components/sections/lead-form";

export function ContactSection() {
  return (
    <section id="contato" className="scroll-mt-24 bg-secondary">
      <div className="section-wrap grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div className="section-reveal">
          <h2 className="section-title mt-0">Fale com o escritório</h2>
          <a
            href={siteMeta.whatsapp}
            className="mt-6 inline-flex items-center gap-2 font-semibold underline underline-offset-4"
          >
            WhatsApp {siteMeta.phone} <ArrowUpRight size={16} />
          </a>
          <address className="mt-8 space-y-4 text-sm not-italic leading-6 text-muted-foreground">
            <p>
              <strong className="text-foreground">São Paulo, SP</strong>
              <br />
              Rua Emílio Colella, 52, sala 02, Parque São Domingos
            </p>
            <p>
              <strong className="text-foreground">Cajamar, SP</strong>
              <br />
              Rua Avelino Toleto de Lima, 258, casa 02
            </p>
          </address>
        </div>
        <div className="section-reveal">
          <LeadForm />
        </div>
      </div>
    </section>
  );
}
