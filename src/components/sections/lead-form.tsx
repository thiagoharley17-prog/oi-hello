import { useState, type FormEvent } from "react";
import { ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { services, siteMeta } from "@/data/site";

export function LeadForm() {
  const [preparedUrl, setPreparedUrl] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const name = String(fields.get("name") ?? "").trim();
    const area = String(fields.get("area") ?? "");
    if (!name) {
      const nameInput = event.currentTarget.elements.namedItem("name");
      if (nameInput instanceof HTMLInputElement) {
        nameInput.setCustomValidity("Informe seu nome.");
        nameInput.reportValidity();
      }
      return;
    }
    const text = `Olá, meu nome é ${name}. Gostaria de conversar com o escritório.${area ? ` Área de interesse: ${area}.` : ""}`;
    const url = new URL(siteMeta.whatsapp);
    url.searchParams.set("text", text);
    setPreparedUrl(url.href);
    window.open(url.href, "_blank", "noopener,noreferrer");
  }

  return (
    <form
      onSubmit={handleSubmit}
      onChange={() => setPreparedUrl("")}
      className="grid gap-5 border border-border bg-background p-5 sm:p-8"
    >
      <h2 className="font-display text-2xl">Inicie uma conversa</h2>
      <div className="grid gap-2">
        <Label htmlFor="lead-name">Nome</Label>
        <Input
          id="lead-name"
          name="name"
          autoComplete="name"
          maxLength={100}
          required
          onInput={(event) => event.currentTarget.setCustomValidity("")}
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
      <p className="text-sm leading-6 text-muted-foreground">
        Você poderá revisar e enviar a mensagem no WhatsApp.
      </p>
      <button
        type="submit"
        className="action-link justify-self-start bg-primary text-primary-foreground"
      >
        Abrir WhatsApp <ArrowUpRight size={16} />
      </button>
      <div role="status" className="empty:hidden">
        {preparedUrl && (
          <p className="text-sm leading-6">
            Mensagem preparada. Se o aplicativo não abriu,{" "}
            <a
              href={preparedUrl}
              target="_blank"
              rel="noreferrer"
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
