import { apiRequest, getAuthToken } from "./api-client"

export type UserProfile = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: "admin" | "buyer" | "retail_partner" | string
  status?: "active" | "blocked" | "rejected" | string
}

export type GoalContribution = {
  id: string
  plannedAmount: string
  actualAmount: string
  dueDate: string
  status: "completed" | "upcoming" | "missed"
}

export type Goal = {
  id: string
  timelineMonths: number
  cadence?: "monthly" | "weekly"
  goalAmount: string
  projectedPrice: string
  lockedRetailPrice: string
  contributionSchedule: string
  contributed: string
  consistencyScore: number
  layverScoreBoost?: number
  paymentMode?: "savings_plan" | "pay_in_full"
  status: "active" | "completed" | "unlocked" | "cancelled" | "refunded"
  startDate: string
  targetDate: string
  product: {
    id: string
    name: string
    retailPrice: string
  }
  contributions: GoalContribution[]
}

export type DashboardResponse = {
  stats: {
    activeGoals: number
    completedGoals: number
    unlockRate: number
    reservationCount: number
    consistencyScore: number
    bucketConsistency: number
    layverScore: number
    bucketCount: number
    totalSaved: number
  }
  goals: Goal[]
}

export type ReservationIntent = {
  id: string
  preferredTiming: string
  budgetConfirmation: string
  notes?: string
  status: "new" | "contacted" | "processing" | "fulfilled" | "cancelled"
  adminNotes?: string
  createdAt: string
  goal: Goal
}

export type SavingsBucketType = "industry" | "retailer"
export type SavingsBucketStatus = "active" | "paused"
export type SavingsBucketCadence = "monthly" | "weekly"

export type SavingsBucket = {
  id: string
  type: SavingsBucketType
  name: string
  monthlyContribution: string
  targetAmount: string | null
  savedAmount: string
  status: SavingsBucketStatus
  contributionCount: number
  autoSaveEnabled: boolean
  autoSaveCadence: SavingsBucketCadence
  lastAutoSavedAt: string | null
}

export type RetailerLead = {
  id: string
  user?: { status?: "active" | "blocked" | "rejected" | string } | null
  brandName?: string | null
  sellingRegions?: string | null
  createdAt: string
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

export function updateProfile(payload: { firstName: string; lastName: string }) {
  return apiRequest<{ userInfo: { firstName: string; lastName: string; email: string } }>(
    "/api/users/updateUserProfile",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  )
}

export function changePassword(payload: { oldPassword: string; newPassword: string }) {
  return apiRequest<{ status: boolean }>("/api/users/changeUserPassword", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function getDashboard() {
  return apiRequest<DashboardResponse>("/api/dashboard")
}

export function getGoals() {
  return apiRequest<Goal[]>("/api/goals")
}

export function getGoalById(id: string) {
  return apiRequest<Goal>(`/api/goals/${id}`)
}

export function createContributionCheckoutSession(payload: { goalId: string; amount?: number }) {
  return apiRequest<{ checkoutUrl: string; sessionId: string }>("/api/payment/contribution/checkout", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function confirmContributionCheckoutSession(payload: { sessionId: string }) {
  return apiRequest<{ status: boolean; alreadyRecorded: boolean; goal: Goal }>(
    "/api/payment/contribution/checkout/confirm",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  )
}

export function unlockGoal(goalId: string) {
  return apiRequest<Goal>(`/api/goals/${goalId}/unlock`, {
    method: "POST",
    body: JSON.stringify({}),
  })
}

export function cancelGoal(goalId: string) {
  return apiRequest<{ status: boolean; refundedAmount: number; goal: Goal }>(
    `/api/goals/${goalId}/cancel`,
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  )
}

export function getContributions() {
  return apiRequest<
    Array<{
      id: string
      dueDate: string
      plannedAmount: string
      actualAmount: string
      status: "completed" | "upcoming" | "missed"
      goal: Goal
    }>
  >("/api/goals/contributions/list")
}

export function createReservationIntent(payload: {
  goalId: string
  purchaseInterest: boolean
  preferredTiming: string
  budgetConfirmation: number
  notes?: string
}) {
  return apiRequest("/api/reservations", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function getReservationIntents() {
  return apiRequest<ReservationIntent[]>("/api/reservations")
}

export function getMySavingsBuckets() {
  return apiRequest<SavingsBucket[]>("/api/goals/buckets")
}

export function createSavingsBucket(payload: {
  type: SavingsBucketType
  name: string
  monthlyContribution: number
  targetAmount?: number
  notes?: string
  retailerId?: string
  categoryId?: string
  autoSaveEnabled?: boolean
  autoSaveCadence?: SavingsBucketCadence
}) {
  return apiRequest<SavingsBucket>("/api/goals/buckets", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function updateSavingsBucket(
  id: string,
  payload: {
    status?: SavingsBucketStatus
    autoSaveEnabled?: boolean
    autoSaveCadence?: SavingsBucketCadence
  },
) {
  return apiRequest<SavingsBucket>(`/api/goals/buckets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export function getMySavingsBucketInsights() {
  return apiRequest<{
    industry: { bucketCount: number; monthlyCommitted: number; savedAmount: number }
    retailer: { bucketCount: number; monthlyCommitted: number; savedAmount: number }
  }>("/api/goals/buckets/insights")
}

export function runSavingsBucketAutoSave() {
  return apiRequest<{ processedBuckets: number }>("/api/goals/buckets/auto-save/run", {
    method: "POST",
    body: JSON.stringify({}),
  })
}

export function getSavingsBucketOptions() {
  return apiRequest<{
    industries: Array<{ id: string; name: string }>
    retailers: Array<{ id: string; name: string }>
  }>("/api/goals/buckets/options")
}

export function createBucketCheckoutSession(payload: { bucketId: string; amount?: number }) {
  return apiRequest<{ checkoutUrl: string; sessionId: string }>("/api/payment/bucket/checkout", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function confirmBucketCheckoutSession(payload: { sessionId: string }) {
  return apiRequest<{ status: boolean; alreadyRecorded: boolean; bucket: SavingsBucket }>(
    "/api/payment/bucket/checkout/confirm",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  )
}

export function createAuthenticatedRetailerLead(payload: {
  brandName: string
  contactName: string
  contactPhone?: string
  websiteUrl?: string
  sellingRegions: string
  brandBio?: string
  logoImage?: string
  brandPrimaryColor?: string
  brandSecondaryColor?: string
  contentRightsConfirmed: boolean
  displayPermissionConfirmed: boolean
}) {
  return apiRequest<RetailerLead>("/api/acquisition/retailer-leads/me", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function getMyRetailerLeads() {
  return apiRequest<RetailerLead[]>("/api/acquisition/retailer-leads/me")
}
