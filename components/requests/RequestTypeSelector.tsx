import { DatabaseZap, Gift } from "lucide-react";

export type RequestType = "sample" | "custom";

type Props = { value: RequestType | null; onChange: (value: RequestType) => void };

const choices = [
  { value: "sample" as const, icon: Gift, title: "Amostra grátis", description: "Receba até 10 empresas para conhecer o formato da base.", note: "Sem custo e sem compromisso." },
  { value: "custom" as const, icon: DatabaseZap, title: "Base personalizada", description: "Solicite uma base sob medida para o público que você quer prospectar.", note: "A equipe valida o recorte antes da entrega." },
];

export function RequestTypeSelector({ value, onChange }: Props) {
  return (
    <div className="request-type-grid" role="group" aria-label="Tipo de solicitação">
      {choices.map((choice) => {
        const Icon = choice.icon;
        const selected = value === choice.value;
        return (
          <button className="request-type-card" data-selected={selected} type="button" aria-pressed={selected} onClick={() => onChange(choice.value)} key={choice.value}>
            <span className="request-type-card__icon"><Icon size={24} /></span>
            <strong>{choice.title}</strong>
            <span>{choice.description}</span>
            <small>{choice.note}</small>
          </button>
        );
      })}
    </div>
  );
}
