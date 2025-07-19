import { useQuery } from "@tanstack/react-query"

export interface Product {
  id: string
  code: string
  name: string
  categories?: Array<{
    category: {
      id: string
      name: string
    }
  }>
}

async function fetchProducts(categoryId?: string): Promise<Product[]> {
  const params = new URLSearchParams()
  if (categoryId && categoryId !== "all") {
    params.append("categoryId", categoryId)
  }
  
  const url = `/api/products${params.toString() ? `?${params.toString()}` : ""}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error("Failed to fetch products")
  }
  return response.json()
}

export function useProducts(categoryId?: string) {
  return useQuery({
    queryKey: ["products", categoryId],
    queryFn: () => fetchProducts(categoryId),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
}