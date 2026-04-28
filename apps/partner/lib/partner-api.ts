import { apiRequest, getAuthToken } from "./api-client"

export type UserProfile = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: "admin" | "buyer" | "retail_partner" | string
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
  createdAt: string
}

export type Product = {
  id: string
  name: string
  categoryId?: string | null
  category: { id: string; name: string } | null
  description: string
  imageUrl: string
  imageGallery?: string[] | null
  retailPrice: string
  goalAmount: string
  projectedPrice: string
  fulfillmentType?: string | null
  orderFulfillmentContactEmail?: string | null
  supportContactEmail?: string | null
  shippingRegions?: string | null
  shippingPolicyUrl?: string | null
  returnsPolicyUrl?: string | null
  warrantySummary?: string | null
  refundResponsibility?: string | null
  partnerPayout?: string | null
  fullPayEnabled?: boolean
  fullPayDiscountPercent?: string
  timelineMonthlyOptions?: string[] | null
  timelineWeeklyOptions?: string[] | null
  visibility: "published" | "draft"
}

export type ProductCategoryItem = {
  id: string
  name: string
  parentId: string | null
  depth: number
  childCount: number
}

export type TimelineOption = {
  id: string
  cadence: "monthly" | "weekly"
  months: number
  enabled: boolean
  isDefault: boolean
}

const PROFILE_CACHE_TTL_MS = 30_000
let profileCache: UserProfile | null = null
let profileCacheToken = ""
let profileCacheAt = 0
let profileRequestInFlight: Promise<UserProfile> | null = null

function invalidateProfileCache() {
  profileCache = null
  profileCacheToken = ""
  profileCacheAt = 0
  profileRequestInFlight = null
}

export function getProfile(options?: { forceRefresh?: boolean }) {
  const token = getAuthToken()
  const now = Date.now()
  if (token !== profileCacheToken) {
    invalidateProfileCache()
    profileCacheToken = token
  }
  if (!options?.forceRefresh && profileCache && now - profileCacheAt < PROFILE_CACHE_TTL_MS) {
    return Promise.resolve(profileCache)
  }
  if (profileRequestInFlight) return profileRequestInFlight

  profileRequestInFlight = apiRequest<UserProfile>("/api/auth/profile")
    .then((profile) => {
      profileCache = profile
      profileCacheToken = token
      profileCacheAt = Date.now()
      return profile
    })
    .catch((error) => {
      invalidateProfileCache()
      throw error
    })
    .finally(() => {
      profileRequestInFlight = null
    })

  return profileRequestInFlight
}

export function getMyRetailerLeads() {
  return apiRequest<RetailerLead[]>("/api/acquisition/retailer-leads/me")
}

export function updateMyRetailerLead(
  id: string,
  payload: {
    brandName?: string
    contactName?: string
    contactRole?: string
    contactPhone?: string
    websiteUrl?: string
    sellingRegions?: string
    brandBio?: string
    logoImage?: string
    brandPrimaryColor?: string
    brandSecondaryColor?: string
    stripeConnectedAccountId?: string
  },
) {
  return apiRequest<RetailerLead>(`/api/acquisition/retailer-leads/me/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export function validateMyRetailerStripeReadiness(id: string) {
  return apiRequest<StripeAccountReadiness>(`/api/acquisition/retailer-leads/me/${id}/stripe-readiness`)
}

export function uploadRetailerLogoImage(file: File) {
  const formData = new FormData()
  formData.append("file", file)
  return apiRequest<{ url: string; path: string }>("/api/acquisition/retailer-leads/upload-logo", {
    method: "POST",
    body: formData,
  })
}

export function getProductCategories() {
  return apiRequest<ProductCategoryItem[]>("/api/products/categories")
}

export function getPublicTimelineOptions() {
  return apiRequest<TimelineOption[]>("/api/products/timeline-options")
}

export function getPartnerProducts() {
  return apiRequest<Product[]>("/api/products/mine")
}

export function getPartnerProductById(id: string) {
  return apiRequest<Product | null>(`/api/products/mine/${id}`)
}

export function uploadProductImage(file: File) {
  const formData = new FormData()
  formData.append("file", file)
  return apiRequest<{ url: string; path: string }>("/api/products/upload-image", {
    method: "POST",
    body: formData,
  })
}

export function createPartnerProduct(payload: {
  name: string
  categoryId: string
  description: string
  imageUrl?: string
  imageGallery?: string[]
  retailPrice: number
  goalAmount: number
  projectedPrice: number
  fulfillmentType?: string
  orderFulfillmentContactEmail?: string
  supportContactEmail?: string
  shippingRegions?: string
  shippingPolicyUrl?: string
  returnsPolicyUrl?: string
  warrantySummary?: string
  refundResponsibility?: string
  partnerPayout: number
  fullPayEnabled: boolean
  fullPayDiscountPercent: number
  timelineMonthlyOptions?: number[]
  timelineWeeklyOptions?: number[]
  visibility: "published" | "draft"
}) {
  return apiRequest<Product>("/api/products/mine", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function updatePartnerProduct(
  id: string,
  payload: {
    name: string
    categoryId: string
    description: string
    imageUrl?: string
    imageGallery?: string[]
    retailPrice: number
    goalAmount: number
    projectedPrice: number
    fulfillmentType?: string
    orderFulfillmentContactEmail?: string
    supportContactEmail?: string
    shippingRegions?: string
    shippingPolicyUrl?: string
    returnsPolicyUrl?: string
    warrantySummary?: string
    refundResponsibility?: string
    partnerPayout: number
    fullPayEnabled: boolean
    fullPayDiscountPercent: number
    timelineMonthlyOptions?: number[]
    timelineWeeklyOptions?: number[]
    visibility: "published" | "draft"
  },
) {
  return apiRequest<Product>(`/api/products/mine/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}
