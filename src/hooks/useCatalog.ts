"use client";

import { useQuery } from "@tanstack/react-query";
import type { Category, Product } from "@/lib/types";

export interface CatalogResponse {
  products: Product[];
  categories: Category[];
}

export function useCatalog(initialData?: CatalogResponse) {
  return useQuery<CatalogResponse>({
    queryKey: ["catalog"],
    queryFn: async () => {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to load catalog");
      return res.json();
    },
    initialData,
  });
}

export function useProduct(id: string) {
  return useQuery<Product>({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) throw new Error("Failed to load product");
      return res.json();
    },
  });
}
