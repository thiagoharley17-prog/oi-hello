import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listApprovedComments, submitComment } from "@/lib/comments.functions";

export const commentsQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["blog-comments", slug],
    queryFn: () => listApprovedComments({ data: { slug } }),
  });

const dateFmt = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
  timeZone: "America/Sao_Paulo",
});

export function ArticleComments({ slug, question }: { slug: string; question?: string }) {
  const { data } = useSuspenseQuery(commentsQueryOptions(slug));
  const submit = useServerFn(submitComment);
  const startedAt = useRef(Date.now());
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setError(null);
    setStatus("sending");
    try {
      const res = await submit({
        data: {
          slug,
          displayName: String(fd.get("displayName") ?? ""),
          body: String(fd.get("body") ?? ""),
          website: String(fd.get("website") ?? ""),
          elapsedMs: Date.now() - startedAt.current,
        },
      });
      if (res.ok) {
        form.reset();
        setStatus("sent");
      } else {
        setError(res.error);
        setStatus("idle");
      }
    } catch {
      setError("Não foi possível enviar agora. Tente novamente mais tarde.");
      setStatus("idle");
    }
  }

  const fieldClass =
    "mt-1.5 w-full border border-input bg-background px-3 py-2.5 text-base focus-visible:outline-2 focus-visible:outline-offset-2";

  return (
    <section aria-labelledby="comentarios-titulo" className="border-t pt-8">
      <h2 id="comentarios-titulo" className="font-display text-2xl sm:text-3xl">
        Comentários
      </h2>

      {question && (
        <aside className="mt-5 border-l-2 border-gold bg-secondary px-5 py-4">
          <p className="section-label text-muted-foreground">Pergunta do escritório</p>
          <p className="mt-2 leading-7">{question}</p>
        </aside>
      )}

      {data.error ? (
        <p className="mt-6 text-sm text-muted-foreground">{data.error}</p>
      ) : data.comments.length === 0 ? (
        <p className="mt-6 text-sm leading-6 text-muted-foreground">
          Ainda não há comentários publicados neste artigo.
        </p>
      ) : (
        <ul className="mt-6 space-y-5">
          {data.comments.map((c) => (
            <li key={c.id} className="border-b pb-5">
              <p className="text-sm font-semibold">{c.display_name}</p>
              <p className="text-xs text-muted-foreground">
                {dateFmt.format(new Date(c.created_at))}
              </p>
              <p className="mt-2 whitespace-pre-line leading-7">{c.body}</p>
            </li>
          ))}
        </ul>
      )}

      <form method="post" onSubmit={onSubmit} className="mt-8 space-y-4" noValidate={false}>
        <h3 className="font-display text-xl">Deixe um comentário</h3>
        <p className="border border-border bg-secondary px-4 py-3 text-sm leading-6">
          Não inclua dados pessoais (CPF, telefone, e-mail, endereço) nem detalhes do seu caso. Os
          comentários são públicos, passam por moderação antes de aparecer e não substituem uma
          consulta jurídica.
        </p>
        <div>
          <label htmlFor="comment-name" className="text-sm font-medium">
            Nome de exibição
          </label>
          <input
            id="comment-name"
            name="displayName"
            required
            minLength={2}
            maxLength={60}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="comment-body" className="text-sm font-medium">
            Comentário
          </label>
          <textarea
            id="comment-body"
            name="body"
            required
            minLength={10}
            maxLength={1500}
            rows={5}
            className={fieldClass}
          />
        </div>
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="comment-website">Site</label>
          <input id="comment-website" name="website" tabIndex={-1} autoComplete="off" />
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        {status === "sent" && (
          <p role="status" className="text-sm">
            Obrigado! Seu comentário foi recebido e será publicado após a moderação.
          </p>
        )}
        <button
          type="submit"
          disabled={status === "sending"}
          className="action-link bg-primary text-primary-foreground disabled:opacity-60"
        >
          {status === "sending" ? "Enviando…" : "Enviar comentário"}
        </button>
      </form>
    </section>
  );
}
