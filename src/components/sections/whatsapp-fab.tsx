import { MessageCircle } from "lucide-react";
import { siteMeta } from "@/data/site";
import { trackFunnelEvent } from "@/lib/telemetry";

export function WhatsAppFab() {
  return (
    <a
      href={siteMeta.whatsapp}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar no WhatsApp"
      onClick={() => trackFunnelEvent("whatsapp_direct_click", "fab")}
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
