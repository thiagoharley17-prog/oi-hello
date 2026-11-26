import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { AdminSiteEditor } from "@/components/admin/admin-site-editor";
import { defaultSiteContent } from "@/lib/site-content";
import {
  createSitePreset,
  getEditorContent,
  getSitePreset,
  listSitePresets,
  writeEditorContent,
} from "@/lib/site-content.functions";

vi.mock("@tanstack/react-start", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-start")>()),
  useServerFn: (fn: unknown) => fn,
}));
vi.mock("@/lib/site-content.functions", () => ({
  getEditorContent: vi.fn(),
  createSitePreset: vi.fn(),
  getSitePreset: vi.fn(),
  listSitePresets: vi.fn(),
  writeEditorContent: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it("keeps drafts and publishing separate and uses the latest revision per slot", async () => {
  const existingRevision = "42ddf83f-7a0b-4b93-bd7f-8eac7e5e2cda";
  const nextRevision = "c76be2cb-21ab-4a68-9218-89cf812ca8b4";
  vi.mocked(getEditorContent).mockResolvedValue({
    document: defaultSiteContent,
    draftRevision: null,
    publishedRevision: existingRevision,
  });
  vi.mocked(writeEditorContent).mockResolvedValue({ revision: nextRevision });

  render(
    <QueryClientProvider client={new QueryClient()}>
      <AdminSiteEditor />
    </QueryClientProvider>,
  );
  fireEvent.change(await screen.findByLabelText("Nome da marca"), {
    target: { value: "Nova marca" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Salvar rascunho" }));
  await screen.findByText("Rascunho salvo.");
  expect(writeEditorContent).toHaveBeenCalledWith({
    data: expect.objectContaining({
      slot: "draft",
      expectedRevision: null,
      document: expect.objectContaining({ brand: expect.objectContaining({ name: "Nova marca" }) }),
    }),
  });

  fireEvent.click(screen.getByRole("button", { name: "Publicar no site" }));
  expect(writeEditorContent).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole("button", { name: "Confirmar publicação" }));
  await waitFor(() =>
    expect(writeEditorContent).toHaveBeenLastCalledWith({
      data: expect.objectContaining({ slot: "published", expectedRevision: existingRevision }),
    }),
  );
  await screen.findByText("Alterações publicadas no site.");
});

it("saves separate presets and restores one without saving or publishing the editor", async () => {
  const original = {
    id: "42ddf83f-7a0b-4b93-bd7f-8eac7e5e2cda",
    name: "Site institucional",
    created_at: "2026-11-26T12:00:00Z",
  };
  const alternate = {
    id: "c76be2cb-21ab-4a68-9218-89cf812ca8b4",
    name: "Campanha",
    created_at: "2026-11-26T13:00:00Z",
  };
  vi.mocked(getEditorContent).mockResolvedValue({
    document: defaultSiteContent,
    draftRevision: null,
    publishedRevision: null,
  });
  vi.mocked(listSitePresets)
    .mockResolvedValueOnce([original])
    .mockResolvedValue([alternate, original]);
  vi.mocked(createSitePreset).mockResolvedValue(alternate);
  vi.mocked(getSitePreset).mockResolvedValue(defaultSiteContent);

  render(
    <QueryClientProvider client={new QueryClient()}>
      <AdminSiteEditor />
    </QueryClientProvider>,
  );
  expect(await screen.findByLabelText("Logotipo")).toHaveAttribute("type", "file");
  fireEvent.change(screen.getByLabelText("Nome da marca"), {
    target: { value: "Marca da campanha" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Predefinições" }));
  await screen.findByText(original.name);
  fireEvent.change(screen.getByLabelText("Nome da predefinição"), {
    target: { value: alternate.name },
  });
  fireEvent.click(screen.getByRole("button", { name: "Salvar nova predefinição" }));
  await screen.findByText("Nova predefinição salva.");
  expect(createSitePreset).toHaveBeenCalledWith({
    data: {
      name: alternate.name,
      document: expect.objectContaining({
        brand: expect.objectContaining({ name: "Marca da campanha" }),
      }),
    },
  });
  expect(screen.getByText(original.name)).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Carregar Site institucional" }));
  fireEvent.click(screen.getByRole("button", { name: "Carregar no editor" }));
  await screen.findByText(/Predefinição carregada no editor/);
  fireEvent.click(screen.getByRole("button", { name: "Identidade" }));
  expect(screen.getByLabelText("Nome da marca")).toHaveValue(defaultSiteContent.brand.name);
  expect(writeEditorContent).not.toHaveBeenCalled();
});
