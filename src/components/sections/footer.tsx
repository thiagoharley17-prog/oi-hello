import { Link } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle, Phone, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteMeta, services } from "@/data/site";

export function Footer() {
  return (
    <footer className="border-t bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-4 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold/15 text-gold">
                <Scale className="h-5 w-5" />
              </span>
              <span className="text-lg font-semibold tracking-tight">{siteMeta.brand}</span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-6 text-primary-foreground/75">
              Escritório de advocacia dedicado a defender direitos, proteger interesses e oferecer orientação
              jurídica com compromisso, clareza e excelência profissional.
            </p>
            <a href={siteMeta.whatsapp} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline">
              <MessageCircle className="h-4 w-4 text-gold" />
              Conversar no WhatsApp
            </a>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gold">Navegação</h2>
            <ul className="mt-4 space-y-3 text-sm text-primary-foreground/75">
              <li><Link to="/" className="hover:text-gold">Início</Link></li>
              <li><Link to="/diagnostico" className="hover:text-gold">Falar com o escritório</Link></li>
              <li><a href="/#servicos" className="hover:text-gold">Áreas de atuação</a></li>
              <li><a href="/#faq" className="hover:text-gold">Perguntas frequentes</a></li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gold">Contato</h2>
            <ul className="mt-4 space-y-3 text-sm text-primary-foreground/75">
              <li className="flex items-start gap-2"><Mail className="mt-0.5 h-4 w-4 shrink-0" /><a href={`mailto:${siteMeta.email}`} className="hover:text-gold">{siteMeta.email}</a></li>
              <li className="flex items-start gap-2"><Phone className="mt-0.5 h-4 w-4 shrink-0" />{siteMeta.phone}</li>
              <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />Atendimento em todo o Brasil</li>
            </ul>
            <p className="mt-4 text-xs leading-5 text-primary-foreground/55">{services.length} áreas de atuação</p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-5 border-t border-primary-foreground/15 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-primary-foreground/60">© {new Date().getFullYear()} {siteMeta.legalName}. Todos os direitos reservados.</p>
          <Button asChild variant="secondary" size="lg">
            <Link to="/diagnostico">Solicitar atendimento</Link>
          </Button>
        </div>
      </div>
    </footer>
  );
}
