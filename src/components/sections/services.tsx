import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Scale,
  Building2,
  Gavel,
  HeartHandshake,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { services } from "@/data/site";

const serviceIcons = {
  DC: Scale,
  DF: HeartHandshake,
  DT: BriefcaseBusiness,
  Scale,
  DP: Gavel,
  DCO: ShoppingBag,
  DE: Building2,
  DPR: ShieldCheck,
} as const;

export function Services() {
  return (
    <section
      id="servicos"
      aria-labelledby="services-heading"
      className="scroll-mt-24 bg-primary text-primary-foreground"
    >
      <div className="section-wrap">
        <div className="max-w-2xl border-l-2 border-gold pl-5 sm:pl-7">
          <h2 id="services-heading" className="section-title mt-0">
            Áreas de atuação
          </h2>
          <p className="mt-3 text-base leading-7 text-primary-foreground/80 sm:text-lg">
            Conheça os assuntos em que o escritório pode orientar e representar você ou sua empresa.
          </p>
        </div>

        <ul className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
          {services.map(({ initials, title, description, bullets }) => {
            const Icon = serviceIcons[initials];
            return (
              <li
                key={title}
                className="flex flex-col border-t-2 border-gold bg-background p-5 text-foreground sm:p-6 sm:last:col-span-full sm:last:grid sm:last:grid-cols-[minmax(0,1fr)_minmax(0,0.48fr)] sm:last:items-center sm:last:gap-x-8"
              >
                <div>
                  <div
                    aria-hidden="true"
                    className="mb-5 inline-grid size-16 place-items-center rounded-xl border border-primary bg-primary p-1 text-gold"
                  >
                    <span className="grid size-full place-items-center rounded-lg border border-gold/50">
                      <Icon size={29} strokeWidth={1.6} />
                    </span>
                  </div>
                  <h3 className="font-display text-[1.65rem] leading-tight">{title}</h3>
                  <p className="mt-2 max-w-xl text-base leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </div>
                <ul className="mt-auto grid gap-1 pt-5 text-sm leading-6">
                  {bullets.map((topic) => (
                    <li key={topic} className="flex items-baseline gap-2.5">
                      <span
                        aria-hidden="true"
                        className="relative -top-0.5 size-1.5 shrink-0 bg-gold"
                      />
                      {topic}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>

        <Link to="/diagnostico" className="action-link mt-8 bg-gold text-gold-foreground">
          Fale com o escritório <ArrowUpRight size={17} />
        </Link>
      </div>
    </section>
  );
}
