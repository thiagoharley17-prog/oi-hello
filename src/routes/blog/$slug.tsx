import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { articles } from "@/data/articles";
import { ArticleComments, commentsQueryOptions } from "@/components/comments/article-comments";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params: { slug }, context }) => {
    const article = articles.find((item) => item.slug === slug);
    if (!article) throw notFound();
    await context.queryClient.ensureQueryData(commentsQueryOptions(slug));
    return article;
  },
  component: ArticlePage,
  head: ({ loaderData: article }) => ({
    meta: article
      ? [
          { title: `${article.title} | HL & Bezerra Advocacia` },
          { name: "description", content: article.summary },
          { property: "og:title", content: article.title },
          { property: "og:description", content: article.summary },
          { property: "og:type", content: "article" },
        ]
      : [{ title: "Artigo não encontrado | HL & Bezerra Advocacia" }],
  }),
});

function ArticlePage() {
  const { slug, title, topic, summary, image, sections, question } = Route.useLoaderData();

  return (
    <article>
      <header className="border-b bg-secondary">
        <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
          >
            <ArrowLeft size={16} aria-hidden="true" /> Voltar para o blog
          </Link>
          <p className="section-label mt-7 text-muted-foreground">{topic}</p>
          <h1 className="section-title">{title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">{summary}</p>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
        <img
          src={image}
          alt=""
          fetchPriority="high"
          className="aspect-[16/8] w-full object-cover"
        />
        <div className="mx-auto mt-9 max-w-2xl space-y-8">
          {sections.map(({ title: sectionTitle, text }) => (
            <section key={sectionTitle}>
              <h2 className="font-display text-2xl sm:text-3xl">{sectionTitle}</h2>
              <p className="mt-3 text-base leading-8 text-muted-foreground">{text}</p>
            </section>
          ))}
          <ArticleComments slug={slug} question={question} />
          <div className="border-t pt-6">
            <Link to="/diagnostico" className="action-link bg-primary text-primary-foreground">
              Fale com o escritório <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
