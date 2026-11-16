import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Phone, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { siteMeta } from "@/data/site";
import { useState } from "react";

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isHome = pathname === "/";

  const linkClass = (active: boolean) =>
    `transition-colors hover:text-foreground ${active ? "font-semibold text-foreground" : "text-muted-foreground"}`;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:h-20 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <img src="/images/hl-bezerra-logo.png" alt="Logo da HL Bezerra" className="h-9 w-9 rounded-full object-cover sm:h-10 sm:w-10" />
          <span className="text-base font-semibold tracking-tight sm:text-lg">{siteMeta.brand}</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium lg:flex" aria-label="Navegação principal">
          <Link to="/" className={linkClass(isHome)}>Início</Link>
          <Link to="/diagnostico" className={linkClass(pathname === "/diagnostico")}>Diagnóstico</Link>
          {isHome && (
            <>
              <a href="#servicos" className="text-muted-foreground transition-colors hover:text-foreground">Serviços</a>
              <a href="#metodo" className="text-muted-foreground transition-colors hover:text-foreground">Método</a>
              <a href="#faq" className="text-muted-foreground transition-colors hover:text-foreground">FAQ</a>
            </>
          )}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <a href={siteMeta.whatsapp} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
          <Button asChild>
            <Link to="/diagnostico" className="rounded-lg px-4 py-2 shadow-sm">
              {siteMeta.cta}
            </Link>
          </Button>
        </div>

        <Button variant="ghost" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Abrir menu">
          <Menu className="h-5 w-5" />
        </Button>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="right" className="w-full sm:max-w-xs">
            <SheetHeader>
              <SheetTitle className="text-xl font-semibold">Menu</SheetTitle>
              <SheetDescription className="sr-only">Navegação e contatos da HL Bezerra</SheetDescription>
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-4 text-base font-medium" aria-label="Navegação móvel">
              <Link to="/" onClick={() => setOpen(false)} className={`py-1.5 ${isHome ? "font-semibold" : ""}`}>Início</Link>
              <Link to="/diagnostico" onClick={() => setOpen(false)} className={`py-1.5 ${pathname === "/diagnostico" ? "font-semibold" : ""}`}>Diagnóstico</Link>
              {isHome && (
                <>
                  <a href="#servicos" onClick={() => setOpen(false)} className="py-1.5">Serviços</a>
                  <a href="#metodo" onClick={() => setOpen(false)} className="py-1.5">Método</a>
                  <a href="#faq" onClick={() => setOpen(false)} className="py-1.5">FAQ</a>
                </>
              )}
            </nav>
            <div className="mt-8 flex flex-col gap-3">
              <Button asChild variant="secondary" size="lg">
                <a href={siteMeta.whatsapp} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              </Button>
              <Button asChild size="lg">
                <Link to="/diagnostico" onClick={() => setOpen(false)}>
                  {siteMeta.cta}
                </Link>
              </Button>
            </div>
            <div className="mt-8 border-t pt-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> {siteMeta.phone}</div>
              <div className="mt-2 flex items-center gap-2"><Mail className="h-4 w-4" /> {siteMeta.email}</div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
