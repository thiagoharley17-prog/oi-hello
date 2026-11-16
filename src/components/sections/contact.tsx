import { Link } from "@tanstack/react-router";
import { Clock3, FileCheck2, MessageCircle, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LeadForm } from "@/components/sections/lead-form";
import { siteMeta } from "@/data/site";

export function ContactSection() {
  return (
    <section className="bg-secondary/25">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <Badge variant="secondary" className="mb-4">Fale com a HL Bezerra</Badge>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Vamos entender o momento da sua empresa
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Preencha e receba o diagnóstico gratuito. Nossa equipe responde com um plano de ação claro,
            sem compromisso e com total confidencialidade.
          </p>

          <div className="mt-8 grid gap-4">
            {[
              [Clock3, "Resposta rápida", "Retorno em até 1 dia útil, no seu canal preferido."],
              [ShieldCheck, "Total confidencial", "Suas informações são tratadas com sigilo absoluto."],
              [MessageCircle, "WhatsApp direto", "Prefere conversar agora? Estamos a um clique de distância."],
              [FileCheck2, "Próximo passo claro", "Sai da conversa com uma prioridade definida."],
            ].map(([Icon, title, text]) => {
              const FeatureIcon = Icon as typeof Clock3;
              return (
                <Card key={title as string} className="rounded-2xl border-0 shadow-sm">
                  <CardContent className="flex gap-4 p-5">
                    <FeatureIcon className="h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <h3 className="text-sm font-semibold">{title as string}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{text as string}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="secondary">
              <a href={siteMeta.whatsapp} target="_blank" rel="noreferrer">
                <MessageCircle className="h-4 w-4" />
                Abrir WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline">
              <Link to="/diagnostico">Ir para a página de diagnóstico</Link>
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold">Solicite o diagnóstico gratuito</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Leva menos de 2 minutos. Sem cadastro, sem burocracia.
          </p>
          <div className="mt-6">
            <LeadForm cta="Receber diagnóstico gratuito" />
          </div>
        </div>
      </div>
    </section>
  );
}
