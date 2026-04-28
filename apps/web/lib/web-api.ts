import { apiRequest } from "@/lib/api-client"

export type Product = {
  id: string
  name: string
  description: string
  imageUrl: string
  retailPrice: string
  goalAmount: string
  projectedPrice: string
  category: { id: string; name: string } | null
  visibility: "published" | "draft"
}

export type ProductCategoryItem = {
  id: string
  name: string
  parentId: string | null
  depth: number
  childCount: number
}

export type ProductListResponse = {
  items: Product[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  coverImageUrl: string | null
  categories: string[]
  featured: boolean
  published: boolean
  publishedAt: string | null
  createdAt: string
}

export type BlogPostListItem = Omit<BlogPost, "content">

export type BlogPublicListResponse = {
  items: BlogPostListItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export function getPublicProducts(params?: {
  page?: number
  pageSize?: number
  search?: string
  categoryId?: string
}) {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize))
  if (params?.search?.trim()) searchParams.set("search", params.search.trim())
  if (params?.categoryId?.trim()) searchParams.set("categoryId", params.categoryId.trim())
  const suffix = searchParams.toString()
  return apiRequest<ProductListResponse>(`/api/products${suffix ? `?${suffix}` : ""}`, {}, false)
}

export function getProductCategories() {
  return apiRequest<ProductCategoryItem[]>("/api/products/categories", {}, false)
}

export function getPublicProductById(id: string) {
  return apiRequest<Product | null>(`/api/products/item/${id}`, {}, false)
}

export function getPublicBlogPosts(params?: { page?: number; pageSize?: number }) {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize))
  const suffix = searchParams.toString()
  return apiRequest<BlogPublicListResponse>(`/api/blog${suffix ? `?${suffix}` : ""}`, {}, false)
}

export function getPublicBlogPostBySlug(slug: string) {
  return apiRequest<BlogPost>(`/api/blog/${slug}`, {}, false)
}
