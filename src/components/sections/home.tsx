import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Clock3, LockKeyhole, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { siteMeta } from "@/data/site";

export function Home() {
  return (
    <div>
      <section className="relative overflow-hidden border-b bg-secondary/20">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-accent/40 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-24">
          <div>
            <Badge variant="secondary" className="mb-6 gap-1.5 px-3 py-1 text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Consultoria com visão de resultado
            </Badge>
            <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Gestão segura para empresas que querem <span className="text-primary">crescer com confiança</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              Estratégia, governança e assessoria jurídica empresarial para transformar complexidade em decisões claras,
              processos organizados e resultados mais previsíveis.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/diagnostico">
                  Solicitar diagnóstico gratuito
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
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" />Primeira conversa sem custo</span>
              <span className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-primary" />Resposta rápida</span>
              <span className="flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-primary" />Atendimento confidencial</span>
            </div>
          </div>

          <Card className="overflow-hidden rounded-3xl border-0 bg-primary text-primary-foreground shadow-xl">
            <CardContent className="p-0">
              <div className="relative p-7 sm:p-9">
                <div className="absolute right-7 top-7 grid h-12 w-12 place-items-center rounded-2xl bg-primary-foreground/10">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/70">Carta de confiança</p>
                <h2 className="mt-4 max-w-md text-2xl font-semibold leading-tight sm:text-3xl">
                  Você não precisa descobrir como resolver tudo sozinho.
                </h2>
                <p className="mt-4 max-w-lg text-sm leading-6 text-primary-foreground/75 sm:text-base">
                  Nossa equipe conecta estratégia, jurídico e execução para reduzir incerteza e criar um plano que cabe na realidade da sua empresa.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {[
                    ["Clareza", "Você entende o que fazer agora."],
                    ["Controle", "Riscos deixam de ser surpresas."],
                    ["Agilidade", "Decisões saem da indecisão."],
                    ["Confiança", "Crescimento com menos ruído."],
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
            ["Atendimento consultivo", "Recomendações objetivas"],
            ["Atendimento próximo", "Comunicação direta e clara"],
            ["Foco em risco", "Prevenção antes do problema"],
            ["Método comprovável", "Plano, execução e indicadores"],
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
