import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, LockKeyhole, Scale, ShieldCheck, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { siteMeta } from "@/data/site";

export function Home() {
  return (
    <div>
      <section className="relative overflow-hidden border-b bg-card">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-primary" aria-hidden="true" />
        <div className="absolute -right-20 top-10 hidden h-80 w-80 rounded-full bg-gold/10 blur-3xl lg:block" aria-hidden="true" />
        <div className="absolute -left-20 bottom-10 hidden h-80 w-80 rounded-full bg-primary/5 blur-3xl lg:block" aria-hidden="true" />

        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-24">
          <div className="animate-fade-up">
            <Badge variant="secondary" className="mb-6 gap-2 px-3 py-1.5 text-primary">
              <Scale className="h-3.5 w-3.5 text-gold" />
              Escritório de Advocacia
            </Badge>
            <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Defendemos seus direitos com <span className="text-gold">compromisso</span> e <span className="text-gold">excelência</span>.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              Advocacia dedicada a proteger seus interesses e garantir seus direitos, com orientação jurídica responsável,
              sigilo profissional e confiança entre advogado e cliente.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/diagnostico">
                  {siteMeta.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <a href={siteMeta.whatsapp} target="_blank" rel="noreferrer">
                  <MessageCircle className="h-4 w-4" />
                  Falar no WhatsApp
                </a>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-gold" />Atendimento humano</span>
              <span className="flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-gold" />Sigilo profissional</span>
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-gold" />Defesa com responsabilidade</span>
            </div>
          </div>

          <Card className="animate-fade-in overflow-hidden rounded-3xl border border-gold/25 bg-primary text-primary-foreground shadow-xl">
            <CardContent className="p-0">
              <div className="relative p-7 sm:p-9">
                <div className="absolute right-7 top-7 grid h-12 w-12 place-items-center rounded-2xl bg-primary-foreground/10 text-gold">
                  <Scale className="h-6 w-6" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Proposta institucional</p>
                <h2 className="mt-4 max-w-md text-2xl font-semibold leading-tight sm:text-3xl">
                  Você merece uma defesa firme, cuidadosa e alinhada aos seus direitos.
                </h2>
                <p className="mt-4 max-w-lg text-sm leading-6 text-primary-foreground/80 sm:text-base">
                  A HL & Bezerra une técnica jurídica e proximidade para acompanhar cada caso com seriedade,
                  clareza e compromisso com o resultado.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {[
                    ["Direitos protegidos", "Sua defesa com base técnica"],
                    ["Sigilo", "Confidencialidade absoluta"],
                    ["Proximidade", "Advogado e cliente"],
                    ["Compromisso", "Atuação responsável"],
                  ].map(([title, text]) => (
                    <div key={title} className="rounded-2xl bg-primary-foreground/8 p-4">
                      <p className="text-sm font-semibold">{title}</p>
                      <p className="mt-1 text-xs text-primary-foreground/70">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-b bg-card">
        <div className="mx-auto grid max-w-6xl gap-px bg-border px-0 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Defesa dos direitos", "Acompanhamento jurídico responsável"],
            ["Sigilo profissional", "Relação ética e confidencial"],
            ["Orientação clara", "Você entende cada etapa"],
            ["Excelência técnica", "Rigor e compromisso"],
          ].map(([title, text]) => (
            <div key={title} className="bg-card px-6 py-7 text-center">
              <p className="text-sm font-semibold">{title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
