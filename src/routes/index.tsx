import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

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
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const page = pageRef.current;
    if (!page || !("IntersectionObserver" in window)) return;

    const targets = Array.from(page.querySelectorAll<HTMLElement>(".section-reveal"));
    const observer = new IntersectionObserver((entries) => {
      for (const { target, isIntersecting } of entries) {
        if (!isIntersecting) continue;

        target.setAttribute("data-reveal", "visible");
        observer.unobserve(target);
      }
    });

    for (const target of targets) {
      if (target.getBoundingClientRect().top >= window.innerHeight) {
        target.setAttribute("data-reveal", "pending");
        observer.observe(target);
      }
    }

    return () => {
      observer.disconnect();
      for (const target of targets) target.removeAttribute("data-reveal");
    };
  }, []);

  return (
    <div ref={pageRef} className="flex flex-col">
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
