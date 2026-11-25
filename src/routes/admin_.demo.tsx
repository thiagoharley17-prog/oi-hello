import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export const Route = createFileRoute("/admin_/demo")({
  component: AdminDemoPage,
  head: () => ({
    meta: [
      { title: "Demonstração do painel | HL & Bezerra" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function AdminDemoPage() {
  return (
    <>
      <div className="border-b border-gold/40 bg-secondary">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <p className="text-sm">
            <strong>Dados fictícios.</strong> Use os filtros para explorar o painel.
          </p>
          <Link to="/admin" className="text-sm font-semibold underline underline-offset-4">
            Ir para o painel privado
          </Link>
        </div>
      </div>
      <AdminDashboard demo />
    </>
  );
}
