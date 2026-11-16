import { Link } from "@tanstack/react-router";
import { Briefcase, CheckCircle2, Gavel, Gauge, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { services } from "@/data/site";

export function Services() {
  return (
    <section id="servicos" className="scroll-mt-24 bg-secondary/25">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <Badge variant="secondary" className="mb-4">Nossos serviços</Badge>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Soluções práticas para a gestão do seu negócio
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Atuação próxima, com foco em organização, risco e decisão. Tudo para que a empresa opere com mais segurança,
              previsibilidade e capacidade de crescer.
            </p>
          </div>

          <div className="grid gap-5">
            {services.map((service, index) => {
              const Icon = index === 0 ? Briefcase : index === 1 ? Gavel : index === 2 ? Gauge : ShieldCheck;
              return (
                <Card key={service.title} className="rounded-2xl border-0 shadow-sm">
                  <CardHeader className="flex flex-col gap-4 space-y-0 p-6 sm:px-7 sm:py-7">
                    <div className="flex items-start gap-4">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg sm:text-xl">{service.title}</CardTitle>
                        <CardDescription className="mt-2 text-sm">{service.description}</CardDescription>
                      </div>
                    </div>
                    <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                      {service.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </CardHeader>
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
    <section className="bg-accent/25">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20 lg:px-8">
        <Card className="rounded-3xl border-0 bg-primary p-8 text-primary-foreground shadow-lg sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Sua empresa precisa de mais clareza e confiança para decidir?
              </h2>
              <p className="mt-4 max-w-2xl text-base text-primary-foreground/80">
                Comece com um diagnóstico objetivo para entender prioridades, riscos e as ações que mais impactam o resultado.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button asChild variant="secondary" size="lg" className="w-full">
                <Link to="/diagnostico">Agendar diagnóstico gratuito</Link>
              </Button>
              <p className="text-xs text-primary-foreground/70">
                Atendimento consultivo, com foco em resultado e próxima ação.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
