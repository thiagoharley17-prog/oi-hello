import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Clock3, LockKeyhole, MessageCircle, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { siteMeta } from "@/data/site";
import { LeadForm } from "@/components/sections/lead-form";

export const Route = createFileRoute("/diagnostico")({
  component: Diagnostico,
  head: () => ({
    meta: [
      { title: "Fale com o escritório | HL & Bezerra Advocacia" },
      { name: "description", content: "Solicite atendimento jurídico da HL & Bezerra para entender seus direitos, riscos e próximos passos com orientação responsável." },
      { property: "og:title", content: "Fale com o escritório | HL & Bezerra Advocacia" },
      { property: "og:description", content: "Solicite atendimento jurídico da HL & Bezerra para entender seus direitos, riscos e próximos passos." },
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
            <div className="animate-fade-up">
              <Badge variant="secondary" className="mb-4 gap-1.5">
                <Scale className="h-3.5 w-3.5 text-gold" />
                Atendimento jurídico
              </Badge>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                O primeiro passo para proteger seus <span className="text-gold">direitos</span> com segurança
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
                Conte sua situação ao escritório. Nossa equipe orienta o caminho jurídico mais adequado,
                com clareza, sigilo profissional e total respeito ao seu caso.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {[
                  [Clock3, "Rápido", "Retorno em até 1 dia útil"],
                  [LockKeyhole, "Confidencial", "Sigilo absoluto"],
                  [MessageCircle, "Direto", "Atendimento claro"],
                ].map(([Icon, title, text]) => {
                  const FeatureIcon = Icon as typeof Clock3;
                  return (
                    <div key={title as string} className="rounded-2xl bg-card p-4 shadow-sm">
                      <FeatureIcon className="h-5 w-5 text-gold" />
                      <p className="mt-2 text-sm font-semibold">{title as string}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{text as string}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <Card className="animate-fade-in rounded-3xl border-0 shadow-md">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-lg font-semibold">Solicite atendimento jurídico</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Leva menos de 2 minutos. O retorno é feito pela equipe responsável do escritório.
                </p>
                <div className="mt-5">
                  <LeadForm cta="Enviar solicitação" />
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
            Um roteiro simples e objetivo, pensado para que você saia com as prioridades claras e os próximos passos definidos.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {[
              "Entendemos a situação, os fatos e os documentos envolvidos",
              "Avaliamos direitos, riscos e caminhos jurídicos disponíveis",
              "Orientamos a estratégia mais adequada ao seu momento",
              "Definimos o próximo passo com prazos e responsáveis claros",
            ].map((item, index) => (
              <Card key={item} className="rounded-2xl border-border/70 bg-card shadow-sm">
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
                <MessageCircle className="h-4 w-4 text-gold" />
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
          <Card className="relative overflow-hidden rounded-3xl border-0 bg-primary p-8 text-primary-foreground shadow-lg sm:p-10">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold/15 blur-3xl" aria-hidden="true" />
            <div className="relative grid gap-6 sm:grid-cols-[1.2fr_0.8fr] sm:items-center">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Ainda não decidiu qual é o seu próximo passo?
                </h2>
                              <p className="mt-3 max-w-xl text-sm text-primary-foreground/80 sm:text-base">
                A equipe ajuda a entender direitos, riscos e prioridades, com técnica e proximidade.
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
