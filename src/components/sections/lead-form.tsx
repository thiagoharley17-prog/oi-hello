import { useRef, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { saveLead } from "@/lib/leads.functions";
import { ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { services, siteMeta } from "@/data/site";
import { trackFunnelEvent } from "@/lib/telemetry";

export function LeadForm() {
  const [preparedUrl, setPreparedUrl] = useState("");
  const startedRef = useRef(false);

  function markFormStarted() {
    if (startedRef.current) return;
    startedRef.current = true;
    trackFunnelEvent("form_started", "lead_form");
  }

  const submitLead = useServerFn(saveLead);
  const submissionId = useRef<string | null>(null);
  const submitting = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;

    const fields = new FormData(event.currentTarget);
    const name = String(fields.get("name") ?? "").trim();
    const phone = String(fields.get("phone") ?? "").trim();
    const email = String(fields.get("email") ?? "").trim();
    const area = String(fields.get("area") ?? "");
    submissionId.current ??= crypto.randomUUID();
    submitting.current = true;
    setBusy(true);
    setError("");
    setPreparedUrl("");

    try {
      const { saved } = await submitLead({
        data: { id: submissionId.current, name, phone, email },
      });
      if (!saved) throw new Error("LEAD_NOT_SAVED");

      const text = `Olá, meu nome é ${name}. Gostaria de conversar com o escritório.\nTelefone para retorno: ${phone}${area ? `\nÁrea de interesse: ${area}` : ""}`;
      const url = new URL(siteMeta.whatsapp);
      url.searchParams.set("text", text);
      setPreparedUrl(url.href);
    } catch {
      setError(
        "Não foi possível registrar o contato. Tente novamente ou use o link do WhatsApp abaixo.",
      );
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      onFocus={markFormStarted}
      onChange={() => {
        markFormStarted();
        setPreparedUrl("");
        submissionId.current = null;
        setError("");
      }}
      className="grid gap-5 border border-border bg-background p-5 sm:p-8"
    >
      <h2 className="font-display text-2xl">Inicie uma conversa</h2>
      <fieldset disabled={busy} className="grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="lead-name">Nome</Label>
          <Input
            id="lead-name"
            name="name"
            autoComplete="name"
            minLength={2}
            maxLength={100}
            required
            onInput={(event) => event.currentTarget.setCustomValidity("")}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="lead-phone">Telefone para retorno</Label>
          <Input
            id="lead-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="(11) 99999-9999"
            pattern={String.raw`\+?(?:[ .\(\)\-]*[0-9]){10,15}[ .\(\)\-]*`}
            title="Informe o telefone com DDD. Você também pode incluir o código do país."
            maxLength={24}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="lead-email">E-mail</Label>
          <Input
            id="lead-email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="lead-area">Área de interesse (opcional)</Label>
          <select
            id="lead-area"
            name="area"
            className="min-h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Selecione uma área</option>
            {services.map(({ title }) => (
              <option key={title}>{title}</option>
            ))}
            <option>Outra área</option>
          </select>
        </div>
      </fieldset>
      <p className="text-sm leading-6 text-muted-foreground">
        Ao enviar, o escritório recebe seu nome, telefone e e-mail para responder ao seu contato.
        Você poderá continuar a conversa pelo WhatsApp.
      </p>
      <button
        type="submit"
        disabled={busy}
        className="action-link justify-self-start bg-primary text-primary-foreground"
      >
        {busy ? "Enviando…" : "Enviar dados de contato"} <ArrowUpRight size={16} />
      </button>
      {error && (
        <p role="alert" className="text-sm">
          {error}{" "}
          <a
            href={siteMeta.whatsapp}
            className="underline"
            onClick={() => trackFunnelEvent("whatsapp_direct_click", "contact_section")}
          >
            Abrir WhatsApp
          </a>
        </p>
      )}
      <div role="status" className="empty:hidden">
        {preparedUrl && (
          <p className="text-sm leading-6">
            Dados registrados. Se quiser continuar agora,{" "}
            <a
              href={preparedUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackFunnelEvent("whatsapp_attempt", "lead_form")}
              className="font-semibold underline"
            >
              abra a conversa no WhatsApp
            </a>
            .
          </p>
        )}
      </div>
    </form>
  );
}
