export const defaultWhatsAppMessage =
  "Olá, conheci a ProspectaNicho e gostaria de entender qual base faz mais sentido para minha operação.";

const defaultWhatsAppNumber = "5535998905896";

export function getWhatsAppNumber() {
  return (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || defaultWhatsAppNumber).replace(/\D/g, "");
}

export function createWhatsAppLink(message = defaultWhatsAppMessage) {
  const number = getWhatsAppNumber();
  const text = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${text}`;
}

export function buildWhatsAppUrl(message: string) {
  return createWhatsAppLink(message);
}
