/**
 * Canonical COA (Certificate of Analysis) map: product handle -> every lab
 * report published for that compound.
 *
 * Source PDFs live in ../pdf (client-supplied). Two independent labs:
 *   - AARL          — certificate numbers #12969-#12991, lot printed as "Batch/Lot #"
 *   - AARLL / Florida Peptides Lab — lot number is the "AARLL-…-P" report id
 *
 * `purity` / `identity` are transcribed from the PDF itself, so the Lab
 * Reports table states what the report actually says (see melanotan-ii).
 *
 * Consumed by scripts/build-catalog.ts (static catalog) and
 * scripts/sync-coas.ts (pushes the same list to WordPress as `coa_reports`).
 */

export interface CoaReport {
  /** Batch / lot number as printed on the report. */
  lot: string;
  /** Filename inside ../pdf. */
  pdf: string;
  /** Measured purity from the report, e.g. "99.24%". */
  purity: string;
  /** Whether the report's identity test conformed. */
  identity: "confirmed" | "unconfirmed";
  /** Optional qualifier shown next to the lot, e.g. the vial size tested. */
  note?: string;
}

export const COA_REPORTS: Record<string, CoaReport[]> = {
  "wolverine-blend-bpc-157-tb-500": [
    { lot: "WO1001", pdf: "12988_AARL_Wolverine.pdf", purity: "99.36%", identity: "confirmed" },
    { lot: "AARLL-2917829-P", pdf: "AARLL-2917829-P - BPC-157 + TB-500 - Purity.pdf", purity: "99.26%", identity: "confirmed" },
    { lot: "ARRLL-7454331", pdf: "ARRLL-7454331 - BPC-157 + TB-500 - Purity.pdf", purity: "99.36%", identity: "confirmed" },
  ],
  "bpc-157": [
    { lot: "110122", pdf: "12974_AARL_BPC-157.pdf", purity: "99.64%", identity: "confirmed" },
    { lot: "AARLL-3548854-P", pdf: "AARLL-3548854-P - BPC-157 - Purity.pdf", purity: "99.24%", identity: "confirmed" },
  ],
  "tb-500": [
    { lot: "4511114", pdf: "12975_AARL_TB-500.pdf", purity: "99.59%", identity: "confirmed" },
  ],
  "ghk-cu": [
    { lot: "WO1001", pdf: "12976_AARL_GHK-Cu.pdf", purity: "99.53%", identity: "confirmed" },
    { lot: "AARLL-6057169-P", pdf: "AARLL-6057169-P - GHK-Cu - Purity.pdf", purity: "99.43%", identity: "confirmed" },
    { lot: "AARLL-7751103-P", pdf: "AARLL-7751103-P - GHK-Cu - Purity.pdf", purity: "99.47%", identity: "confirmed" },
  ],
  "glow-blend": [
    { lot: "174036", pdf: "12991_AARL_GLOW.pdf", purity: "99.63%", identity: "confirmed", note: "50 mg" },
    { lot: "AARLL-9004218-P", pdf: "AARLL-9004218-P - GLOW - Purity.pdf", purity: "99.26%", identity: "confirmed" },
    { lot: "AARLL-9377026-P", pdf: "AARLL-9377026-P - GLOW - Purity.pdf", purity: "99.45%", identity: "confirmed" },
  ],
  "klow-blend": [
    { lot: "AARLL-4436937-P", pdf: "AARLL-4436937-P - KLOW - Purity.pdf", purity: "99.36%", identity: "confirmed" },
  ],
  "cjc-1295-no-dac-plus-ipamorelin": [
    { lot: "AARLL-4328886-P", pdf: "AARLL-4328886-P - Ipamorelin + CJC-1295 - Purity.pdf", purity: "99.31%", identity: "confirmed" },
    { lot: "117812", pdf: "12977_AARL_CJC-1295noDAC.pdf", purity: "99.29%", identity: "confirmed", note: "CJC-1295 no DAC" },
    { lot: "121497", pdf: "12980_AARL_Ipamorelin.pdf", purity: "99.53%", identity: "confirmed", note: "Ipamorelin" },
  ],
  ipamorelin: [
    { lot: "121497", pdf: "12980_AARL_Ipamorelin.pdf", purity: "99.53%", identity: "confirmed" },
  ],
  tesamorelin: [
    { lot: "110148", pdf: "12979_AARL_Tesamorelin.pdf", purity: "99.51%", identity: "confirmed" },
    { lot: "AARLL-7980975-P", pdf: "AARLL-7980975-P - Tesamorelin - Purity.pdf", purity: "99.19%", identity: "confirmed" },
  ],
  sermorelin: [
    { lot: "SM1001", pdf: "12987_AARL_Sermorelin.pdf", purity: "99.48%", identity: "confirmed" },
  ],
  hexarelin: [
    { lot: "AARLL-7132129-P", pdf: "AARLL-7132129-P - Hexarelin - Purity.pdf", purity: "99.19%", identity: "confirmed" },
  ],
  "melanotan-ii": [
    /* Identity test on this lot reads "Not Found / Does not Conform" — surfaced
       as-is rather than as a confirmed identity. */
    { lot: "122215", pdf: "12982_AARL_Melanotan_II.pdf", purity: "99.6%", identity: "unconfirmed" },
  ],
  "pt-141": [
    { lot: "AARLL-6170177-P", pdf: "AARLL-6170177-P - PT-141 - Purity.pdf", purity: "99.35%", identity: "confirmed" },
  ],
  selank: [
    { lot: "AARLL-8583052-P", pdf: "AARLL-8583052-P - Selank - Purity.pdf", purity: "99.45%", identity: "confirmed" },
  ],
  "nad-plus": [
    { lot: "NA1001", pdf: "12981_AARL_NAD+.pdf", purity: "99.59%", identity: "confirmed" },
    { lot: "AARLL-4407912-P", pdf: "AARLL-4407912-P - NAD+ - Purity.pdf", purity: "99.56%", identity: "confirmed" },
  ],
  "mots-c": [
    { lot: "110027", pdf: "12978_AARL_MOTS-c.pdf", purity: "99.68%", identity: "confirmed" },
  ],
  "l-glutathione": [
    { lot: "WO1001", pdf: "12986_AARL_Glutathione.pdf", purity: "99.63%", identity: "confirmed" },
  ],
  /* GLP-3 (R) = Retatrutide */
  "glp-3-r": [
    { lot: "166116", pdf: "12969_AARL_Retatrutide_10mg.pdf", purity: "99.53%", identity: "confirmed", note: "10 mg" },
    { lot: "110147", pdf: "12970_AARL_Retatrutide_20mg.pdf", purity: "99.51%", identity: "confirmed", note: "20 mg" },
    { lot: "110152", pdf: "12971_AARL_Retatrutide_30mg.pdf", purity: "99.42%", identity: "confirmed", note: "30 mg" },
    { lot: "AARLL-9759917-P", pdf: "AARLL-9759917-P - Retatrutide - Purity.pdf", purity: "99.3%", identity: "confirmed" },
    { lot: "AARLL-5564474-P", pdf: "AARLL-5564474-P - Retatrutide - Purity.pdf", purity: "99.32%", identity: "confirmed" },
    { lot: "AARLL-1106202-P", pdf: "AARLL-1106202-P - Retatrutide - Purity.pdf", purity: "99.38%", identity: "confirmed" },
  ],
  /* GLP-1 / GIP (T) = Tirzepatide */
  "glp-1-gip-t": [
    { lot: "166120", pdf: "12972_AARL_Tirzepatide_30mg.pdf", purity: "99.54%", identity: "confirmed", note: "30 mg" },
    { lot: "W01001", pdf: "12973_AARL_Tirzepatide_40mg.pdf", purity: "99.68%", identity: "confirmed", note: "40 mg" },
    { lot: "AARLL-8597576-P", pdf: "AARLL-8597576-P - Tirzepatide - Purity.pdf", purity: "99.4%", identity: "confirmed" },
    { lot: "AARLL-9872072-P", pdf: "AARLL-9872072-P - Tirzepatide - Purity.pdf", purity: "99.15%", identity: "confirmed" },
  ],
};

/** Public URL of a report PDF served from the app's own /public folder. */
export const coaPublicPath = (pdf: string) =>
  `/docs/coa/${encodeURIComponent(pdf)}`;
