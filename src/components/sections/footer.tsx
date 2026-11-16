import { Link } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteMeta } from "@/data/site";

export function Footer() {
  return (
    <footer className="border-t bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-4 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-foreground/10 text-sm font-bold">HL</span>
              <span className="text-lg font-semibold tracking-tight">{siteMeta.brand}</span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-6 text-primary-foreground/75">
              Consultoria e assessoria para empresas que querem organizar a gestão, reduzir riscos e crescer com previsibilidade.
            </p>
            <a href={siteMeta.whatsapp} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline">
              <MessageCircle className="h-4 w-4" />
              Conversar no WhatsApp
            </a>
          </div>

          <div>
            <h2 className="text-sm font-semibold">Navegação</h2>
            <ul className="mt-4 space-y-3 text-sm text-primary-foreground/75">
              <li><Link to="/" className="hover:text-primary-foreground">Início</Link></li>
              <li><Link to="/diagnostico" className="hover:text-primary-foreground">Diagnóstico gratuito</Link></li>
              <li><a href="/#servicos" className="hover:text-primary-foreground">Serviços</a></li>
              <li><a href="/#metodo" className="hover:text-primary-foreground">Método</a></li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold">Contato</h2>
            <ul className="mt-4 space-y-3 text-sm text-primary-foreground/75">
              <li className="flex items-start gap-2"><Mail className="mt-0.5 h-4 w-4 shrink-0" /><a href={`mailto:${siteMeta.email}`} className="hover:text-primary-foreground">{siteMeta.email}</a></li>
              <li className="flex items-start gap-2"><Phone className="mt-0.5 h-4 w-4 shrink-0" />{siteMeta.phone}</li>
              <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />Atendimento em todo o Brasil</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-5 border-t border-primary-foreground/15 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-primary-foreground/60">© {new Date().getFullYear()} {siteMeta.legalName}. Todos os direitos reservados.</p>
          <Button asChild variant="secondary" size="lg">
            <Link to="/diagnostico">Agendar diagnóstico gratuito</Link>
          </Button>
        </div>
      </div>
    </footer>
  );
}
