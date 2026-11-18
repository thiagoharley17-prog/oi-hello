import {
  BriefcaseBusiness,
  Building2,
  FileText,
  Gavel,
  HeartHandshake,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { services } from "@/data/site";

const serviceIcons = {
  DC: FileText,
  DF: HeartHandshake,
  DT: BriefcaseBusiness,
  DP: Gavel,
  DCO: ShoppingBag,
  DE: Building2,
  DPR: ShieldCheck,
} as const;

export function Services() {
  return (
    <section id="servicos" className="scroll-mt-24 border-y bg-secondary">
      <div className="section-wrap">
        <h2 className="section-title mt-0">Áreas de atuação</h2>
        <ul className="mt-9 grid border-t md:grid-cols-2 md:gap-x-12">
          {services.map(({ initials, title, description }) => {
            const Icon = serviceIcons[initials];
            return (
              <li
                key={title}
                className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4 border-b py-6 sm:gap-5"
              >
                <span
                  aria-hidden="true"
                  className="grid w-14 justify-items-center gap-1.5 border border-gold/40 bg-primary px-2 py-2.5 text-gold sm:w-16"
                >
                  <Icon size={21} strokeWidth={1.6} />
                  <span className="text-[0.65rem] font-semibold leading-none tracking-widest">
                    {initials}
                  </span>
                </span>
                <div>
                  <h3 className="font-display text-2xl leading-tight">{title}</h3>
                  <p className="mt-1.5 max-w-lg text-base leading-7 text-muted-foreground">
                    {description}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
