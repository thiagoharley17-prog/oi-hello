import { Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUpRight, Maximize2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const officePhoto = "/images/fachada-hl-bezerra.webp";

export function Home() {
  return (
    <section className="overflow-hidden border-b border-gold/40 bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl lg:min-h-[38rem] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="home-intro self-center px-5 pb-10 pt-14 sm:px-8 lg:py-20 lg:pr-12">
          <p className="section-label flex items-center gap-3 text-gold">
            <span aria-hidden="true" className="h-px w-8 bg-gold" />
            HL &amp; Bezerra
          </p>
          <h1 className="mt-6 max-w-xl text-balance font-display text-[clamp(2.75rem,5.2vw,5rem)] leading-[1.01] tracking-tight">
            Proteção dos direitos para pessoas e empresas
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-primary-foreground/80 sm:text-lg">
            Defendemos seus direitos com compromisso e excelência. Oferecemos orientação jurídica
            clara para as suas decisões.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link to="/diagnostico" className="action-link bg-gold text-gold-foreground">
              Fale com o escritório <ArrowUpRight size={17} />
            </Link>
            <a
              href="#servicos"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-medium hover:text-gold"
            >
              Áreas de atuação <ArrowDown size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
        <figure className="office-portrait relative mx-5 mb-6 sm:mx-8 sm:mb-8 lg:m-0">
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                aria-label="Ampliar foto da fachada do escritório"
                className="group relative block aspect-[4/3] w-full overflow-hidden text-left focus-visible:outline-2 focus-visible:outline-offset-[-5px] focus-visible:outline-gold lg:aspect-auto lg:h-full"
              >
                <img
                  src={officePhoto}
                  width={1024}
                  height={768}
                  fetchPriority="high"
                  alt="Fachada da HL & Bezerra"
                  className="absolute inset-0 h-full w-full object-cover object-[center_40%] motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-[1.04]"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-linear-to-t from-black/80 via-black/5 to-transparent"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-3 border border-gold/60 sm:inset-5"
                />
                <span className="absolute inset-x-7 bottom-7 flex items-center justify-between gap-4 text-white sm:inset-x-10 sm:bottom-10">
                  <span className="font-display text-xl sm:text-2xl">Fachada do escritório</span>
                  <span className="grid size-10 shrink-0 place-items-center border border-white/60 bg-black/35 transition-colors group-hover:bg-primary">
                    <Maximize2 size={17} aria-hidden="true" />
                  </span>
                </span>
              </button>
            </DialogTrigger>
            <DialogContent
              aria-describedby={undefined}
              className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-4xl overflow-auto bg-background p-4 sm:p-6"
            >
              <DialogTitle className="pr-8 font-display text-xl">
                Fachada da HL &amp; Bezerra
              </DialogTitle>
              <img
                src={officePhoto}
                width={1024}
                height={768}
                alt="Fachada da HL & Bezerra"
                className="max-h-[72dvh] w-full object-contain"
              />
            </DialogContent>
          </Dialog>
        </figure>
      </div>
    </section>
  );
}
