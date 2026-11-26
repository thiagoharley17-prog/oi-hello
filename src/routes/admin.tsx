import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getAdminSessionStatus } from "@/lib/admin.functions";
import {
  AdminLoginView,
  AdminSetPasswordView,
  AdminTotpChallengeView,
  AdminTotpEnrollView,
} from "@/components/admin/admin-auth-views";
import { AdminSiteEditor } from "@/components/admin/admin-site-editor";
import { AdminLeads } from "@/components/admin/admin-leads";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export const Route = createFileRoute("/admin")({
  ssr: false,
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Painel Administrativo | HL & Bezerra Advocacia" },
      { name: "description", content: "Área privada de acompanhamento da HL & Bezerra Advocacia." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Painel Administrativo | HL & Bezerra Advocacia" },
      {
        property: "og:description",
        content: "Área privada de acompanhamento da HL & Bezerra Advocacia.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

type AdminViewState =
  | { step: "checking" }
  | { step: "login" }
  | { step: "set_password"; email: string | null }
  | { step: "mfa_enroll"; email: string | null; factorId: string; qrCode: string; secret: string }
  | { step: "mfa_challenge"; email: string | null; factorId: string }
  | { step: "dashboard"; email: string | null; label: string | null };

const INVITE_FLAG_KEY = "hlb_admin_invite_flow";

function consumeInviteFlag(): boolean {
  try {
    if (
      window.location.hash.includes("type=invite") ||
      window.location.hash.includes("type=recovery")
    ) {
      return true;
    }
    return window.sessionStorage.getItem(INVITE_FLAG_KEY) === "1";
  } catch {
    return false;
  }
}

function clearInviteFlag() {
  try {
    window.sessionStorage.removeItem(INVITE_FLAG_KEY);
  } catch {
    // Ignore storage errors.
  }
}

function AdminPage() {
  const queryClient = useQueryClient();
  const fetchAdminStatus = useServerFn(getAdminSessionStatus);

  const [view, setView] = useState<AdminViewState>({ step: "checking" });
  const [dashboardTab, setDashboardTab] = useState<"funnel" | "leads" | "site">("funnel");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const clearSessionState = useCallback(
    async (nextError: string | null, nextNotice: string | null) => {
      await queryClient.cancelQueries();
      queryClient.clear();
      await supabase.auth.signOut().catch(() => undefined);
      clearInviteFlag();
      setError(nextError);
      setNotice(nextNotice);
      setView({ step: "login" });
    },
    [queryClient],
  );

  const evaluateSession = useCallback(async () => {
    setError(null);
    const { data: userRes, error: userError } = await supabase.auth.getUser();
    if (userError || !userRes.user) {
      setView({ step: "login" });
      return;
    }

    // Server-side authorization check already in AAL1 BEFORE releasing TOTP enrollment.
    let status;
    try {
      status = await fetchAdminStatus();
    } catch {
      await clearSessionState(
        "Não foi possível confirmar a autorização da sessão. Faça login novamente.",
        null,
      );
      return;
    }

    if (!status.authorized) {
      await clearSessionState(
        "Esta conta não está autorizada a acessar o painel administrativo.",
        null,
      );
      return;
    }

    if (consumeInviteFlag()) {
      setView({ step: "set_password", email: status.email });
      return;
    }

    if (status.aal === "aal2") {
      setView({ step: "dashboard", email: status.email, label: status.label });
      return;
    }

    const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
    if (factorsError) {
      setError("Não foi possível consultar o autenticador (TOTP). Tente novamente.");
      setView({ step: "login" });
      return;
    }

    const verifiedTotp = factorsData.totp.find((f) => f.status === "verified");
    if (verifiedTotp) {
      setView({ step: "mfa_challenge", email: status.email, factorId: verifiedTotp.id });
      return;
    }

    // Clean up any abandoned unverified TOTP factors before enrolling a fresh one.
    const unverifiedTotps = factorsData.all.filter(
      (f) => f.factor_type === "totp" && f.status === "unverified",
    );
    for (const stale of unverifiedTotps) {
      await supabase.auth.mfa.unenroll({ factorId: stale.id });
    }

    const { data: enrolled, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      issuer: "HL & Bezerra",
      friendlyName: "Google Authenticator",
    });

    if (enrollError || !enrolled) {
      setError("Não foi possível iniciar o cadastro do Google Authenticator. Tente novamente.");
      return;
    }

    setView({
      step: "mfa_enroll",
      email: status.email,
      factorId: enrolled.id,
      qrCode: enrolled.totp.qr_code,
      secret: enrolled.totp.secret,
    });
  }, [clearSessionState, fetchAdminStatus]);

  useEffect(() => {
    void evaluateSession();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        void queryClient.cancelQueries();
        queryClient.clear();
        setView((prev) => {
          if (prev.step !== "login") {
            setNotice("Sessão encerrada ou expirada. Faça login novamente.");
          }
          return { step: "login" };
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [evaluateSession, queryClient]);

  async function handleLogin(email: string, password: string) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError("E-mail ou senha inválidos.");
        return;
      }
      await evaluateSession();
    } finally {
      setBusy(false);
    }
  }

  async function handleSetPassword(password: string) {
    setBusy(true);
    setError(null);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError("Não foi possível definir a senha. Tente uma senha mais forte.");
        return;
      }
      clearInviteFlag();
      if (window.location.hash) {
        window.history.replaceState(null, "", window.location.pathname);
      }
      await evaluateSession();
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifyTotp(factorId: string, code: string) {
    setBusy(true);
    setError(null);
    try {
      const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code,
      });
      if (verifyError) {
        setError("Código inválido ou expirado. Confira o código atual no Google Authenticator.");
        return;
      }
      await supabase.auth.refreshSession();
      await evaluateSession();
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    setBusy(true);
    try {
      await clearSessionState(null, "Você saiu do painel administrativo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-gold/30 bg-primary text-primary-foreground">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex items-center gap-4">
            <Link to="/" className="shrink-0">
              <img
                src="/images/hl-bezerra-logo.png"
                alt="HL & Bezerra — Voltar ao site"
                className="h-10 w-auto"
              />
            </Link>
            <span className="hidden border-l border-gold/40 pl-4 text-xs font-semibold uppercase tracking-[0.16em] text-gold sm:inline">
              Painel administrativo
            </span>
          </div>
          {view.step === "dashboard" && (
            <div className="flex items-center gap-4 text-sm">
              <span className="hidden text-primary-foreground/80 md:inline">
                {view.label ?? view.email}
              </span>
              <button
                type="button"
                onClick={() => void handleSignOut()}
                disabled={busy}
                className="inline-flex min-h-10 items-center gap-2 border border-gold px-3.5 text-sm font-medium text-primary-foreground hover:text-gold disabled:opacity-60"
              >
                <LogOut size={15} /> Sair
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        {view.step === "checking" && (
          <div className="mx-auto flex max-w-md items-center justify-center gap-3 px-5 py-24 text-sm text-muted-foreground">
            <Loader2 size={18} className="animate-spin" /> Verificando sessão...
          </div>
        )}

        {view.step === "login" && (
          <div className="mx-auto max-w-md px-5 py-14 sm:py-20">
            <AdminLoginView loading={busy} error={error} notice={notice} onSubmit={handleLogin} />
            <Link
              to="/admin/demo"
              className="mt-5 inline-block text-sm font-medium underline underline-offset-4"
            >
              Explorar demonstração sem login
            </Link>
          </div>
        )}

        {view.step === "set_password" && (
          <div className="mx-auto max-w-md px-5 py-14 sm:py-20">
            <AdminSetPasswordView
              email={view.email}
              loading={busy}
              error={error}
              onSubmit={handleSetPassword}
              onSignOut={handleSignOut}
            />
          </div>
        )}

        {view.step === "mfa_enroll" && (
          <div className="mx-auto max-w-lg px-5 py-12 sm:py-16">
            <AdminTotpEnrollView
              email={view.email}
              qrCode={view.qrCode}
              secret={view.secret}
              loading={busy}
              error={error}
              onVerify={(code) => handleVerifyTotp(view.factorId, code)}
              onSignOut={handleSignOut}
            />
          </div>
        )}

        {view.step === "mfa_challenge" && (
          <div className="mx-auto max-w-md px-5 py-14 sm:py-20">
            <AdminTotpChallengeView
              email={view.email}
              loading={busy}
              error={error}
              onVerify={(code) => handleVerifyTotp(view.factorId, code)}
              onSignOut={handleSignOut}
            />
          </div>
        )}

        {view.step === "dashboard" && (
          <nav
            aria-label="Seções do painel"
            className="mx-auto flex max-w-7xl flex-wrap gap-3 px-5 pt-6 sm:px-8"
          >
            <button
              type="button"
              aria-pressed={dashboardTab === "funnel"}
              onClick={() => setDashboardTab("funnel")}
              className="border px-4 py-2 aria-pressed:bg-primary aria-pressed:text-primary-foreground"
            >
              Funil
            </button>
            <button
              type="button"
              aria-pressed={dashboardTab === "leads"}
              onClick={() => setDashboardTab("leads")}
              className="border px-4 py-2 aria-pressed:bg-primary aria-pressed:text-primary-foreground"
            >
              Leads
            </button>
            <button
              type="button"
              aria-pressed={dashboardTab === "site"}
              onClick={() => setDashboardTab("site")}
              className="border px-4 py-2 aria-pressed:bg-primary aria-pressed:text-primary-foreground"
            >
              Editar site
            </button>
          </nav>
        )}

        {view.step === "dashboard" && (
          <div hidden={dashboardTab !== "site"}>
            <AdminSiteEditor />
          </div>
        )}

        {view.step === "dashboard" && dashboardTab === "leads" && <AdminLeads />}

        {view.step === "dashboard" && dashboardTab === "funnel" && (
          <AdminDashboard
            onSessionExpired={() =>
              void clearSessionState(
                null,
                "Sua sessão expirou ou perdeu a verificação em duas etapas. Faça login novamente.",
              )
            }
          />
        )}
      </main>
    </div>
  );
}
