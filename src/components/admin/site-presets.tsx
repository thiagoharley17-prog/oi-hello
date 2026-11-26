import { useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Archive, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createSitePreset, getSitePreset, listSitePresets } from "@/lib/site-content.functions";
import { siteDraftSchema, type SiteContent } from "@/lib/site-content";

const queryKey = ["private-site-presets"];
const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

export function SitePresets({
  document,
  onLoad,
  onBusy,
}: {
  document: SiteContent;
  onLoad: (document: SiteContent) => void;
  onBusy: (busy: boolean) => void;
}) {
  const fetchList = useServerFn(listSitePresets);
  const fetchPreset = useServerFn(getSitePreset);
  const createPreset = useServerFn(createSitePreset);
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey, queryFn: () => fetchList(), retry: false });
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<{ text: string; error: boolean } | null>(null);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !name.trim()) return;
    const checked = siteDraftSchema.safeParse(document);
    if (!checked.success) {
      setNotice({
        error: true,
        text: "Revise os campos da configuração antes de salvar esta predefinição.",
      });
      return;
    }
    setPending(true);
    onBusy(true);
    setNotice(null);
    try {
      const preset = await createPreset({ data: { name: name.trim(), document: checked.data } });
      queryClient.setQueryData<Awaited<ReturnType<typeof listSitePresets>>>(queryKey, (current) =>
        current ? [preset, ...current.filter((item) => item.id !== preset.id)] : undefined,
      );
      void queryClient.invalidateQueries({ queryKey });
      setName("");
      setNotice({ error: false, text: "Nova predefinição salva." });
    } catch {
      setNotice({
        error: true,
        text: "Não foi possível salvar a predefinição. Confira sua sessão e tente novamente.",
      });
    } finally {
      setPending(false);
      onBusy(false);
    }
  }

  async function load(id: string) {
    if (pending) return;
    setPending(true);
    onBusy(true);
    setNotice(null);
    try {
      onLoad(await fetchPreset({ data: id }));
    } catch {
      setNotice({ error: true, text: "Não foi possível carregar a predefinição." });
    } finally {
      setPending(false);
      onBusy(false);
    }
  }

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-lg font-semibold">Predefinições do site</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Salve uma cópia da configuração atual, com cores, imagens, textos e seções.
        </p>
      </div>
      <form onSubmit={(event) => void save(event)} className="flex flex-wrap items-end gap-3">
        <label className="grid flex-1 basis-56 gap-1.5 text-sm font-medium">
          Nome da predefinição
          <input
            required
            value={name}
            maxLength={80}
            onChange={(event) => setName(event.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2"
            placeholder="Ex.: Site institucional"
          />
        </label>
        <Button type="submit" variant="outline" disabled={pending || !name.trim()}>
          <Save /> Salvar nova predefinição
        </Button>
      </form>
      {notice && (
        <p role={notice.error ? "alert" : "status"} className="text-sm">
          {notice.text}
        </p>
      )}
      {query.isPending && <p role="status">Carregando predefinições…</p>}
      {query.isError && (
        <div>
          <p role="alert">Não foi possível consultar as predefinições.</p>
          <Button type="button" variant="outline" onClick={() => void query.refetch()}>
            Tentar novamente
          </Button>
        </div>
      )}
      {query.data?.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhuma predefinição salva.</p>
      )}
      {Boolean(query.data?.length) && (
        <ul className="divide-y rounded-md border">
          {query.data?.map((preset) => (
            <li key={preset.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="break-all font-medium">{preset.name}</p>
                <time className="text-sm text-muted-foreground" dateTime={preset.created_at}>
                  {dateFormatter.format(new Date(preset.created_at))}
                </time>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={pending}
                    aria-label={`Carregar ${preset.name}`}
                  >
                    <Archive /> Carregar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>Carregar {preset.name}?</DialogTitle>
                  <DialogDescription>
                    A cópia substituirá o que está aberto no editor. Salve uma predefinição primeiro
                    se quiser guardar suas alterações atuais. O site publicado só muda quando você
                    publicar.
                  </DialogDescription>
                  <DialogClose asChild>
                    <Button type="button" onClick={() => void load(preset.id)}>
                      Carregar no editor
                    </Button>
                  </DialogClose>
                </DialogContent>
              </Dialog>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
