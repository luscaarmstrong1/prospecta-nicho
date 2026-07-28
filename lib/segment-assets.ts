export type SegmentAsset = {
  label: string;
  image: string;
  mobileImage: string;
  alt: string;
};

export const segmentAssets = {
  agencias: {
    label: "Agências",
    image: "/assets/images/segments/agencias.webp",
    mobileImage: "/assets/images/segments/agencias-mobile.webp",
    alt: "Imagem ilustrativa para base de prospecção para agências de marketing",
  },
  contabilidades: {
    label: "Contabilidades",
    image: "/assets/images/segments/contabilidades.webp",
    mobileImage: "/assets/images/segments/contabilidades-mobile.webp",
    alt: "Imagem ilustrativa para base de prospecção para contabilidades",
  },
  "energia-solar": {
    label: "Energia solar",
    image: "/assets/images/segments/energia-solar.webp",
    mobileImage: "/assets/images/segments/energia-solar-mobile.webp",
    alt: "Imagem ilustrativa para base de prospecção para empresas de energia solar",
  },
  "erp-e-sistemas": {
    label: "ERP e sistemas",
    image: "/assets/images/segments/erp-e-sistemas.webp",
    mobileImage: "/assets/images/segments/erp-e-sistemas-mobile.webp",
    alt: "Imagem ilustrativa para base de prospecção para ERP e sistemas",
  },
  maquininhas: {
    label: "Maquininhas",
    image: "/assets/images/segments/maquininhas.webp",
    mobileImage: "/assets/images/segments/maquininhas-mobile.webp",
    alt: "Imagem ilustrativa para base de prospecção para maquininhas e meios de pagamento",
  },
  "comunicacao-visual": {
    label: "Comunicação visual",
    image: "/assets/images/segments/comunicacao-visual.webp",
    mobileImage: "/assets/images/segments/comunicacao-visual-mobile.webp",
    alt: "Imagem ilustrativa para base de prospecção para comunicação visual",
  },
  consultorias: {
    label: "Consultorias",
    image: "/assets/images/segments/consultorias.webp",
    mobileImage: "/assets/images/segments/consultorias-mobile.webp",
    alt: "Imagem ilustrativa para base de prospecção para consultorias B2B",
  },
  "certificado-digital": {
    label: "Certificado digital",
    image: "/assets/images/segments/certificado-digital.webp",
    mobileImage: "/assets/images/segments/certificado-digital-mobile.webp",
    alt: "Imagem ilustrativa para base de prospecção para certificado digital",
  },
} satisfies Record<string, SegmentAsset>;

export type SegmentAssetId = keyof typeof segmentAssets;

export function getSegmentAsset(segmentId: string): SegmentAsset | undefined {
  return segmentAssets[segmentId as SegmentAssetId];
}
