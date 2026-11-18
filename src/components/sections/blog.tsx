import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { articles } from "@/data/articles";

const featured = articles.slice(0, 3);

export function ArticleList({ items }: { items: typeof articles }) {
  return (
    <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ title, topic, slug, image, summary }) => (
        <li key={slug} className="flex border border-border bg-background">
          <Link
            to="/blog/$slug"
            params={{ slug }}
            className="group flex w-full flex-col focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            <img src={image} alt="" loading="lazy" className="aspect-[16/9] w-full object-cover" />
            <div className="flex flex-1 flex-col p-5 sm:p-6">
              <p className="section-label text-muted-foreground">{topic}</p>
              <h3 className="mt-2 font-display text-2xl leading-tight group-hover:underline">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{summary}</p>
              <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold">
                Ler artigo <ArrowUpRight size={16} aria-hidden="true" />
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function Blog() {
  return (
    <section id="blog" className="scroll-mt-24 border-t bg-secondary">
      <div className="section-wrap">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="section-title mt-0">Blog</h2>
          <Link to="/blog" className="text-sm font-semibold underline underline-offset-4">
            Ver todos os artigos
          </Link>
        </div>
        <ArticleList items={featured} />
      </div>
    </section>
  );
}
