import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { listLeads } from "@/lib/leads.functions";

const queryKey = ["private-site-leads"];
const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

export function AdminLeads() {
  const queryClient = useQueryClient();
  const fetchLeads = useServerFn(listLeads);
  const query = useQuery({
    queryKey,
    queryFn: () => fetchLeads(),
    refetchInterval: 10_000,
    retry: false,
  });

  useEffect(() => {
    let closed = false;
    const channel = supabase.channel("private-site-leads");
    void supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (!data.session || closed) return;
        await supabase.realtime.setAuth();
        if (closed) return;
        channel
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "site_leads" },
            () => {
              void queryClient.invalidateQueries({ queryKey });
            },
          )
          .subscribe((status) => {
            if (status === "SUBSCRIBED") void queryClient.invalidateQueries({ queryKey });
          });
      })
      .catch(() => undefined);
    return () => {
      closed = true;
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <h1 className="font-display text-4xl">Leads</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Até 100 contatos mais recentes, registrados no envio do formulário.
      </p>
      {query.isPending && (
        <p role="status" className="mt-6">
          Carregando contatos…
        </p>
      )}
      {query.isError && (
        <p role="alert" className="mt-6">
          Não foi possível consultar os contatos.{" "}
          <button className="underline" onClick={() => void query.refetch()}>
            Tentar novamente
          </button>
        </p>
      )}
      {query.isSuccess && query.data.length === 0 && (
        <p className="mt-6">Nenhum contato recebido até agora.</p>
      )}
      {query.isSuccess && query.data.length > 0 && (
        <div className="mt-6 overflow-x-auto border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary">
              <tr>
                {["Nome", "Telefone", "E-mail", "Recebido em"].map((heading) => (
                  <th key={heading} scope="col" className="px-4 py-3">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {query.data.map((lead) => (
                <tr key={lead.id} className="border-t border-border">
                  <td className="px-4 py-3">{lead.name}</td>
                  <td className="whitespace-nowrap px-4 py-3">{lead.phone}</td>
                  <td className="px-4 py-3">{lead.email}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {dateFormatter.format(new Date(lead.created_at))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
