import { apiRequest } from "./api-client"

type PaginatedResponse<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type AdminSummary = {
  totalUsers: number
  activeGoals: number
  completionRate: number
  unlockRate: number
  reservationRate: number
  retailerInterest: number
  retailerInterestRate: number
}

export type AdminFunnel = {
  goalCreationRate: number
  goalCompletionRate: number
  avgTimeline: number
  dropOffRate: number
  unlockRate: number
  reservationRate: number
  funnel: Array<{ label: string; value: number; pct: number }>
}

export type AdminGoal = {
  id: string
  status: string
  goalAmount: string
  contributed: string
  reservationCount: number
  createdAt: string
  user: { firstName: string; lastName: string; email: string }
  product: { name: string }
}

export type AdminUser = {
  id: string
  name: string
  email: string
  status: "active" | "inactive" | "suspended" | "blocked" | "rejected"
  activeGoals: number
  completionScore: number
  createdAt: string
  role: string
}

export type AdminReservation = {
  id: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
  }
  goal: {
    id: string
    status: "active" | "completed" | "unlocked" | "cancelled" | "refunded"
    goalAmount: string
    projectedPrice: string
    refundedAmount: string
    retailerPaymentStatus: "none" | "paid" | "refunded"
    productName: string
    hasPaymentReference: boolean
  }
  purchaseInterest: boolean
  preferredTiming: string
  budgetConfirmation: string
  notes: string
  status: "new" | "contacted" | "processing" | "fulfilled" | "cancelled"
  adminNotes: string
  createdAt: string
  updatedAt: string
}

export type StripeAccountReadiness = {
  leadId: string
  stripeConnectedAccountId: string | null
  chargesEnabled: boolean
  payoutsEnabled: boolean
  detailsSubmitted: boolean
  ready: boolean
  disabledReason?: string | null
}

export type RetailerLead = {
  id: string
  user?: {
    id: string
    email: string
    status?: "active" | "blocked" | "rejected" | string
  } | null
  brandName?: string | null
  contactName?: string | null
  contactRole?: string | null
  contactPhone?: string | null
  websiteUrl?: string | null
  sellingRegions?: string | null
  brandBio?: string | null
  logoImage?: string | null
  logoUrl?: string | null
  brandPrimaryColor?: string | null
  brandSecondaryColor?: string | null
  stripeConnectedAccountId?: string | null
  contentRightsConfirmed?: boolean
  displayPermissionConfirmed?: boolean
  createdAt: string
}

export type SavingsDemandItem = {
  type: "industry" | "retailer"
  name: string
  bucketCount: number
  userCount: number
  monthlyCommitted: number
  savedAmount: number
  avgContribution: number
  intentVolume: number
  conversionRate: number
}

export type SavingsDemandSummary = {
  byIndustry: SavingsDemandItem[]
  byRetailer: SavingsDemandItem[]
}

export type Product = {
  id: string
  userId?: string | null
  retailerName?: string | null
  name: string
  categoryId?: string | null
  category: { id: string; name: string } | null
  description: string
  imageUrl: string
  retailPrice: string
  goalAmount: string
  projectedPrice: string
  partnerPayout?: string | null
  visibility: "published" | "draft"
  createdAt?: string
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
  categoryIds?: string[]
  featured: boolean
  published: boolean
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export type BlogCategoryItem = {
  id: string
  name: string
}

export type BlogAdminTableRow = {
  id: string
  title: string
  slug: string
  category: string
  publishedDate: string | null
  status: "published" | "draft"
}

export type BlogAdminTableResponse = {
  items: BlogAdminTableRow[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  categories: BlogCategoryItem[]
}

export type BlogCategoryTableResponse = {
  items: BlogCategoryItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type AdminFeatureToggle = {
  id: string
  key: string
  name: string
  description: string
  category: "pricing" | "acquisition" | "content" | "integrations" | string
  enabled: boolean
  locked: boolean
}

export type PricingModel = {
  id: string
  incentivePercent: string
  projectedDiscountMin: string
  projectedDiscountMax: string
  verifiedModeEnabled: boolean
}

export type TimelineOption = {
  id: string
  cadence: "monthly" | "weekly"
  months: number
  enabled: boolean
  isDefault: boolean
}

export type UserProfile = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
}

async function fetchAllPages<T>(path: string, pageSize = 100) {
  const items: T[] = []
  let page = 1
  let totalPages = 1
  do {
    const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
    const response = await apiRequest<PaginatedResponse<T>>(`${path}?${query.toString()}`)
    items.push(...response.items)
    totalPages = response.totalPages
    page += 1
  } while (page <= totalPages)
  return items
}

export function getProfile() {
  return apiRequest<UserProfile>("/api/auth/profile")
}

export function getAdminSummary() {
  return apiRequest<AdminSummary>("/api/admin/summary")
}

export function getAdminFunnel() {
  return apiRequest<AdminFunnel>("/api/admin/funnel")
}

export function getAdminGoals() {
  return fetchAllPages<AdminGoal>("/api/admin/goals")
}

export function getAdminSavingsDemand() {
  return apiRequest<SavingsDemandSummary>("/api/admin/savings-demand")
}

export function getAdminUsers() {
  return fetchAllPages<AdminUser>("/api/admin/users")
}

export function getAdminReservations() {
  return fetchAllPages<AdminReservation>("/api/admin/reservations")
}

export function updateAdminReservation(
  id: string,
  payload: {
    status?: "new" | "contacted" | "processing" | "fulfilled" | "cancelled"
    adminNotes?: string
  },
) {
  return apiRequest<{
    id: string
    status: "new" | "contacted" | "processing" | "fulfilled" | "cancelled"
    adminNotes: string
    updatedAt: string
  }>(`/api/admin/reservations/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export function markGoalFulfillmentFailed(goalId: string) {
  return apiRequest<{
    status: boolean
    refundedAmount: number
    goal: {
      status: "active" | "completed" | "unlocked" | "cancelled" | "refunded"
      refundedAmount: string
      retailerPaymentStatus: "none" | "paid" | "refunded"
    }
  }>(`/api/goals/${goalId}/fulfillment-failed`, {
    method: "POST",
    body: JSON.stringify({}),
  })
}

export function getAdminRetailers() {
  return fetchAllPages<RetailerLead>("/api/admin/retailers")
}

export function updateAdminRetailerLeadStatus(
  id: string,
  payload: { status: "active" | "blocked" | "rejected" },
) {
  return apiRequest<RetailerLead>(`/api/acquisition/retailer-leads/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export function validateAdminRetailerStripeReadiness(id: string) {
  return apiRequest<StripeAccountReadiness>(`/api/acquisition/retailer-leads/${id}/stripe-readiness`)
}

export function getAdminProducts(params?: {
  page?: number
  pageSize?: number
  search?: string
  categoryId?: string
  status?: "published" | "draft" | "all"
}) {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize))
  if (params?.search?.trim()) searchParams.set("search", params.search.trim())
  if (params?.categoryId?.trim() && params.categoryId !== "all") {
    searchParams.set("categoryId", params.categoryId.trim())
  }
  if (params?.status && params.status !== "all") {
    searchParams.set("status", params.status)
  }
  const suffix = searchParams.toString()
  return apiRequest<ProductListResponse>(`/api/products/all${suffix ? `?${suffix}` : ""}`)
}

export function getAdminProductById(id: string) {
  return apiRequest<Product | null>(`/api/products/item/${id}`)
}

export function createAdminProduct(payload: {
  name: string
  categoryId: string
  userId?: string | null
  description: string
  imageUrl?: string
  retailPrice: number
  goalAmount: number
  projectedPrice: number
  partnerPayout: number
  visibility: "published" | "draft"
}) {
  return apiRequest<Product>("/api/products", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function updateAdminProduct(
  id: string,
  payload: {
    name: string
    categoryId: string
    userId?: string | null
    description: string
    imageUrl?: string
    retailPrice: number
    goalAmount: number
    projectedPrice: number
    partnerPayout: number
    visibility: "published" | "draft"
  },
) {
  return apiRequest<Product>(`/api/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export function deleteAdminProduct(id: string) {
  return apiRequest<{ success: boolean }>(`/api/products/${id}`, {
    method: "DELETE",
  })
}

export function getAdminCategoryItems() {
  return apiRequest<ProductCategoryItem[]>("/api/products/categories/manage")
}

export function createProductCategory(payload: { name: string; parentId?: string }) {
  return apiRequest<ProductCategoryItem[]>("/api/products/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function updateProductCategory(id: string, payload: { name: string; parentId?: string }) {
  return apiRequest<ProductCategoryItem[]>(`/api/products/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export function deleteProductCategory(id: string) {
  return apiRequest<ProductCategoryItem[]>(`/api/products/categories/${id}`, {
    method: "DELETE",
  })
}

export function getAdminBlogTableRows(params?: {
  page?: number
  pageSize?: number
  search?: string
  categoryId?: string
  status?: "all" | "published" | "draft"
}) {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize))
  if (params?.search?.trim()) searchParams.set("search", params.search.trim())
  if (params?.categoryId && params.categoryId !== "all") {
    searchParams.set("categoryId", params.categoryId)
  }
  if (params?.status && params.status !== "all") {
    searchParams.set("status", params.status)
  }
  const suffix = searchParams.toString()
  return apiRequest<BlogAdminTableResponse>(`/api/blog/admin/table${suffix ? `?${suffix}` : ""}`)
}

export function getAdminBlogPostById(id: string) {
  return apiRequest<BlogPost>(`/api/blog/admin/item/${id}`)
}

export function deleteAdminBlogPost(id: string) {
  return apiRequest<{ success: boolean }>(`/api/blog/admin/${id}`, {
    method: "DELETE",
  })
}

export function getAdminBlogCategoryItems() {
  return apiRequest<BlogCategoryItem[]>("/api/blog/categories/manage")
}

export function getAdminBlogCategoryTable(params?: {
  page?: number
  pageSize?: number
  search?: string
}) {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize))
  if (params?.search?.trim()) searchParams.set("search", params.search.trim())
  const suffix = searchParams.toString()
  return apiRequest<BlogCategoryTableResponse>(`/api/blog/categories/manage/table${suffix ? `?${suffix}` : ""}`)
}

export function createAdminBlogCategory(payload: { name: string }) {
  return apiRequest<BlogCategoryItem[]>("/api/blog/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function updateAdminBlogCategory(id: string, payload: { name: string }) {
  return apiRequest<BlogCategoryItem[]>(`/api/blog/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export function deleteAdminBlogCategory(id: string) {
  return apiRequest<BlogCategoryItem[]>(`/api/blog/categories/${id}`, {
    method: "DELETE",
  })
}

export function createAdminBlogPost(payload: {
  title: string
  excerpt?: string
  content: string
  coverImageUrl?: string
  categories?: string[]
  featured?: boolean
  published?: boolean
}) {
  return apiRequest<{ id: string; slug: string; status: "published" | "draft" }>(
    "/api/blog/admin",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  )
}

export function updateAdminBlogPost(
  id: string,
  payload: {
    title?: string
    slug?: string
    excerpt?: string
    content?: string
    coverImageUrl?: string
    categories?: string[]
    featured?: boolean
    published?: boolean
  },
) {
  return apiRequest<{ id: string; slug: string; status: "published" | "draft" }>(
    `/api/blog/admin/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  )
}

export function getAdminFeatureToggles() {
  return apiRequest<AdminFeatureToggle[]>("/api/admin/settings/features")
}

export function updateAdminFeatureToggles(payload: {
  items: Array<{ key: string; enabled: boolean }>
}) {
  return apiRequest<AdminFeatureToggle[]>("/api/admin/settings/features", {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export function getPricingModel() {
  return apiRequest<PricingModel>("/api/pricing-model")
}

export function updatePricingModel(payload: {
  incentivePercent: number
  projectedDiscountMin: number
  projectedDiscountMax: number
  verifiedModeEnabled: boolean
}) {
  return apiRequest<PricingModel>("/api/pricing-model", {
    method: "PUT",
    body: JSON.stringify(payload),
  })
}

export function getAdminTimelineOptions() {
  return apiRequest<TimelineOption[]>("/api/products/timeline-options/manage")
}

export function createAdminTimelineOption(payload: { months: number; cadence?: "monthly" | "weekly" }) {
  return apiRequest<TimelineOption[]>("/api/products/timeline-options", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function updateAdminTimelineOptions(payload: {
  items: Array<{ id: string; enabled: boolean; isDefault: boolean }>
}) {
  return apiRequest<TimelineOption[]>("/api/products/timeline-options/manage", {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export function deleteAdminTimelineOption(id: string) {
  return apiRequest<TimelineOption[]>(`/api/products/timeline-options/${id}`, {
    method: "DELETE",
  })
}

export function changePassword(payload: { oldPassword: string; newPassword: string }) {
  return apiRequest<{ status: boolean }>("/api/users/changeUserPassword", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}
