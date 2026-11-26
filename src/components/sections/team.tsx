import { useSiteContent } from "./site-content-context";
export function Team() {
  const { team, teamTitle } = useSiteContent();
  return (
    <section id="equipe" className="scroll-mt-24">
      <div className="section-wrap grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <h2 className="section-reveal section-title mt-0 self-start">{teamTitle}</h2>
        <ul className="grid gap-6 sm:grid-cols-2">
          {team.map(({ name, role, image }, index) => (
            <li key={index} className="section-reveal group border-t border-gold pt-5">
              <div className="overflow-hidden">
                <img
                  src={image}
                  alt=""
                  width={640}
                  height={640}
                  loading="lazy"
                  decoding="async"
                  className={`aspect-square w-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.04] ${image === "/images/hausner-leandro-escritorio.webp" ? "object-[56%_center]" : "object-[center_42%]"}`}
                />
              </div>
              <h3 className="mt-4 font-display text-2xl">{name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{role}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
