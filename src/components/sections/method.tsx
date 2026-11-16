import { Link } from "@tanstack/react-router";
import { ArrowRight, Compass, FileText, Rocket, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { benefits, method } from "@/data/site";

const icons = [Compass, FileText, TrendingUp, Rocket];

export function Method() {
  return (
    <section id="metodo" className="scroll-mt-24">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <Badge variant="secondary" className="mb-4">Como funciona</Badge>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Método simples para gestão mais sólida
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Não vendemos relatórios. A entrega é prática: prioridade, responsáveis, prazos e indicadores.
              O objetivo é que a empresa saia do improviso e passe a operar com clareza.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-1">
              {benefits.map((benefit) => (
                <Card key={benefit.title} className="rounded-2xl border-0 shadow-sm">
                  <CardContent className="p-5 sm:p-6">
                    <h3 className="text-base font-semibold">{benefit.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button asChild size="lg" className="mt-6">
              <Link to="/diagnostico">
                Começar agora
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-5">
            {method.map((step, index) => {
              const Icon = icons[index % icons.length];
              return (
                <Card key={step.title} className="rounded-2xl border-0 shadow-sm">
                  <CardHeader className="space-y-3 p-6 sm:p-7">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold sm:text-lg">{step.title}</CardTitle>
                      </div>
                    </div>
                    <CardDescription className="text-sm leading-6">{step.description}</CardDescription>
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
