import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { AdminSiteEditor } from "@/components/admin/admin-site-editor";
import { defaultSiteContent } from "@/lib/site-content";
import { getEditorContent, writeEditorContent } from "@/lib/site-content.functions";

vi.mock("@tanstack/react-start", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-start")>()),
  useServerFn: (fn: unknown) => fn,
}));
vi.mock("@/lib/site-content.functions", () => ({
  getEditorContent: vi.fn(),
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
