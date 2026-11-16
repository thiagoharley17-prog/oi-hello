import { Link } from "@tanstack/react-router";
import { ArrowRight, Mail, MapPin, MessageCircle, Phone, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { siteMeta } from "@/data/site";
import { LeadForm } from "@/components/sections/lead-form";

type ContactItem = {
  Icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
};

export function ContactSection() {
  const contactItems: ContactItem[] = [
    { Icon: MessageCircle, label: "WhatsApp", value: "Atendimento rápido", href: siteMeta.whatsapp, external: true },
    { Icon: Phone, label: "Telefone", value: siteMeta.phone },
    { Icon: Mail, label: "E-mail", value: siteMeta.email, href: `mailto:${siteMeta.email}`, external: false },
    { Icon: MapPin, label: "Cobertura", value: "Atendimento em todo o Brasil" },
  ];

  return (
    <section id="contato" className="scroll-mt-24 bg-secondary/30">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <Badge variant="secondary" className="mb-4">Fale conosco</Badge>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Atendimento com sigilo e responsabilidade
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Relate seu caso e receba orientação jurídica objetiva sobre o próximo passo, com proximidade,
              clareza e compromisso profissional.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {contactItems.map(({ Icon, label, value, href, external }) => {
                const content = (
                  <div>
                    <Icon className="h-5 w-5 text-gold" />
                    <p className="mt-3 text-sm font-semibold">{label}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{value}</p>
                  </div>
                );
                return href ? (
                  <Card key={label} className="rounded-2xl border-border/70 bg-card shadow-sm">
                    <CardContent className="p-5">
                      <a
                        href={href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noreferrer" : undefined}
                        className="transition-transform duration-200 hover:-translate-y-0.5"
                      >
                        {content}
                      </a>
                    </CardContent>
                  </Card>
                ) : (
                  <Card key={label} className="rounded-2xl border-border/70 bg-card shadow-sm">
                    <CardContent className="p-5">{content}</CardContent>
                  </Card>
                );
              })}
            </div>

            <Button asChild size="lg" className="mt-7">
              <Link to="/diagnostico">
                Solicitar atendimento
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <Card className="rounded-3xl border-0 shadow-md">
            <CardContent className="p-6 sm:p-8">
              <h3 className="text-lg font-semibold">Início da conversa</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                A equipe responde de forma reservada e apresenta o próximo passo adequado ao seu caso.
              </p>
              <div className="mt-5">
                <LeadForm cta="Enviar mensagem" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
