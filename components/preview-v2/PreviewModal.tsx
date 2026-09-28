"use client";

import { useEffect, useRef } from "react";
import { CheckCircle2, X } from "lucide-react";
import { motion } from "framer-motion";
import { usePreviewMotion } from "./motion/PreviewMotion";
import styles from "./preview-v2.module.css";

type PreviewModalProps = {
  title: string;
  onClose: () => void;
};

export function PreviewModal({ title, onClose }: PreviewModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const { reducedMotion } = usePreviewMotion();

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !modalRef.current) return;
      const focusable = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'),
      ).filter((element) => !element.hasAttribute("disabled"));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose]);

  return (
    <motion.div
      className={styles.modalBackdrop}
      role="presentation"
      onMouseDown={onClose}
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reducedMotion ? undefined : { opacity: 0 }}
    >
      <motion.div
        ref={modalRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
        initial={reducedMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reducedMotion ? undefined : { opacity: 0, y: 10, scale: 0.985 }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
      >
        <button ref={closeButtonRef} className={styles.modalClose} type="button" onClick={onClose} aria-label="Fechar">
          <X aria-hidden="true" />
        </button>
        <CheckCircle2 className={styles.modalIcon} size={38} aria-hidden="true" />
        <p className={styles.modalEyebrow}>Interação demonstrativa</p>
        <h2 id="preview-modal-title">{title}</h2>
        <p>Esta ação pertence somente à prévia visual. Nenhum dado foi enviado e nenhuma integração foi acionada.</p>
        <button className={styles.primaryButton} type="button" onClick={onClose}>Continuar explorando</button>
      </motion.div>
    </motion.div>
  );
}
