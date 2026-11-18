import { createFileRoute } from "@tanstack/react-router";
import { ArticleList } from "@/components/sections/blog";
import { articles } from "@/data/articles";

export const Route = createFileRoute("/blog/")({
  component: BlogPage,
  head: () => ({
    meta: [
      { title: "Blog | HL & Bezerra Advocacia" },
      {
        name: "description",
        content:
          "Artigos da HL & Bezerra sobre contratos, relações de trabalho, direito do consumidor e outros temas jurídicos.",
      },
      { property: "og:title", content: "Blog | HL & Bezerra Advocacia" },
    ],
  }),
});

function BlogPage() {
  return (
    <section className="bg-secondary">
      <div className="section-wrap">
        <h1 className="section-title mt-0">Blog</h1>
        <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
          Artigos sobre direitos, contratos e situações jurídicas do dia a dia.
        </p>
        <h2 className="sr-only">Todos os artigos</h2>
        <ArticleList items={articles} />
      </div>
    </section>
  );
}
