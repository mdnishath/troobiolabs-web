/** Shared Zelle helpers (safe for client and server). */

/** Customer-facing Zelle transfer details, read from the gateway's own settings. */
export interface ZelleDetails {
  name: string;
  email: string;
  phone: string;
  qrUrl: string | null;
}

/** Proof of payment collected on the storefront before the order is created. */
export interface ZelleProof {
  senderName: string;
  reference: string;
  /** data: URL of the payment screenshot (JPEG/PNG/WebP) */
  screenshot: string;
}

export const isZelleGateway = (g: { id: string; title: string }) =>
  /zelle/i.test(g.id) || /zelle/i.test(g.title);

/** Largest screenshot payload we accept (after client-side downscaling). */
export const MAX_PROOF_BYTES = 4 * 1024 * 1024;
