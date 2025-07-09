import { useQuery } from "@tanstack/react-query"

export interface Product {
  id: string
  code: string
  name: string
}

async function fetchProducts(): Promise<Product[]> {
  const response = await fetch("/api/products")
  if (!response.ok) {
    throw new Error("Failed to fetch products")
  }
  return response.json()
}

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
}