import { createFileRoute } from "@tanstack/react-router";

import { Home } from "@/components/sections/home";
import { Services } from "@/components/sections/services";
import { About } from "@/components/sections/about";
import { Blog } from "@/components/sections/blog";
import { Team } from "@/components/sections/team";
import { Trust } from "@/components/sections/trust";
import { ContactSection } from "@/components/sections/contact";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "HL & Bezerra Advocacia | Escritório de Advocacia" },
      { property: "og:title", content: "HL & Bezerra Advocacia | Escritório de Advocacia" },
    ],
  }),
});

function Index() {
  return (
    <div className="flex flex-col">
      <Home />
      <About />
      <Services />
      <Team />
      <Blog />
      <Trust />
      <ContactSection />
    </div>
  );
}
