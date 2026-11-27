import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChevronLeft, ChevronRight, Loader2, RefreshCw } from "lucide-react";
import { getAdminDashboardData } from "@/lib/admin.functions";
import type { AdminPeriod, AdminSessionStatusFilter, FunnelSessionRow } from "@/lib/admin.schema";
import {
  ACTIVE_WINDOW_SECONDS,
  FUNNEL_STAGES,
  STAGE_LABELS,
  STAGE_SHORT_LABELS,
  type FunnelStage,
} from "@/lib/telemetry.schema";

const PERIOD_LABELS: Record<AdminPeriod, string> = {
  today: "Hoje",
  "7d": "Últimos 7 dias",
  "30d": "Últimos 30 dias",
};

const PAGE_SIZE = 20;

const saoPauloFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

function formatSaoPaulo(iso: string | null): string {
  if (!iso) return "—";
  try {
    return saoPauloFormatter.format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatRate(part: number, total: number): string {
  if (total <= 0) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

function reachedStages(session: FunnelSessionRow): FunnelStage[] {
  const stages: FunnelStage[] = [];
  if (session.reachedVisitAt) stages.push("visit");
  if (session.reachedContactAt) stages.push("contact_reached");
  if (session.reachedFormStartedAt) stages.push("form_started");
  if (session.reachedWhatsappAttemptAt) stages.push("whatsapp_attempt");
  if (session.reachedWhatsappDirectAt) stages.push("whatsapp_direct_click");
  return stages;
}

type DashboardProps = {
  onSessionExpired?: () => void;
};

export function AdminDashboard({ onSessionExpired }: DashboardProps) {
  const [period, setPeriod] = useState<AdminPeriod>("today");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<AdminSessionStatusFilter>("all");
  const [stageFilter, setStageFilter] = useState<"all" | FunnelStage>("all");

  const fetchDashboard = useServerFn(getAdminDashboardData);

  const query = useQuery({
    queryKey: ["admin-funnel", period, page, statusFilter, stageFilter],
    queryFn: async () => {
      const input = { period, page, pageSize: PAGE_SIZE, status: statusFilter, stage: stageFilter };
      try {
        return await fetchDashboard({ data: input });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (message.includes("Unauthorized") || message.includes("FORBIDDEN_")) {
          onSessionExpired?.();
        }
        throw error;
      }
    },
    refetchInterval: 25_000,
    retry: false,
  });

  const data = query.data;
  const totalPages = data ? Math.max(1, Math.ceil(data.totalCount / data.pageSize)) : 1;

  function handlePeriodChange(next: AdminPeriod) {
    setPeriod(next);
    setPage(1);
  }

  const primarySteps = data
    ? [
        { key: "visit" as const, count: data.summary.stageVisit },
        { key: "contact_reached" as const, count: data.summary.stageContact },
        { key: "form_started" as const, count: data.summary.stageFormStarted },
        { key: "whatsapp_attempt" as const, count: data.summary.stageWhatsappAttempt },
      ]
    : [];

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-5 py-10 sm:px-8 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="section-label text-muted-foreground">Acompanhamento privado</p>
          <h1 className="mt-2 font-display text-3xl leading-tight sm:text-4xl">
            Funil e presença do site
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Fuso horário de referência: São Paulo (America/Sao_Paulo).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(["today", "7d", "30d"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handlePeriodChange(item)}
              className={`min-h-10 border px-3.5 text-sm font-medium transition-colors ${
                period === item
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-secondary"
              }`}
            >
              {PERIOD_LABELS[item]}
            </button>
          ))}
          <button
            type="button"
            onClick={() => void query.refetch()}
            disabled={query.isFetching}
            className="inline-flex min-h-10 items-center gap-2 border border-border bg-background px-3.5 text-sm font-medium hover:bg-secondary disabled:opacity-60"
          >
            <RefreshCw size={15} className={query.isFetching ? "animate-spin" : ""} />
            Atualizar
          </button>
        </div>
      </div>

      {query.isLoading && (
        <div
          role="status"
          className="flex items-center gap-3 border border-border bg-secondary px-5 py-6 text-sm"
        >
          <Loader2 size={18} className="animate-spin" /> Carregando métricas do período...
        </div>
      )}

      {query.isError && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-4 border border-destructive/40 bg-destructive/10 px-5 py-4 text-sm text-destructive"
        >
          <span>Não foi possível carregar os dados agora. Tente novamente.</span>
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="border border-destructive/40 bg-background px-3 py-1.5 font-medium text-foreground"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {data && (
        <>
          <section
            aria-labelledby="presenca-titulo"
            className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"
          >
            <div className="border border-border bg-primary p-6 text-primary-foreground sm:p-8">
              <p id="presenca-titulo" className="section-label text-gold">
                Estimativa em tempo real
              </p>
              <div className="mt-3 flex flex-wrap items-baseline gap-4">
                <span className="font-display text-5xl sm:text-6xl" data-testid="online-now-count">
                  {data.summary.onlineNow}
                </span>
                <span className="text-base text-primary-foreground/85">
                  {data.summary.onlineNow === 1
                    ? "sessão pública visível agora (estimativa)"
                    : "sessões públicas visíveis agora (estimativa)"}
                </span>
              </div>
              <p className="mt-4 max-w-2xl text-xs leading-5 text-primary-foreground/80">
                Estimativa baseada em sessões únicas com página pública visível e heartbeat recente
                (envio a cada 25 s, janela ativa de {ACTIVE_WINDOW_SECONDS} s). Abas no mesmo
                navegador compartilham a sessão para deduplicação, abas ocultas param de enviar e o
                painel <code className="text-gold">/admin</code> não entra na conta. Não representa
                contagem exata de pessoas físicas únicas.
              </p>
            </div>

            <div className="grid gap-4 border border-border bg-secondary p-6 sm:grid-cols-3 lg:grid-cols-1">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Sessões ({PERIOD_LABELS[period]})
                </p>
                <p className="mt-1 font-display text-3xl">{data.summary.totalSessions}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 sm:border-t-0 sm:pt-0 lg:border-t lg:pt-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Ativas agora</p>
                  <p className="mt-1 font-display text-2xl text-foreground">
                    {data.summary.activeSessions}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Inativas (pararam)</p>
                  <p className="mt-1 font-display text-2xl text-foreground">
                    {data.summary.inactiveSessions}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Atualizado em {formatSaoPaulo(data.summary.generatedAt)} (SP)
              </p>
            </div>
          </section>

          <section aria-labelledby="funil-titulo" className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="funil-titulo" className="font-display text-2xl sm:text-3xl">
                Etapas do funil — {PERIOD_LABELS[period]}
              </h2>
              <p className="text-xs text-muted-foreground">
                Sessões únicas que atingiram cada etapa (eventos deduplicados por sessão).
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {primarySteps.map((step, index) => (
                <div key={step.key} className="border border-border bg-background p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Etapa {index + 1}
                  </p>
                  <p className="mt-2 font-display text-4xl">{step.count}</p>
                  <p className="mt-2 text-sm font-medium leading-snug">{STAGE_LABELS[step.key]}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {index === 0
                      ? "Base do período"
                      : `${formatRate(step.count, data.summary.stageVisit)} das visitas`}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 border border-border bg-secondary px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Caminho alternativo (fora do formulário)
                </p>
                <p className="mt-1 text-sm font-medium">
                  Cliques diretos nos links de WhatsApp (rodapé, seção de contato ou /diagnostico)
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Indica intenção/abertura do link externo — não confirma envio de mensagem no
                  aplicativo.
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-3xl">{data.summary.stageWhatsappDirect}</p>
                <p className="text-xs text-muted-foreground">
                  {formatRate(data.summary.stageWhatsappDirect, data.summary.stageVisit)} das
                  visitas
                </p>
              </div>
            </div>
          </section>

          <section aria-labelledby="sessoes-titulo" className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 id="sessoes-titulo" className="font-display text-2xl sm:text-3xl">
                  Sessões do período
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Sessões inativas (sem heartbeat há mais de {ACTIVE_WINDOW_SECONDS} s) mostram a
                  última etapa onde pararam.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  aria-label="Filtrar por atividade"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as AdminSessionStatusFilter);
                    setPage(1);
                  }}
                  className="min-h-10 border border-input bg-background px-3 text-sm"
                >
                  <option value="all">Todas (ativas e inativas)</option>
                  <option value="active">Somente ativas agora</option>
                  <option value="inactive">Somente inativas</option>
                </select>
                <select
                  aria-label="Filtrar por última etapa"
                  value={stageFilter}
                  onChange={(e) => {
                    setStageFilter(e.target.value as "all" | FunnelStage);
                    setPage(1);
                  }}
                  className="min-h-10 border border-input bg-background px-3 text-sm"
                >
                  <option value="all">Todas as últimas etapas</option>
                  {FUNNEL_STAGES.map((stage) => (
                    <option key={stage} value={stage}>
                      {STAGE_SHORT_LABELS[stage]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {data.sessions.length === 0 ? (
              <div className="border border-border bg-secondary px-5 py-8 text-center text-sm text-muted-foreground">
                Nenhuma sessão encontrada para este recorte.
              </div>
            ) : (
              <div className="overflow-x-auto border border-border bg-background">
                <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                  <thead className="border-b border-border bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Sessão / Rota</th>
                      <th className="px-4 py-3 font-semibold">Estado</th>
                      <th className="px-4 py-3 font-semibold">Última etapa</th>
                      <th className="px-4 py-3 font-semibold">Etapas percorridas</th>
                      <th className="px-4 py-3 font-semibold">Última atividade (SP)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.sessions.map((session) => (
                      <tr key={session.sessionId} className="align-top">
                        <td className="px-4 py-3.5">
                          <code className="font-mono text-xs text-foreground">
                            #{session.sessionId.slice(0, 8)}
                          </code>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {session.firstPath === session.lastPath
                              ? session.lastPath
                              : `${session.firstPath} → ${session.lastPath}`}
                          </p>
                        </td>
                        <td className="px-4 py-3.5">
                          {session.isActive ? (
                            <span className="inline-flex items-center gap-1.5 border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                              Ativa agora
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 border border-border bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                              Inativa
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-medium text-foreground">
                            {STAGE_SHORT_LABELS[session.lastStage]}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {session.isActive ? "Em andamento" : "Parou nesta etapa"}
                          </p>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-wrap gap-1.5">
                            {reachedStages(session).map((stage) => (
                              <span
                                key={stage}
                                className="border border-border bg-secondary px-2 py-0.5 text-xs text-foreground"
                              >
                                {STAGE_SHORT_LABELS[stage]}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-xs text-muted-foreground">
                          {formatSaoPaulo(session.lastSeenAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <p className="text-muted-foreground">
                {data.totalCount}{" "}
                {data.totalCount === 1 ? "sessão no recorte" : "sessões no recorte"} — página{" "}
                {data.page} de {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || query.isFetching}
                  className="inline-flex min-h-10 items-center gap-1 border border-border bg-background px-3 text-sm disabled:opacity-50"
                >
                  <ChevronLeft size={16} /> Anterior
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || query.isFetching}
                  className="inline-flex min-h-10 items-center gap-1 border border-border bg-background px-3 text-sm disabled:opacity-50"
                >
                  Próxima <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </section>

          <footer className="border-t border-border pt-5 text-xs leading-6 text-muted-foreground">
            Privacidade e retenção: são armazenados apenas ID de sessão aleatório opaco, rotas
            públicas sem parâmetros, etapas do funil e horários de atividade. Nenhum nome, telefone,
            e-mail, texto de formulário, IP bruto ou fingerprint é salvo. Sessões sem atividade há
            mais de {data.retentionDays} dias são removidas automaticamente.
          </footer>
        </>
      )}
    </div>
  );
}
