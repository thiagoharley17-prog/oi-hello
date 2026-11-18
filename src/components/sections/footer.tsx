import { Link } from "@tanstack/react-router";
import { siteMeta } from "@/data/site";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-10 gap-y-6 px-5 py-8 sm:px-8">
        <Link to="/">
          <img
            src="/images/hl-bezerra-logo.png"
            alt="HL & Bezerra — Página inicial"
            className="h-11 w-auto"
          />
        </Link>
        <p className="text-sm text-primary-foreground/75">
          © {new Date().getFullYear()} {siteMeta.legalName}
        </p>
        <nav className="flex flex-wrap gap-5 text-sm" aria-label="Links do rodapé">
          <Link to="/" hash="faq" className="hover:underline">
            Perguntas frequentes
          </Link>
          <a href={siteMeta.instagram} className="hover:underline">
            Instagram
          </a>
          <a href={siteMeta.whatsapp} className="hover:underline">
            WhatsApp
          </a>
        </nav>
      </div>
    </footer>
  );
}
