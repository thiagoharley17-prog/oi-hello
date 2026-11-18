const team = [
  { name: "Hausner Leandro", role: "Advogado" },
  { name: "Rebeca Bezerra", role: "Advogada" },
];

export function Team() {
  return (
    <section id="equipe" className="scroll-mt-24">
      <div className="section-wrap grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <h2 className="section-title mt-0">Nossa equipe</h2>
          <p className="mt-4 max-w-sm leading-7 text-muted-foreground">
            Hausner Leandro e Rebeca Bezerra atuam nas áreas cível e empresarial.
          </p>
        </div>
        <ul className="grid gap-6 sm:grid-cols-2">
          {team.map(({ name, role }) => (
            <li key={name} className="border-t border-gold pt-5">
              <h3 className="font-display text-2xl">{name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{role}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
