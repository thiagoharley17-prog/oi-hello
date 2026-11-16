import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function Team() {
  const team = [
    {
      name: "Dr. Hausner Leandro",
      role: "Advogado",
      initials: "HL",
    },
    {
      name: "Dra. Rebeca Bezerra",
      role: "Advogada",
      initials: "RB",
    },
  ];

  return (
    <section id="equipe" className="scroll-mt-24 bg-card">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <Badge variant="secondary" className="mb-4">Equipe</Badge>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Advocacia com presença humana
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Cada caso é acompanhado de forma próxima, técnica e responsável, respeitando a realidade
              de cada cliente e a importância de cada decisão.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {team.map((member) => (
              <Card key={member.name} className="rounded-3xl border-border/70 bg-card p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <CardContent className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 rounded-2xl border border-gold/25 bg-secondary">
                    <AvatarFallback className="text-lg font-semibold text-primary">{member.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
