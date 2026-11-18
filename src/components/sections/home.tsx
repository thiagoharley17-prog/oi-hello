import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

export function Home() {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 pb-10 pt-14 sm:px-8 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-14 lg:py-16">
        <div>
          <p className="section-label text-gold">HL &amp; Bezerra Advocacia</p>
          <h1 className="mt-5 max-w-xl font-display text-[clamp(2.75rem,5.4vw,5.25rem)] leading-[1.04]">
            Advocacia para pessoas e empresas
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-primary-foreground/80 sm:text-lg">
            Assessoria jurídica e representação em processos para proteger seus direitos e orientar
            suas decisões.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link to="/diagnostico" className="action-link bg-gold text-gold-foreground">
              Fale com o escritório <ArrowUpRight size={17} />
            </Link>
            <a href="#servicos" className="text-sm font-medium underline underline-offset-4">
              Conheça as áreas de atuação
            </a>
          </div>
        </div>
        <figure className="border border-gold/40 p-2">
          <img
            src="/images/fachada-hl-bezerra.webp"
            width={1024}
            height={768}
            fetchPriority="high"
            alt="Fachada da HL & Bezerra"
            className="aspect-[4/3] w-full object-cover"
          />
        </figure>
      </div>
    </section>
  );
}
