"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Brand } from "@/components/Brand";
import { ButtonLink } from "@/components/ButtonLink";
import { createWhatsAppLink, defaultWhatsAppMessage } from "@/lib/whatsapp";

const navItems = [
  ["Bases", "/produtos"],
  ["Solicitação rápida", "/solicitar-planilha"],
  ["Como funciona", "/como-funciona"],
  ["Para quem é", "/para-quem-e"],
];

export function Header() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const whatsappHref = createWhatsAppLink(defaultWhatsAppMessage);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      const firstFocusable = panelRef.current?.querySelector<HTMLElement>("a, button");
      firstFocusable?.focus();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function handlePanelKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }

    if (event.key !== "Tab" || !panelRef.current) return;
    const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>("a, button")).filter(
      (element) => !element.hasAttribute("disabled"),
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <header className="header">
      <div className="container-wide">
        <nav className="nav" aria-label="Principal">
          <Brand />
          <div className="nav-links">
            {navItems.map(([label, href]) => (
              <Link key={href} href={href}>
                {label}
              </Link>
            ))}
          </div>
          <ButtonLink href="/solicitar-planilha?source=header-mobile-amostra" variant="teal">
            Receber amostra
          </ButtonLink>
          <button
            className="mobile-toggle"
            type="button"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>
        <div
          className="mobile-panel"
          data-open={open}
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu mobile"
          onKeyDown={handlePanelKeyDown}
        >
          {navItems.map(([label, href]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
          <ButtonLink href="/solicitar-planilha?source=header-mobile-base" variant="primary">
            Montar minha base
          </ButtonLink>
          <ButtonLink href="/solicitar-planilha?source=header-desktop" variant="teal">
            Receber amostra
          </ButtonLink>
          {whatsappHref ? (
            <a className="button button--secondary" href={whatsappHref} target="_blank" rel="noopener noreferrer">
              WhatsApp direto
            </a>
          ) : null}
        </div>
      </div>
    </header>
  );
}
