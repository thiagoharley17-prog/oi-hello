import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, useRef, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Header } from "@/components/sections/header";
import { Footer } from "@/components/sections/footer";
import {
  sendPublicHeartbeat,
  startPublicPresenceLoop,
  trackFunnelEvent,
} from "@/lib/telemetry";
import { sanitizePublicPath } from "@/lib/telemetry.schema";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você procura não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Voltar para o início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Não foi possível carregar esta página
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Algo deu errado do nosso lado. Tente recarregar ou volte para a página inicial.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Voltar para o início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    // Replace these placeholders with the app's name and description when first building the app.
    // Each content route, / included, must still set its own head(). Never add og:image or
    // twitter:image here: every page without its own would inherit the root's preview image.
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "HL & Bezerra Advocacia | Escritório de Advocacia" },
      {
        name: "description",
        content:
          "Escritório de advocacia dedicado a defender direitos, proteger interesses e oferecer orientação jurídica com compromisso, clareza e excelência.",
      },
      { name: "author", content: "HL & Bezerra Advocacia" },
      { property: "og:title", content: "HL & Bezerra Advocacia | Escritório de Advocacia" },
      {
        property: "og:description",
        content:
          "Defendemos seus direitos com compromisso e excelência. Advocacia dedicada a proteger seus interesses e garantir seus direitos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/images/hl-bezerra-icon.png", type: "image/png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (!isAdminRoute && (hash.includes("type=invite") || hash.includes("type=recovery"))) {
      try {
        window.sessionStorage.setItem("hlb_admin_invite_flow", "1");
      } catch {
        // Ignore storage errors.
      }
      void router.navigate({ to: "/admin", replace: true });
    }
  }, [isAdminRoute, router]);

  useEffect(() => {
    if (isAdminRoute) return;
    const sanitized = sanitizePublicPath(pathname);
    if (!sanitized) return;
    trackFunnelEvent("visit", "page", sanitized);
    sendPublicHeartbeat(sanitized, false);
  }, [isAdminRoute, pathname]);

  useEffect(() => {
    if (isAdminRoute) return;
    return startPublicPresenceLoop(() => pathnameRef.current);
  }, [isAdminRoute]);

  return (
    <QueryClientProvider client={queryClient}>
      {isAdminRoute ? (
        <div className="min-h-screen bg-background text-foreground">
          <Outlet />
        </div>
      ) : (
        <div className="flex min-h-screen flex-col">
          <Header />
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <main id="conteudo" className="flex-1">
            <Outlet />
          </main>
          <Footer />
        </div>
      )}
    </QueryClientProvider>
  );
}
