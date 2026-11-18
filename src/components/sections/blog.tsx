import { ArrowUpRight } from "lucide-react";
import { siteMeta } from "@/data/site";

const articles = [
  {
    title: "Entendendo os tipos de contratos",
    topic: "Contratos",
    slug: "entendendo-os-tipos-de-contratos-um-guia-pratico",
  },
  {
    title: "Direitos do consumidor: o que você precisa saber",
    topic: "Direito do Consumidor",
    slug: "direitos-do-consumidor-o-que-voce-precisa-saber",
  },
  {
    title: "Como lidar com questões trabalhistas",
    topic: "Direito do Trabalho",
    slug: "como-lidar-com-questoes-trabalhistas-um-guia-abrangente",
  },
];

export function Blog() {
  return (
    <section id="blog" className="scroll-mt-24 border-t bg-secondary">
      <div className="section-wrap">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="section-title mt-0">Blog</h2>
          <a href={siteMeta.blog} className="text-sm font-semibold underline underline-offset-4">
            Ver todos os artigos
          </a>
        </div>
        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {articles.map(({ title, topic, slug }) => (
            <li key={slug} className="border-t pt-5">
              <p className="text-sm text-muted-foreground">{topic}</p>
              <h3 className="mt-2 font-display text-2xl">
                <a
                  href={new URL(`/${slug}/`, siteMeta.blog).href}
                  className="inline-flex items-start gap-3 hover:underline"
                >
                  {title} <ArrowUpRight className="mt-1 size-4 shrink-0" />
                </a>
              </h3>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
