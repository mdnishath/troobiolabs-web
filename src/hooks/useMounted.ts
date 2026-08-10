"use client";

import { useEffect, useState } from "react";

/** True after first client render — avoids hydration mismatch for persisted state (cart badge). */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
