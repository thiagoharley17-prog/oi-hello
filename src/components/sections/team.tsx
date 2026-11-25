const team = [
  {
    name: "Dr. Hausner Leandro",
    role: "Advogado",
    portrait: "hausner-leandro-escritorio",
    width: 960,
    height: 640,
    position: "object-[56%_center]",
  },
  {
    name: "Dra. Rebeca Bezerra",
    role: "Advogada",
    portrait: "rebeca-bezerra",
    width: 640,
    height: 640,
    position: "object-[center_42%]",
  },
];

export function Team() {
  return (
    <section id="equipe" className="scroll-mt-24">
      <div className="section-wrap grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <h2 className="section-reveal section-title mt-0 self-start">Nossa equipe</h2>
        <ul className="grid gap-6 sm:grid-cols-2">
          {team.map(({ name, role, portrait, width, height, position }) => (
            <li key={name} className="section-reveal group border-t border-gold pt-5">
              <div className="overflow-hidden">
                <img
                  src={`/images/${portrait}.webp`}
                  alt=""
                  width={width}
                  height={height}
                  loading="lazy"
                  decoding="async"
                  className={`aspect-square w-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.04] ${position}`}
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
