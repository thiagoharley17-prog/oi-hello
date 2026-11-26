import { useSiteContent } from "./site-content-context";
import { Link } from "@tanstack/react-router";
import { trackFunnelEvent } from "@/lib/telemetry";

export function Footer() {
  const { brand, contact, sections } = useSiteContent();
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-10 gap-y-6 px-5 py-8 sm:px-8">
        <Link to="/">
          <img
            src={brand.logo}
            alt={`${brand.name} — Página inicial`}
            className="h-11 w-auto max-w-48 object-contain"
          />
        </Link>
        <p className="text-sm text-primary-foreground/75">
          © {new Date().getFullYear()} {brand.legalName}
        </p>
        <nav className="flex flex-wrap gap-5 text-sm" aria-label="Links do rodapé">
          {sections.some((section) => section.id === "faq" && section.enabled) && (
            <Link to="/" hash="faq" className="hover:underline">
              Perguntas frequentes
            </Link>
          )}
          {contact.instagram && (
            <a href={contact.instagram} className="hover:underline">
              Instagram
            </a>
          )}
          <a
            href={`https://wa.me/${contact.whatsapp}`}
            onClick={() => trackFunnelEvent("whatsapp_direct_click", "footer")}
            className="hover:underline"
          >
            WhatsApp
          </a>
        </nav>
      </div>
    </footer>
  );
}
