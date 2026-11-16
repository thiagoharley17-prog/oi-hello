import { Link } from "@tanstack/react-router";
import { MessageCircle, ShieldCheck, Scale } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { faqs } from "@/data/site";

export function Trust() {
  return (
    <section id="faq" className="scroll-mt-24 bg-secondary/30">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <Badge variant="secondary" className="mb-4">Confiança e transparência</Badge>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Você precisa se sentir seguro antes de contratar
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Por isso, explicamos como trabalhamos e deixamos todas as respostas abertas antes do primeiro atendimento.
              A relação entre advogado e cliente começa com respeito, sigilo e transparência.
            </p>

            <div className="mt-8 grid gap-4">
              <Card className="rounded-2xl border-border/70 bg-card shadow-sm">
                <CardContent className="flex gap-4 p-5">
                  <ShieldCheck className="h-6 w-6 shrink-0 text-gold" />
                  <div>
                    <h3 className="font-semibold">Sigilo profissional</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">Condução reservada, com atenção à sensibilidade dos dados de cada cliente.</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-border/70 bg-card shadow-sm">
                <CardContent className="flex gap-4 p-5">
                  <MessageCircle className="h-6 w-6 shrink-0 text-gold" />
                  <div>
                    <h3 className="font-semibold">Comunicação direta</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">Você fala com quem acompanha o caso, com respostas claras e sem jogadas de venda.</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-border/70 bg-card shadow-sm">
                <CardContent className="flex gap-4 p-5">
                  <Scale className="h-6 w-6 shrink-0 text-gold" />
                  <div>
                    <h3 className="font-semibold">Compromisso ético</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">Atuação responsável, técnica e alinhada aos interesses do cliente.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <Accordion type="single" collapsible className="rounded-2xl border border-border/70 bg-card px-6 shadow-sm">
              {faqs.map((faq) => (
                <AccordionItem key={faq.question} value={faq.question}>
                  <AccordionTrigger className="text-base font-semibold hover:no-underline">{faq.question}</AccordionTrigger>
                  <AccordionContent className="leading-6 text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <Button asChild size="lg" className="mt-6 w-full sm:w-auto">
              <Link to="/diagnostico">Ainda tem dúvidas? Fale com o escritório</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
