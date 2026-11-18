import { services } from "@/data/site";

export function Services() {
  return (
    <section id="servicos" className="scroll-mt-24 border-y bg-secondary">
      <div className="section-wrap">
        <h2 className="section-title mt-0">Áreas de atuação</h2>
        <ul className="mt-9 grid border-t md:grid-cols-2 md:gap-x-12">
          {services.map(({ title, description }) => (
            <li key={title} className="border-b py-6">
              <h3 className="font-display text-2xl">{title}</h3>
              <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">{description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
