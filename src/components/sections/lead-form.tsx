import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { siteMeta, services } from "@/data/site";

type Status = "idle" | "submitting" | "success";

export function LeadForm({ cta = "Enviar pedido de atendimento" }: { cta?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [data, setData] = useState({
    name: "",
    email: "",
    phone: "",
    area: services[0]?.title ?? "",
    description: "",
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("submitting");
    const text = encodeURIComponent(
      `Olá! Gostaria de atendimento jurídico.\n\nNome: ${data.name}\nÁrea: ${data.area}\nE-mail: ${data.email}\nWhatsApp: ${data.phone}\nDescrição: ${data.description}`
    );
    const url = `${siteMeta.whatsapp}?text=${text}`;

    setTimeout(() => {
      window.open(url, "_blank", "noopener,noreferrer");
      setStatus("success");
      toast.success("Pedido enviado!", {
        description: `Recebemos o contato: ${data.name}. Nossa equipe fará o primeiro retorno em breve.`,
      });
    }, 600);
  };

  if (status === "success") {
    return (
      <div className="rounded-2xl border bg-card p-6 text-card-foreground shadow-sm sm:p-8">
        <div className="flex items-start gap-4">
          <CheckCircle2 className="h-10 w-10 shrink-0 text-gold" />
          <div>
            <h3 className="text-xl font-semibold">Sua solicitação foi registrada</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Obrigado pelo interesse. A equipe do escritório fará o primeiro contato para entender sua necessidade
              e apresentar o próximo passo adequado.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 rounded-2xl border bg-card p-6 text-card-foreground shadow-sm sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="lead-name">Nome</Label>
          <Input id="lead-name" required value={data.name} onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))} placeholder="Seu nome completo" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="lead-email">E-mail</Label>
          <Input id="lead-email" type="email" required value={data.email} onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))} placeholder="voce@exemplo.com.br" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="lead-phone">WhatsApp</Label>
          <Input id="lead-phone" required value={data.phone} onChange={(e) => setData((d) => ({ ...d, phone: e.target.value }))} placeholder="(00) 00000-0000" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="lead-area">Área de interesse</Label>
          <Select
            name="lead-area"
            value={data.area}
            onValueChange={(value) => setData((d) => ({ ...d, area: value }))}
          >
            <SelectTrigger aria-label="Área de interesse">
              <SelectValue placeholder="Selecione uma área" />
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service.title} value={service.title}>{service.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="lead-description">Como podemos ajudar?</Label>
        <Textarea
          id="lead-description"
          required
          value={data.description}
          onChange={(e) => setData((d) => ({ ...d, description: e.target.value }))}
          placeholder="Relate brevemente a situação e o que você precisa resolver"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">Resposta em até 1 dia útil. Seus dados são tratados com sigilo.</p>
        <Button type="submit" size="lg" disabled={status === "submitting"} className="w-full sm:w-auto">
          {status === "submitting" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {status === "submitting" ? "Enviando..." : cta}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Prefere falar direto? Clique no <a href={siteMeta.whatsapp} target="_blank" rel="noreferrer" className="font-medium text-gold hover:underline">WhatsApp</a> para atendimento rápido.
      </p>
    </form>
  );
}
