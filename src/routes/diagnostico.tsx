import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Clock3, MessageCircle, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { siteMeta } from "@/data/site";
import { LeadForm } from "@/components/sections/lead-form";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/diagnostico")({
  component: Diagnostico,
  head: () => ({
    meta: [
      { title: "Diagnóstico Gratuito | HL Bezerra" },
      { name: "description", content: "Solicite um diagnóstico gratuito para entender o momento da sua empresa e sair com um próximo passo claro." },
      { property: "og:title", content: "Diagnóstico Gratuito | HL Bezerra" },
      { property: "og:description", content: "Solicite um diagnóstico gratuito para entender o momento da sua empresa." },
      { property: "og:type", content: "website" },
    ],
  }),
});

function Diagnostico() {
  return (
    <div className="flex min-h-screen flex-col">
      <section id="formulario" className="border-b bg-secondary/20">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para o início
          </Link>
          <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <Badge variant="secondary" className="mb-4">Diagnóstico gratuito</Badge>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                O primeiro passo para uma gestão com mais <span className="text-primary">clareza e confiança</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
                Uma conversa objetiva para entender o momento real da sua empresa, priorizar riscos e sair com um
                próximo passo claro. Sem custo, sem compromisso e com total confidencialidade.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {[
                  [Clock3, "Rápido", "Retorno em até 1 dia útil"],
                  [ShieldCheck, "Confidencial", "Sigilo absoluto"],
                  [MessageCircle, "Direto", "Sem enrolação"],
                ].map(([Icon, title, text]) => {
                  const FeatureIcon = Icon as typeof Clock3;
                  return (
                    <div key={title as string} className="rounded-2xl bg-card p-4 shadow-sm">
                      <FeatureIcon className="h-5 w-5 text-primary" />
                      <p className="mt-2 text-sm font-semibold">{title as string}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{text as string}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <Card className="rounded-3xl border-0 shadow-md">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-lg font-semibold">Solicite seu diagnóstico</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Leva menos de 2 minutos. Nossa equipe entra em contato em seguida.
                </p>
                <div className="mt-5">
                  <LeadForm cta="Receber diagnóstico gratuito" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-b">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-16 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">O que acontece na conversa</h2>
          <p className="mt-2 max-w-2xl text-base text-muted-foreground">
            Um roteiro simples e objetivo, pensado para sair da reunião com as prioridades definidas.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {[
              "Entendemos o momento atual da empresa e as principais dores de gestão",
              "Identificamos riscos, gargalos e oportunidades de melhoria",
              "Priorizamos as ações de maior impacto no resultado",
              "Definimos o próximo passo com prazos e responsáveis claros",
            ].map((item, index) => (
              <Card key={item} className="rounded-2xl border-0 shadow-sm">
                <CardContent className="flex gap-4 p-5">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="secondary" size="lg">
              <a href={siteMeta.whatsapp} target="_blank" rel="noreferrer">
                <MessageCircle className="h-4 w-4" />
                Prefere pelo WhatsApp?
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/">Voltar para a página inicial</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-secondary/20">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-16 lg:px-8">
          <Card className="rounded-3xl border-0 bg-primary p-8 text-primary-foreground shadow-lg sm:p-10">
            <div className="grid gap-6 sm:grid-cols-[1.2fr_0.8fr] sm:items-center">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Ainda não decidiu qual é o seu próximo passo?
                </h2>
                <p className="mt-3 max-w-xl text-sm text-primary-foreground/80 sm:text-base">
                  Nossa equipe ajuda a clarear prioridades e riscos com um método simples e comprovado.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
                  <a href="#formulario" className="w-full sm:w-auto">Voltar ao formulário</a>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
