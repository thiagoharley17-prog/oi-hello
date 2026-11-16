import { Link } from "@tanstack/react-router";
import { Briefcase, Building2, Gavel, HeartHandshake, Landmark, Scale, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { services } from "@/data/site";

const serviceIcons = [Landmark, HeartHandshake, Briefcase, Gavel, ShieldCheck, Building2, Scale];

export function Services() {
  return (
    <section id="servicos" className="scroll-mt-24 bg-secondary/30">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <Badge variant="secondary" className="mb-4">Áreas de atuação</Badge>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Proteção jurídica para cada momento
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Atuação técnica e responsável nas principais áreas do Direito, com orientação próxima,
              linguagem clara e foco na proteção dos seus direitos.
            </p>
            <Button asChild size="lg" className="mt-7">
              <Link to="/diagnostico">
                Falar com o escritório
                <Scale className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {services.map((service, index) => {
              const Icon = serviceIcons[index] ?? Scale;
              return (
                <Card key={service.title} className="group rounded-2xl border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-lg">
                  <CardContent className="p-6 sm:p-7">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-colors group-hover:bg-gold group-hover:text-gold-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold tracking-tight sm:text-xl">{service.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{service.description}</p>
                    <ul className="mt-5 grid gap-2 border-t pt-4 text-sm text-muted-foreground">
                      {service.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export function CtaBanner() {
  return (
    <section className="bg-accent/20">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20 lg:px-8">
        <Card className="relative overflow-hidden rounded-3xl border-0 bg-primary p-8 text-primary-foreground shadow-lg sm:p-10 lg:p-12">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold/15 blur-3xl" aria-hidden="true" />
          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Orientação jurídica</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Seus direitos merecem uma defesa preparada.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-primary-foreground/80">
                Conte sua situação ao escritório. A partir de uma conversa reservada, identificamos o caminho
                jurídico mais seguro para proteger seus interesses.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button asChild variant="secondary" size="lg" className="w-full">
                <Link to="/diagnostico">Solicitar atendimento</Link>
              </Button>
              <p className="text-xs leading-5 text-primary-foreground/70">
                Atendimento inicial com sigilo, clareza e sem compromisso de contratação.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
