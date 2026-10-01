"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import styles from "./preview-gemini.module.css";

type ModalProps = {
  title: string;
  onClose: () => void;
};

export function GeminiModal({ title, onClose }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className={styles.modalBackdrop} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()} ref={modalRef}>
        <div className={styles.modalHeader}>
          <h3 id="modal-title">{title}</h3>
          <button type="button" onClick={onClose} aria-label="Fechar modal" className={styles.modalClose}>
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className={styles.modalBody}>
          <p>
            Esta é uma prévia visual demonstrativa e isolada (Preview V2 Gemini).
          </p>
          <p>
            Nenhuma ação real ou envio de dados é realizado a partir desta demonstração.
          </p>
        </div>
        <div className={styles.modalFooter}>
          <button type="button" className={styles.primaryButton} onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
