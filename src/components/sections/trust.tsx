import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs } from "@/data/site";

export function Trust() {
  return (
    <section id="faq" className="scroll-mt-24 border-y">
      <div className="section-wrap grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <h2 className="section-title mt-0">Perguntas frequentes</h2>
        <Accordion type="single" collapsible className="border-t">
          {faqs.map(({ question, answer }) => (
            <AccordionItem key={question} value={question}>
              <AccordionTrigger className="text-base">{question}</AccordionTrigger>
              <AccordionContent className="text-sm leading-6 text-muted-foreground">
                {answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
