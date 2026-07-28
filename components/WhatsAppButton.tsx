import { MessageCircle } from "lucide-react";
import { createWhatsAppLink, defaultWhatsAppMessage } from "@/lib/whatsapp";

export function WhatsAppButton() {
  const href = createWhatsAppLink(defaultWhatsAppMessage);

  if (!href) return null;

  return (
    <a
      className="whatsapp-floating"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com a ProspectaNicho no WhatsApp"
      title="Falar com a ProspectaNicho no WhatsApp"
      data-tooltip="Falar sobre meu público"
    >
      <MessageCircle aria-hidden="true" size={27} strokeWidth={2.4} />
    </a>
  );
}
