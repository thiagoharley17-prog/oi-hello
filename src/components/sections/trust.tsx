import { Link } from "@tanstack/react-router";
import { MessageCircle, Quote, ShieldCheck, Star } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { faqs, testimonials } from "@/data/site";

export function Trust() {
  return (
    <section id="faq" className="scroll-mt-24 bg-secondary/25">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <Badge variant="secondary" className="mb-4">Confiança e clareza</Badge>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Você precisa se sentir seguro antes de contratar
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Por isso, explicamos como trabalhamos, mostramos o método e deixamos todas as respostas abertas antes do primeiro atendimento.
            </p>

            <div className="mt-8 grid gap-4">
              <Card className="rounded-2xl border-0 shadow-sm">
                <CardContent className="flex gap-4 p-5">
                  <ShieldCheck className="h-6 w-6 shrink-0 text-primary" />
                  <div>
                    <h3 className="font-semibold">Atendimento confidencial</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Condução reservada, com atenção à sensibilidade dos dados do negócio.</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-0 shadow-sm">
                <CardContent className="flex gap-4 p-5">
                  <MessageCircle className="h-6 w-6 shrink-0 text-primary" />
                  <div>
                    <h3 className="font-semibold">Resposta direta</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Você fala com quem entende o processo, semScripts de venda ou pressão.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <div className="grid gap-5 sm:grid-cols-2">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.name + testimonial.role} className="rounded-2xl border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex gap-1 text-accent-foreground">
                      {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                    </div>
                    <Quote className="mt-4 h-6 w-6 text-primary" />
                    <p className="mt-3 text-sm leading-6">“{testimonial.quote}”</p>
                    <p className="mt-5 text-sm font-semibold">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Accordion type="single" collapsible className="mt-6 rounded-2xl border-0 bg-card px-6 shadow-sm">
              {faqs.map((faq) => (
                <AccordionItem key={faq.question} value={faq.question}>
                  <AccordionTrigger className="text-base font-semibold hover:no-underline">{faq.question}</AccordionTrigger>
                  <AccordionContent className="leading-6 text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <Button asChild size="lg" className="mt-6 w-full sm:w-auto">
              <Link to="/diagnostico">Ainda tem dúvidas? Fale com a equipe</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
