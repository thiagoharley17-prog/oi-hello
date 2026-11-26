import { useSiteContent } from "./site-content-context";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function Trust() {
  const { faqs, faqTitle } = useSiteContent();
  return (
    <section id="faq" className="scroll-mt-24 border-y">
      <div className="section-wrap grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <h2 className="section-reveal section-title mt-0">{faqTitle}</h2>
        <Accordion type="single" collapsible className="section-reveal border-t">
          {faqs.map(({ question, answer }, index) => (
            <AccordionItem key={index} value={String(index)}>
              <AccordionTrigger className="px-3 text-base transition-colors hover:bg-secondary data-[state=open]:bg-secondary">
                {question}
              </AccordionTrigger>
              <AccordionContent className="px-3 pt-3 text-sm leading-6 text-muted-foreground">
                {answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
