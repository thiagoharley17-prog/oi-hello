import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { method } from "@/data/site";

export function Method() {
  return (
    <section id="metodo" className="scroll-mt-24 bg-card">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <Badge variant="secondary" className="mb-4">Como trabalhamos</Badge>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Um caminho claro em cada etapa
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              O atendimento começa com escuta e termina com defesa técnica responsável, mantendo o cliente
              informado e seguro em cada decisão.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {method.map((step, index) => (
              <Card key={step.title} className="rounded-2xl border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
                      {index + 1}
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">{step.title}</p>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
