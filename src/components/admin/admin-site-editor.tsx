import { SiteImageField } from "./site-image-field";
import { resolveSiteImagePreviews } from "./site-image-preview";
import { SitePresets } from "./site-presets";
import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowDown, ArrowUp, Eye, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Footer } from "@/components/sections/footer";
import { Header } from "@/components/sections/header";
import { HomePage } from "@/components/sections/home-page";
import { SiteContentContext } from "@/components/sections/site-content-context";
import {
  sectionNames,
  siteContentSchema,
  siteDraftSchema,
  siteTheme,
  type SiteContent,
} from "@/lib/site-content";
import { getEditorContent, writeEditorContent } from "@/lib/site-content.functions";

const fields = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm";
const groups = [
  "Identidade",
  "Página inicial",
  "Áreas e equipe",
  "Contato e perguntas",
  "Artigos",
  "Predefinições",
] as const;
type EditorData = Awaited<ReturnType<typeof getEditorContent>>;

function Field({
  label,
  value,
  change,
  multiline = false,
  hint,
}: {
  label: string;
  value: string;
  change: (value: string) => void;
  multiline?: boolean;
  hint?: string;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      {label}
      {multiline ? (
        <textarea
          className={fields}
          rows={4}
          value={value}
          onChange={(e) => change(e.target.value)}
        />
      ) : (
        <input className={fields} value={value} onChange={(e) => change(e.target.value)} />
      )}
      {hint && <small className="font-normal text-muted-foreground">{hint}</small>}
    </label>
  );
}

function Collection<T>({
  label,
  items,
  change,
  make,
  max,
  itemLabel,
  children,
}: {
  label: string;
  items: T[];
  change: (items: T[]) => void;
  make?: () => T;
  max?: number;
  itemLabel: (item: T) => string;
  children: (item: T, change: (item: T) => void) => ReactNode;
}) {
  function move(item: T, from: number, to: number) {
    const next = [...items];
    next.splice(from, 1);
    next.splice(to, 0, item);
    change(next);
  }
  return (
    <fieldset className="grid min-w-0 gap-3">
      <legend className="mb-3 text-lg font-semibold">{label}</legend>
      {items.map((item, index) => (
        <details key={index} className="min-w-0 rounded-md border bg-background">
          <summary className="cursor-pointer px-4 py-3 font-medium">
            {itemLabel(item) || `Item ${index + 1}`}
          </summary>
          <div className="grid gap-4 border-t px-4 py-4">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={index === 0}
                onClick={() => move(item, index, index - 1)}
              >
                <ArrowUp /> Subir
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={index === items.length - 1}
                onClick={() => move(item, index, index + 1)}
              >
                <ArrowDown /> Descer
              </Button>
              {make && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => change(items.filter((_, i) => i !== index))}
                >
                  <Trash2 /> Remover
                </Button>
              )}
            </div>
            {children(item, (next) =>
              change(items.map((current, i) => (i === index ? next : current))),
            )}
          </div>
        </details>
      ))}
      {make && (
        <Button
          type="button"
          variant="outline"
          className="justify-self-start"
          disabled={items.length >= (max ?? Infinity)}
          onClick={() => change([...items, make()])}
        >
          <Plus /> Adicionar
        </Button>
      )}
    </fieldset>
  );
}

function ColorField({
  label,
  value,
  change,
  fallback,
}: {
  label: string;
  value: string;
  change: (value: string) => void;
  fallback: string;
}) {
  return (
    <div className="grid gap-2 rounded-md border p-3">
      <label className="flex items-center justify-between gap-3 text-sm font-medium">
        {label}
        <input
          type="color"
          className="h-9 w-14 cursor-pointer"
          value={value || fallback}
          onChange={(e) => change(e.target.value)}
        />
      </label>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="justify-self-start"
        disabled={!value}
        onClick={() => change("")}
      >
        Usar cor original
      </Button>
    </div>
  );
}

function TextFields<T extends object>({
  value,
  change,
  entries,
  onUploadState,
}: {
  value: T;
  change: (value: T) => void;
  onUploadState?: (uploading: boolean) => void;
  entries: Array<[keyof T, string, (boolean | "image" | "optional-image")?]>;
}) {
  return entries.map(([key, label, kind]) => {
    const text = String(value[key] ?? "");
    const onChange = (next: string) => change({ ...value, [key]: next });
    if (kind === "image" || kind === "optional-image") {
      return (
        <SiteImageField
          key={String(key)}
          label={label}
          value={text}
          change={onChange}
          optional={kind === "optional-image"}
          onUploadState={onUploadState}
        />
      );
    }
    return (
      <Field
        key={String(key)}
        label={label}
        value={text}
        multiline={kind === true}
        change={onChange}
      />
    );
  });
}

export function AdminSiteEditor() {
  const load = useServerFn(getEditorContent);
  const query = useQuery({
    queryKey: ["private-site-editor"],
    queryFn: () => load(),
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
  if (query.isPending)
    return (
      <p className="p-8" role="status">
        Carregando editor…
      </p>
    );
  if (query.isError)
    return (
      <section className="p-8">
        <p role="alert">
          Não foi possível carregar o editor. Confira sua sessão e tente novamente.
        </p>
        <Button variant="outline" className="mt-3" onClick={() => void query.refetch()}>
          Tentar novamente
        </Button>
      </section>
    );
  return (
    <Editor
      initial={query.data}
      reload={async () => {
        const result = await query.refetch({ throwOnError: true });
        if (!result.data) throw new Error("CONTENT_READ_FAILED");
        return result.data;
      }}
    />
  );
}

function SitePreview({ document }: { document: SiteContent }) {
  const query = useQuery({
    queryKey: ["private-site-preview", document],
    queryFn: () => resolveSiteImagePreviews(document),
    staleTime: 45 * 60_000,
    gcTime: 60_000,
    retry: false,
  });
  if (query.isPending)
    return (
      <p className="p-4" role="status">
        Preparando prévia…
      </p>
    );
  if (query.isError)
    return (
      <p className="p-4" role="alert">
        Não foi possível carregar as imagens da prévia.
      </p>
    );
  return (
    <SiteContentContext.Provider value={query.data}>
      <div inert className="bg-background text-foreground" style={siteTheme(query.data.brand)}>
        <Header />
        <HomePage preview />
        <Footer />
      </div>
    </SiteContentContext.Provider>
  );
}

function Editor({ initial, reload }: { initial: EditorData; reload: () => Promise<EditorData> }) {
  const [document, setDocument] = useState(initial.document);
  const [revisions, setRevisions] = useState(initial);
  const [group, setGroup] = useState<(typeof groups)[number]>("Identidade");
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [failed, setFailed] = useState(false);
  const [conflict, setConflict] = useState(false);
  const write = useServerFn(writeEditorContent);
  const validPreview = siteContentSchema.safeParse(document);
  const update = <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => {
    setDocument((current) => ({ ...current, [key]: value }));
  };

  async function save(slot: "draft" | "published") {
    const parsed = (slot === "draft" ? siteDraftSchema : siteContentSchema).safeParse(document);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      setFailed(true);
      setFeedback(`Revise o conteúdo. ${issue?.path.join(" › ") ?? ""} ${issue?.message ?? ""}`);
      return;
    }
    setBusy(true);
    setFeedback("");
    try {
      const key = slot === "draft" ? "draftRevision" : "publishedRevision";
      const { revision } = await write({
        data: { slot, expectedRevision: revisions[key], document: parsed.data },
      });
      if (!revision) {
        setFailed(true);
        setConflict(true);
        setFeedback("Outra edição foi salva. Recarregue a versão mais recente antes de continuar.");
        return;
      }
      setRevisions((current) => ({ ...current, [key]: revision }));
      setDocument(parsed.data);
      setFailed(false);
      setFeedback(slot === "draft" ? "Rascunho salvo." : "Alterações publicadas no site.");
    } catch {
      setFailed(true);
      setFeedback("Não foi possível salvar. Verifique sua conexão e sessão e tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  const { brand, hero, about, sections, team, services, faqs, contact, articles } = document;
  return (
    <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <h1 className="font-display text-4xl">Editar site</h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
        Edite o conteúdo, confira a prévia e publique quando estiver pronto.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" disabled={uploading || !validPreview.success}>
              <Eye /> Prévia
            </Button>
          </DialogTrigger>
          {validPreview.success && (
            <DialogContent
              className="max-h-[92dvh] w-[96vw] max-w-[96vw] overflow-auto p-0 sm:max-w-6xl"
              aria-describedby={undefined}
            >
              <DialogTitle className="p-4 pr-12">Prévia da página inicial</DialogTitle>
              <SitePreview document={validPreview.data} />
            </DialogContent>
          )}
        </Dialog>
        <Button
          type="button"
          variant="outline"
          disabled={busy || uploading || conflict}
          onClick={() => void save("draft")}
        >
          <Save /> Salvar rascunho
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button type="button" disabled={busy || uploading || conflict}>
              Publicar no site
            </Button>
          </DialogTrigger>
          <DialogContent aria-describedby={undefined}>
            <DialogTitle>Publicar alterações?</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Os visitantes passarão a ver o conteúdo atual do editor.
            </p>
            <DialogClose asChild>
              <Button
                type="button"
                disabled={busy || uploading || conflict}
                onClick={() => void save("published")}
              >
                Confirmar publicação
              </Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </div>
      {feedback && (
        <p className="mt-4 text-sm" role={failed ? "alert" : "status"}>
          {feedback}
        </p>
      )}
      {conflict && (
        <Button
          variant="outline"
          className="mt-3"
          disabled={busy || uploading}
          onClick={async () => {
            setBusy(true);
            try {
              const latest = await reload();
              setRevisions(latest);
              setDocument(latest.document);
              setConflict(false);
              setFailed(false);
              setFeedback("Versão mais recente carregada.");
            } catch {
              setFailed(true);
              setFeedback("Não foi possível recarregar o conteúdo.");
            } finally {
              setBusy(false);
            }
          }}
        >
          Descartar esta edição e recarregar
        </Button>
      )}
      <nav aria-label="Grupos do editor" className="mb-5 mt-7 flex flex-wrap gap-2 border-b pb-4">
        {groups.map((item) => (
          <Button
            key={item}
            type="button"
            variant={group === item ? "default" : "outline"}
            aria-pressed={group === item}
            disabled={busy || uploading}
            onClick={() => setGroup(item)}
          >
            {item}
          </Button>
        ))}
      </nav>
      <fieldset disabled={busy || uploading} className="grid min-w-0 max-w-4xl gap-6">
        {group === "Identidade" && (
          <>
            <TextFields
              value={brand}
              change={(next) => update("brand", next)}
              onUploadState={setUploading}
              entries={[
                ["name", "Nome da marca"],
                ["legalName", "Nome completo"],
                ["logo", "Logotipo", "image"],
                ["favicon", "Ícone da aba", "image"],
              ]}
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <ColorField
                label="Cor principal"
                fallback="#122928"
                value={brand.primary}
                change={(value) => update("brand", { ...brand, primary: value })}
              />
              <ColorField
                label="Cor de destaque"
                fallback="#ddb879"
                value={brand.accent}
                change={(value) => update("brand", { ...brand, accent: value })}
              />
              <ColorField
                label="Cor de fundo"
                fallback="#fbf9f1"
                value={brand.background}
                change={(value) => update("brand", { ...brand, background: value })}
              />
            </div>
          </>
        )}
        {group === "Página inicial" && (
          <>
            <h2 className="text-lg font-semibold">Banner inicial</h2>
            <TextFields
              value={hero}
              change={(next) => update("hero", next)}
              onUploadState={setUploading}
              entries={[
                ["title", "Título"],
                ["text", "Texto do banner", true],
                ["image", "Imagem do banner", "image"],
                ["imageAlt", "Descrição da imagem"],
                ["caption", "Legenda"],
                ["action", "Texto do botão de atendimento"],
              ]}
            />
            <h2 className="text-lg font-semibold">O escritório</h2>
            <Field
              label="Título do escritório"
              value={about.title}
              change={(value) => update("about", { ...about, title: value })}
            />
            <Field
              label="Apresentação do escritório"
              value={about.paragraphs.join("\n\n")}
              multiline
              hint="Separe os parágrafos com uma linha em branco."
              change={(value) => update("about", { ...about, paragraphs: value.split("\n\n") })}
            />
            <Collection
              label="Ordem e conteúdo das seções"
              items={sections}
              change={(next) => update("sections", next)}
              itemLabel={(item) => (item.kind === "custom" ? item.title : sectionNames[item.kind])}
            >
              {(item, change) => (
                <>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={item.enabled}
                      onChange={(e) => change({ ...item, enabled: e.target.checked })}
                    />{" "}
                    Visível na página inicial
                  </label>
                  {item.kind === "custom" && (
                    <>
                      <TextFields
                        value={item}
                        change={change}
                        onUploadState={setUploading}
                        entries={[
                          ["title", "Título da seção"],
                          ["text", "Texto da seção", true],
                          ["image", "Imagem opcional", "optional-image"],
                        ]}
                      />
                      <Collection
                        label="Itens do catálogo"
                        items={item.cards}
                        change={(cards) => change({ ...item, cards })}
                        make={() => ({
                          id: crypto.randomUUID(),
                          title: "Novo item",
                          text: "",
                          image: "",
                          link: "",
                        })}
                        max={20}
                        itemLabel={(card) => card.title}
                      >
                        {(card, changeCard) => (
                          <TextFields
                            value={card}
                            change={changeCard}
                            onUploadState={setUploading}
                            entries={[
                              ["title", "Título do item"],
                              ["text", "Descrição", true],
                              ["image", "Imagem opcional", "optional-image"],
                              ["link", "Link opcional"],
                            ]}
                          />
                        )}
                      </Collection>
                      <Button
                        type="button"
                        variant="outline"
                        className="justify-self-start"
                        onClick={() =>
                          update(
                            "sections",
                            sections.filter(({ id }) => id !== item.id),
                          )
                        }
                      >
                        <Trash2 /> Remover seção
                      </Button>
                    </>
                  )}
                </>
              )}
            </Collection>
            <Button
              type="button"
              variant="outline"
              className="justify-self-start"
              disabled={sections.length >= 27}
              onClick={() =>
                update("sections", [
                  ...sections,
                  {
                    id: crypto.randomUUID(),
                    kind: "custom",
                    enabled: true,
                    title: "Nova seção",
                    text: "",
                    image: "",
                    cards: [],
                  },
                ])
              }
            >
              <Plus /> Criar seção
            </Button>
          </>
        )}
        {group === "Áreas e equipe" && (
          <>
            <Field
              label="Título das áreas de atuação"
              value={document.servicesTitle}
              change={(value) => update("servicesTitle", value)}
            />
            <Field
              label="Apresentação das áreas"
              value={document.servicesIntro}
              multiline
              change={(value) => update("servicesIntro", value)}
            />
            <Collection
              label="Áreas de atuação"
              items={services}
              change={(next) => update("services", next)}
              max={24}
              make={() => ({
                initials: "DC" as const,
                title: "Nova área",
                description: "",
                bullets: [],
              })}
              itemLabel={(item) => item.title}
            >
              {(item, change) => (
                <>
                  <TextFields
                    value={item}
                    change={change}
                    entries={[
                      ["title", "Nome da área"],
                      ["description", "Descrição", true],
                    ]}
                  />
                  <label className="grid gap-1.5 text-sm font-medium">
                    Ícone
                    <select
                      className={fields}
                      value={item.initials}
                      onChange={(e) =>
                        change({ ...item, initials: e.target.value as typeof item.initials })
                      }
                    >
                      {[
                        ["DC", "Balança"],
                        ["DF", "Aperto de mãos"],
                        ["DT", "Maleta"],
                        ["DP", "Martelo"],
                        ["DCO", "Sacola"],
                        ["DE", "Edifício"],
                        ["DPR", "Escudo"],
                      ].map(([value, name]) => (
                        <option value={value} key={value}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Field
                    label="Tópicos"
                    hint="Um tópico por linha."
                    multiline
                    value={item.bullets.join("\n")}
                    change={(value) =>
                      change({ ...item, bullets: value === "" ? [] : value.split("\n") })
                    }
                  />
                </>
              )}
            </Collection>
            <Field
              label="Título da equipe"
              value={document.teamTitle}
              change={(value) => update("teamTitle", value)}
            />
            <Collection
              label="Equipe"
              items={team}
              change={(next) => update("team", next)}
              max={16}
              make={() => ({ name: "Novo integrante", role: "", image: "" })}
              itemLabel={(item) => item.name}
            >
              {(item, change) => (
                <TextFields
                  value={item}
                  change={change}
                  onUploadState={setUploading}
                  entries={[
                    ["name", "Nome"],
                    ["role", "Cargo"],
                    ["image", "Foto", "image"],
                  ]}
                />
              )}
            </Collection>
          </>
        )}
        {group === "Contato e perguntas" && (
          <>
            <TextFields
              value={contact}
              change={(next) => update("contact", next)}
              entries={[
                ["title", "Título do contato"],
                ["phone", "Telefone exibido"],
                ["whatsapp", "WhatsApp com DDI e DDD, só dígitos"],
                ["instagram", "URL do Instagram"],
              ]}
            />
            <Collection
              label="Endereços"
              items={contact.addresses}
              change={(addresses) => update("contact", { ...contact, addresses })}
              max={10}
              make={() => ({ city: "", address: "" })}
              itemLabel={(item) => item.city}
            >
              {(item, change) => (
                <TextFields
                  value={item}
                  change={change}
                  entries={[
                    ["city", "Cidade"],
                    ["address", "Endereço"],
                  ]}
                />
              )}
            </Collection>
            <Field
              label="Título das perguntas frequentes"
              value={document.faqTitle}
              change={(value) => update("faqTitle", value)}
            />
            <Collection
              label="Perguntas frequentes"
              items={faqs}
              change={(next) => update("faqs", next)}
              max={24}
              make={() => ({ question: "", answer: "" })}
              itemLabel={(item) => item.question}
            >
              {(item, change) => (
                <TextFields
                  value={item}
                  change={change}
                  entries={[
                    ["question", "Pergunta"],
                    ["answer", "Resposta", true],
                  ]}
                />
              )}
            </Collection>
          </>
        )}
        {group === "Artigos" && (
          <>
            <Field
              label="Título do blog"
              value={document.blogTitle}
              change={(value) => update("blogTitle", value)}
            />
            <Collection
              label="Artigos do blog"
              items={articles}
              change={(next) => update("articles", next)}
              max={60}
              make={() => ({
                title: "Novo artigo",
                slug: "",
                topic: "",
                summary: "",
                image: "",
                question: "",
                sections: [{ title: "", text: "" }],
              })}
              itemLabel={(item) => item.title}
            >
              {(item, change) => (
                <>
                  <TextFields
                    value={item}
                    change={change}
                    onUploadState={setUploading}
                    entries={[
                      ["title", "Título do artigo"],
                      ["slug", "Endereço do artigo (exemplo: guia-de-contratos)"],
                      ["topic", "Assunto"],
                      ["summary", "Resumo", true],
                      ["image", "Imagem do artigo", "image"],
                      ["question", "Pergunta para comentários (opcional)"],
                    ]}
                  />
                  <Collection
                    label="Partes do artigo"
                    items={item.sections}
                    change={(parts) => change({ ...item, sections: parts })}
                    max={20}
                    make={() => ({ title: "", text: "" })}
                    itemLabel={(part) => part.title}
                  >
                    {(part, changePart) => (
                      <TextFields
                        value={part}
                        change={changePart}
                        entries={[
                          ["title", "Subtítulo"],
                          ["text", "Texto", true],
                        ]}
                      />
                    )}
                  </Collection>
                </>
              )}
            </Collection>
          </>
        )}
        {group === "Predefinições" && (
          <SitePresets
            document={document}
            onBusy={setBusy}
            onLoad={(next) => {
              setDocument(next);
              setFailed(false);
              setFeedback("Predefinição carregada no editor. Confira a prévia antes de publicar.");
            }}
          />
        )}
      </fieldset>
    </section>
  );
}
