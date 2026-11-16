import { Link } from "@tanstack/react-router";
import { ArrowRight, Award, Handshake, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function About() {
  return (
    <section id="escritorio" className="overflow-hidden bg-card">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:py-20 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-8">
        <div className="relative order-2 lg:order-1">
          <div className="overflow-hidden rounded-3xl border border-gold/20 bg-secondary shadow-xl">
            <img
              src="/images/assessoria-juridica-empresarial.jpg"
              alt="Escritório de advocacia com mobiliário elegante e livros jurídicos"
              className="h-full min-h-80 w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="absolute -bottom-5 -right-2 hidden max-w-60 rounded-2xl bg-primary p-5 text-primary-foreground shadow-lg sm:block">
            <p className="text-2xl font-semibold text-gold">Advocacia</p>
            <p className="mt-1 text-xs leading-5 text-primary-foreground/75">Direito, técnica e compromisso a serviço de cada cliente.</p>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <Badge variant="secondary" className="mb-4">Sobre o escritório</Badge>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Confiança construída na defesa de cada direito
          </h2>
          <p className="mt-5 text-base leading-7 text-muted-foreground">
            A HL & Bezerra é um escritório de advocacia dedicado a proteger os interesses de pessoas e empresas,
            oferecer orientação jurídica responsável e conduzir cada caso com seriedade, técnica e respeito.
          </p>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Nosso trabalho começa com a escuta, passa por uma análise cuidadosa e se traduz em uma estratégia clara
            para você tomar decisões com segurança e tranquilidade.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              [Scale, "Técnica", "Análise jurídica rigorosa"],
              [Handshake, "Proximidade", "Relação de confiança"],
              [Award, "Excelência", "Compromisso com o cliente"],
            ].map(([Icon, title, text]) => {
              const FeatureIcon = Icon as typeof Scale;
              return (
                <div key={title as string} className="rounded-2xl border border-gold/20 bg-secondary/50 p-4">
                  <FeatureIcon className="h-5 w-5 text-gold" />
                  <p className="mt-3 text-sm font-semibold">{title as string}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{text as string}</p>
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
