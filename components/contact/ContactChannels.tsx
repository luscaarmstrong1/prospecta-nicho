"use client";

import { ChevronRight, Mail, MessageCircle, Phone } from "lucide-react";
import { createWhatsAppLink, getWhatsAppNumber } from "@/lib/whatsapp";
import styles from "./contact.module.css";

interface ContactChannelsProps {
  email?: string;
}

export function ContactChannels({ email = "contato@prospectanicho.com.br" }: ContactChannelsProps) {
  const rawNumber = getWhatsAppNumber();
  const whatsappUrl = createWhatsAppLink("Olá! Gostaria de falar com o time da ProspectaNicho.");

  // Format phone display if available: e.g. (35) 99890-5896
  const formattedPhone = rawNumber.length >= 12
    ? `(${rawNumber.slice(2, 4)}) ${rawNumber.slice(4, 9)}-${rawNumber.slice(9)}`
    : rawNumber.length === 11
    ? `(${rawNumber.slice(0, 2)}) ${rawNumber.slice(2, 7)}-${rawNumber.slice(7)}`
    : rawNumber || "(35) 99890-5896";

  return (
    <div className={styles.channelsCol}>
      <span className={styles.eyebrowTag}>FALE CONOSCO</span>
      <h2 className={styles.sectionHeadingH2}>
        Suporte, parcerias e{" "}
        <span className={styles.cyanHighlight}>novas oportunidades.</span>
      </h2>
      <p className={styles.sectionDesc}>
        Use o formulário ao lado para entrar em contato com a nossa equipe. Se preferir, fale diretamente pelos nossos canais oficiais.
      </p>

      <div className={styles.channelsList}>
        {/* WhatsApp Real Channel */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.channelCard}
          aria-label="Falar no WhatsApp"
        >
          <div className={styles.channelIconWrap}>
            <MessageCircle size={22} />
          </div>
          <div className={styles.channelInfo}>
            <div className={styles.channelTitle}>WhatsApp</div>
            <div className={styles.channelDetail}>Atendimento rápido e direto</div>
          </div>
          <ChevronRight className={styles.channelChevron} size={18} />
        </a>

        {/* E-mail Real Channel */}
        <a
          href={`mailto:${email}`}
          className={styles.channelCard}
          aria-label={`Enviar e-mail para ${email}`}
        >
          <div className={styles.channelIconWrap}>
            <Mail size={22} />
          </div>
          <div className={styles.channelInfo}>
            <div className={styles.channelTitle}>E-mail</div>
            <div className={styles.channelDetail}>{email}</div>
          </div>
          <ChevronRight className={styles.channelChevron} size={18} />
        </a>

        {/* Telefone Real Channel */}
        {rawNumber ? (
          <a
            href={`tel:+${rawNumber}`}
            className={styles.channelCard}
            aria-label={`Ligar para ${formattedPhone}`}
          >
            <div className={styles.channelIconWrap}>
              <Phone size={22} />
            </div>
            <div className={styles.channelInfo}>
              <div className={styles.channelTitle}>Telefone</div>
              <div className={styles.channelDetail}>{formattedPhone}</div>
            </div>
            <ChevronRight className={styles.channelChevron} size={18} />
          </a>
        ) : null}
      </div>
    </div>
  );
}
