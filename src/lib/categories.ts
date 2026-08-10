export interface Category {
  id: string;
  name: string;
  color: string;
  blurb: string;
}

/** The 5 core product categories (matching the product image library). */
export const CATEGORIES: Category[] = [
  {
    id: "tissue",
    name: "Tissue Repair & Recovery",
    color: "#D9368A",
    blurb:
      "Compounds studied in wound-healing, angiogenesis and recovery models.",
  },
  {
    id: "metabolic",
    name: "Metabolic & GLP-1",
    color: "#1486C9",
    blurb:
      "Incretin analogs studied in metabolic, glycemic and appetite research.",
  },
  {
    id: "endocrine",
    name: "Endocrine & GH",
    color: "#F47B2A",
    blurb: "GHRH analogs and secretagogues for endocrine-axis research.",
  },
  {
    id: "cellular",
    name: "Cellular & Longevity",
    color: "#73B84A",
    blurb: "Compounds studied in cellular aging and mitochondrial models.",
  },
  {
    id: "neural",
    name: "Neural & Cognitive",
    color: "#8D43B8",
    blurb: "Neuropeptides studied in cognition and stress-response models.",
  },
];

export const catById = (id: string) => CATEGORIES.find((c) => c.id === id);
