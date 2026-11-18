import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const sectionLinks: Array<{ label: string; hash?: string; to?: "/" | "/blog" }> = [
  { label: "O escritório", hash: "escritorio" },
  { label: "Áreas de atuação", hash: "servicos" },
  { label: "Equipe", hash: "equipe" },
  { label: "Blog", to: "/blog" },
  { label: "Contato", hash: "contato" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-gold/30 bg-primary text-primary-foreground">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:bg-primary focus:p-2"
        >
          Pular para o conteúdo principal
        </a>
        <Link to="/">
          <img
            src="/images/hl-bezerra-logo.png"
            alt="HL & Bezerra — Página inicial"
            className="h-12 w-auto"
          />
        </Link>
        <nav className="hidden items-center gap-6 text-sm lg:flex" aria-label="Navegação principal">
          {sectionLinks.map(({ label, hash, to }) => (
            <Link key={label} to={to ?? "/"} hash={hash} className="hover:text-gold">
              {label}
            </Link>
          ))}
        </nav>
        <Link
          to="/diagnostico"
          className="action-link hidden border border-gold text-primary-foreground hover:text-gold lg:inline-flex"
        >
          Solicitar atendimento
        </Link>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="inline-flex min-h-11 items-center gap-2 px-2 text-sm lg:hidden"
              aria-label="Abrir menu"
            >
              <Menu size={20} /> Menu
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="p-6">
            <SheetHeader className="px-0">
              <SheetTitle>HL &amp; Bezerra</SheetTitle>
              <SheetDescription className="sr-only">Navegação do escritório</SheetDescription>
            </SheetHeader>
            <nav className="grid divide-y border-t" aria-label="Navegação móvel">
              {sectionLinks.map(({ label, hash, to }) => (
                <Link
                  key={label}
                  to={to ?? "/"}
                  hash={hash}
                  onClick={() => setOpen(false)}
                  className="py-3"
                >
                  {label}
                </Link>
              ))}
              <Link to="/diagnostico" onClick={() => setOpen(false)} className="py-3 font-semibold">
                Solicitar atendimento
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
