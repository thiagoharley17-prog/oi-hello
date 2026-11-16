import { Link } from "@tanstack/react-router";
import { ArrowRight, Award, Handshake, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function About() {
  return (
    <section className="overflow-hidden bg-card">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:py-20 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-8">
        <div className="relative order-2 lg:order-1">
          <div className="overflow-hidden rounded-3xl bg-secondary shadow-xl">
            <img
              src="/images/assessoria-juridica-empresarial.jpg"
              alt="Profissionais analisando documentos em uma reunião de consultoria"
              className="h-full min-h-80 w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="absolute -bottom-5 -right-2 hidden max-w-56 rounded-2xl bg-primary p-5 text-primary-foreground shadow-lg sm:block">
            <p className="text-3xl font-semibold">Visão completa</p>
            <p className="mt-1 text-xs text-primary-foreground/75">Estratégia, gestão e jurídico conectados.</p>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <Badge variant="secondary" className="mb-4">Sobre a HL Bezerra</Badge>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Um parceiro próximo para decisões mais seguras
          </h2>
          <p className="mt-5 text-base leading-7 text-muted-foreground">
            A HL & Bezerra une consultoria e assessoria jurídica empresarial para apoiar quem responde pela empresa.
            Nosso papel é organizar o olhar sobre o negócio, antecipar riscos e transformar orientação em ações concretas.
          </p>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Trabalhamos de forma próxima, com linguagem clara e foco no impacto real de cada decisão para a operação.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              [Scale, "Jurídico", "Prevenção e segurança"],
              [Handshake, "Relacionamento", "Parceria de longo prazo"],
              [Award, "Excelência", "Entrega e responsabilidade"],
            ].map(([Icon, title, text]) => {
              const FeatureIcon = Icon as typeof Scale;
              return (
                <div key={title as string} className="rounded-2xl bg-secondary/55 p-4">
                  <FeatureIcon className="h-5 w-5 text-primary" />
                  <p className="mt-3 text-sm font-semibold">{title as string}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{text as string}</p>
                </div>
              );
            })}
          </div>

          <Button asChild size="lg" className="mt-8">
            <Link to="/diagnostico">
              Conversar com a equipe
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
