export function About() {
  return (
    <section id="escritorio" className="scroll-mt-24 border-b bg-background">
      <div className="section-wrap grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div className="section-reveal border-l-2 border-gold pl-5 sm:pl-7">
          <p className="section-label">O escritório</p>
          <h2 className="section-title">HL &amp; Bezerra</h2>
        </div>
        <div className="section-reveal max-w-2xl space-y-4 text-base leading-8 text-muted-foreground">
          <p>
            Prestamos consultoria jurídica e representamos pessoas e empresas em questões que vão de
            contratos e relações de trabalho a demandas familiares e previdenciárias.
          </p>
          <p>
            Na primeira conversa, ouvimos sua situação e indicamos quais documentos podem ajudar a
            avaliar o caso. A partir daí, explicamos as opções e os próximos passos.
          </p>
        </div>
      </div>
    </section>
  );
}
