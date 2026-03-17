export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const requestCache = new Map<string, CacheEntry<unknown>>();
const inflightRequests = new Map<string, Promise<unknown>>();

const DEFAULT_CACHE_TTL_MS = 60_000;
const STALE_WHILE_REVALIDATE_MS = 120_000;

function getCacheKey(endpoint: string, options: RequestInit): string {
  const method = options.method || "GET";
  const body = options.body ? String(options.body) : "";
  return `${method}:${endpoint}:${body}`;
}

function cleanExpiredCache(): void {
  const now = Date.now();
  for (const [key, entry] of requestCache.entries()) {
    if (now - entry.timestamp > DEFAULT_CACHE_TTL_MS * 2) {
      requestCache.delete(key);
    }
  }
}

setInterval(cleanExpiredCache, 60_000);

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {},
  cacheTtlMs: number = DEFAULT_CACHE_TTL_MS
): Promise<T> {
  const cacheKey = getCacheKey(endpoint, options);
  const method = options.method || "GET";
  const isCacheable = method === "GET" && cacheTtlMs > 0;

  if (isCacheable) {
    const cached = requestCache.get(cacheKey) as CacheEntry<T> | undefined;
    const now = Date.now();
    
    if (cached) {
      const age = now - cached.timestamp;
      
      if (age < cacheTtlMs) {
        return cached.data;
      }
      
      if (age < STALE_WHILE_REVALIDATE_MS) {
        revalidateInBackground(endpoint, options, cacheKey);
        return cached.data;
      }
    }

    const inflight = inflightRequests.get(cacheKey) as Promise<T> | undefined;
    if (inflight) {
      return inflight;
    }
  }

  const request = (async () => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: "API Error" }));
      throw new Error(error.message || "API Error");
    }

    const data = await res.json() as T;

    if (isCacheable) {
      requestCache.set(cacheKey, { data, timestamp: Date.now() });
    }

    return data;
  })();

  if (isCacheable) {
    inflightRequests.set(cacheKey, request);
    request.finally(() => inflightRequests.delete(cacheKey));
  }

  return request;
}

function revalidateInBackground(endpoint: string, options: RequestInit, cacheKey: string): void {
  if (inflightRequests.has(cacheKey)) return;
  
  const revalidate = fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  })
    .then(res => res.ok ? res.json() : null)
    .then(data => {
      if (data) {
        requestCache.set(cacheKey, { data, timestamp: Date.now() });
      }
    })
    .catch(() => {});
  
  inflightRequests.set(cacheKey, revalidate);
  revalidate.finally(() => inflightRequests.delete(cacheKey));
}

export function invalidateDashboardCache(): void {
  for (const key of requestCache.keys()) {
    if (key.includes("/api/dashboard")) {
      requestCache.delete(key);
    }
  }
}

export const api = {
  // Dashboard
  getDashboardStats: (params: {
    startDate?: string;
    endDate?: string;
    accountId?: string;
    objective?: string;
  }) => {
    const searchParams = new URLSearchParams({
      ...(params.startDate && { startDate: params.startDate }),
      ...(params.endDate && { endDate: params.endDate }),
      ...(params.accountId && { accountId: params.accountId }),
      ...(params.objective && { objective: params.objective }),
    });
    return fetchAPI<DashboardStats>(`/api/dashboard?${searchParams}`);
  },

  getDashboardStatsV2: (params: DashboardV2Params) => {
    const searchParams = new URLSearchParams({
      ...(params.startDate && { startDate: params.startDate }),
      ...(params.endDate && { endDate: params.endDate }),
      ...(params.accountId && { accountId: params.accountId }),
      ...(params.objective && { objective: params.objective }),
      ...(params.country && { country: params.country }),
      ...(params.service && { service: params.service }),
      ...(params.campaign && { campaign: params.campaign }),
      ...(params.language && { language: params.language }),
    });
    return fetchAPI<DashboardStatsV2>(`/api/dashboard/v2?${searchParams}`);
  },

  getCohortRevenue: (params?: { 
    startDate?: string; 
    endDate?: string; 
    accountId?: string;
    cohortStartDate?: string;
    cohortEndDate?: string;
    maxMonths?: number;
  }) => {
    const searchParams = new URLSearchParams({
      ...(params?.startDate && { startDate: params.startDate }),
      ...(params?.endDate && { endDate: params.endDate }),
      ...(params?.accountId && { accountId: params.accountId }),
      ...(params?.cohortStartDate && { cohortStartDate: params.cohortStartDate }),
      ...(params?.cohortEndDate && { cohortEndDate: params.cohortEndDate }),
      ...(params?.maxMonths && { maxMonths: String(params.maxMonths) }),
    });
    return fetchAPI<CohortSummary>(`/api/dashboard/cohort-revenue?${searchParams}`);
  },

  getLeadTrend: (params?: { startDate?: string; endDate?: string; accountId?: string; granularity?: 'day' | 'week' | 'month' }) => {
    const searchParams = new URLSearchParams({
      ...(params?.startDate && { startDate: params.startDate }),
      ...(params?.endDate && { endDate: params.endDate }),
      ...(params?.accountId && { accountId: params.accountId }),
      ...(params?.granularity && { granularity: params.granularity }),
    });
    return fetchAPI<LeadTrendData[]>(`/api/dashboard/lead-trend?${searchParams}`);
  },

  getSpendVsRevenue: (params?: { startDate?: string; endDate?: string; accountId?: string }) => {
    const searchParams = new URLSearchParams({
      ...(params?.startDate && { startDate: params.startDate }),
      ...(params?.endDate && { endDate: params.endDate }),
      ...(params?.accountId && { accountId: params.accountId }),
    });
    return fetchAPI<SpendVsRevenueData[]>(`/api/dashboard/spend-vs-revenue?${searchParams}`);
  },

  getRevenueByDealDate: (params?: { startDate?: string; endDate?: string; accountId?: string }) => {
    const searchParams = new URLSearchParams({
      ...(params?.startDate && { startDate: params.startDate }),
      ...(params?.endDate && { endDate: params.endDate }),
      ...(params?.accountId && { accountId: params.accountId }),
    });
    return fetchAPI<RevenueByDealDateData[]>(`/api/dashboard/revenue-by-deal-date?${searchParams}`);
  },

  getCampaignPerformance: (params?: { startDate?: string; endDate?: string; accountId?: string; limit?: number }) => {
    const searchParams = new URLSearchParams({
      ...(params?.startDate && { startDate: params.startDate }),
      ...(params?.endDate && { endDate: params.endDate }),
      ...(params?.accountId && { accountId: params.accountId }),
      ...(params?.limit && { limit: String(params.limit) }),
    });
    return fetchAPI<CampaignPerformance[]>(`/api/dashboard/campaign-performance?${searchParams}`);
  },

  getServicePerformance: (params?: { startDate?: string; endDate?: string; accountId?: string }) => {
    const searchParams = new URLSearchParams({
      ...(params?.startDate && { startDate: params.startDate }),
      ...(params?.endDate && { endDate: params.endDate }),
      ...(params?.accountId && { accountId: params.accountId }),
    });
    return fetchAPI<ServicePerformance[]>(`/api/dashboard/service-performance?${searchParams}`);
  },

  getCreativePerformance: (params?: { startDate?: string; endDate?: string; accountId?: string; limit?: number }) => {
    const searchParams = new URLSearchParams({
      ...(params?.startDate && { startDate: params.startDate }),
      ...(params?.endDate && { endDate: params.endDate }),
      ...(params?.accountId && { accountId: params.accountId }),
      ...(params?.limit && { limit: String(params.limit) }),
    });
    return fetchAPI<CreativePerformance[]>(`/api/dashboard/creative-performance?${searchParams}`);
  },

  getFunnelSnapshot: (params?: { startDate?: string; endDate?: string; accountId?: string }) => {
    const searchParams = new URLSearchParams({
      ...(params?.startDate && { startDate: params.startDate }),
      ...(params?.endDate && { endDate: params.endDate }),
      ...(params?.accountId && { accountId: params.accountId }),
    });
    return fetchAPI<FunnelSnapshot>(`/api/dashboard/funnel-snapshot?${searchParams}`);
  },

  getCampaigns: (params: {
    startDate?: string;
    endDate?: string;
    accountId?: string;
    search?: string;
  }) => {
    const searchParams = new URLSearchParams({
      ...(params.startDate && { startDate: params.startDate }),
      ...(params.endDate && { endDate: params.endDate }),
      ...(params.accountId && { accountId: params.accountId }),
      ...(params.search && { search: params.search }),
    });
    return fetchAPI<Campaign[]>(`/api/campaigns?${searchParams}`);
  },

  getCampaignHierarchy: (params?: { accountId?: string; search?: string; country?: string; level?: string; startDate?: string; endDate?: string }) => {
    const searchParams = new URLSearchParams({
      ...(params?.accountId && { accountId: params.accountId }),
      ...(params?.search && { search: params.search }),
      ...(params?.country && { country: params.country }),
      ...(params?.level && { level: params.level }),
      ...(params?.startDate && { startDate: params.startDate }),
      ...(params?.endDate && { endDate: params.endDate }),
    });
    return fetchAPI<CampaignHierarchy[]>(`/api/campaigns/hierarchy?${searchParams}`);
  },

  getAvailableCountries: () => fetchAPI<string[]>("/api/campaigns/countries"),

  syncMeta: () => fetchAPI<{ success: boolean }>("/api/meta/sync", { method: "POST" }),

  // Leads
  getLeads: (params: {
    startDate: string;
    endDate: string;
    accountId?: string;
    campaignId?: string;
    formName?: string;
    search?: string;
    page?: number;
    limit?: number;
    includeFieldData?: boolean;
  }) => {
    const searchParams = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
      ...(params.accountId && { accountId: params.accountId }),
      ...(params.campaignId && { campaignId: params.campaignId }),
      ...(params.formName && { formName: params.formName }),
      ...(params.search && { search: params.search }),
      page: String(params.page || 1),
      limit: String(params.limit || 50),
      ...(params.includeFieldData && { includeFieldData: 'true' }),
    });
    return fetchAPI<LeadsResponse>(`/api/leads?${searchParams}`);
  },

  getLeadDetails: (leadId: string) => fetchAPI<LeadDetails>(`/api/leads/${leadId}`),

  syncLead: (leadId: string) =>
    fetchAPI<{ success: boolean }>(`/api/leads/${leadId}/sync`, { method: "POST" }),

  getLeadProfiles: (params?: {
    search?: string;
    country?: string;
    source?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams({
      ...(params?.search && { search: params.search }),
      ...(params?.country && { country: params.country }),
      ...(params?.source && { source: params.source }),
      ...(params?.status && { status: params.status }),
      page: String(params?.page || 1),
      limit: String(params?.limit || 50),
    });
    return fetchAPI<LeadProfilesResponse>(`/api/leads/profiles?${searchParams}`);
  },

  getLeadProfilesFilterOptions: () =>
    fetchAPI<LeadProfilesFilterOptions>("/api/leads/profiles/filters"),

  // Subscriptions
  getSubscriptions: () => fetchAPI<Subscription[]>("/api/subscriptions"),

  refreshSubscriptions: () =>
    fetchAPI<Subscription[]>("/api/subscriptions/refresh", { method: "POST" }),

  autoSubscribe: () =>
    fetchAPI<{ success: boolean }>("/api/subscriptions/auto-subscribe", { method: "POST" }),

  // Mappings
  getMappings: () => fetchAPI<Mapping[]>("/api/mappings"),

  createMapping: (data: CreateMappingDto) =>
    fetchAPI<Mapping>("/api/mappings", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateMapping: (id: string, data: UpdateMappingDto) =>
    fetchAPI<Mapping>(`/api/mappings/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteMapping: (id: string) =>
    fetchAPI<void>(`/api/mappings/${id}`, { method: "DELETE" }),

  // Ad Accounts
  getAdAccounts: () => fetchAPI<AdAccount[]>("/api/ad-accounts"),

  // Field Mappings
  getFieldMappings: () => fetchAPI<FieldMapping[]>("/api/field-mappings"),

  getUnmappedFields: () => fetchAPI<UnmappedField[]>("/api/field-mappings/unmapped"),

  getStandardFields: () => fetchAPI<string[]>("/api/field-mappings/standard-fields"),

  createFieldMapping: (data: CreateFieldMappingDto) =>
    fetchAPI<FieldMapping>("/api/field-mappings", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateFieldMapping: (id: string, data: UpdateFieldMappingDto) =>
    fetchAPI<FieldMapping>(`/api/field-mappings/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteFieldMapping: (id: string) =>
    fetchAPI<void>(`/api/field-mappings/${id}`, { method: "DELETE" }),

  // Zoho Attribution
  zohoLookup: (phone: string) =>
    fetchAPI<ZohoLookupResult>(`/api/zoho/lookup?phone=${encodeURIComponent(phone)}`),

  zohoFunnelStats: (params?: { startDate?: string; endDate?: string }) => {
    const searchParams = new URLSearchParams({
      ...(params?.startDate && { startDate: params.startDate }),
      ...(params?.endDate && { endDate: params.endDate }),
    });
    return fetchAPI<ZohoFunnelStats>(`/api/zoho/funnel-stats?${searchParams}`);
  },

  zohoGetAttribution: (leadId: string) =>
    fetchAPI<ZohoAttribution>(`/api/zoho/attribution/${leadId}`),

  zohoCostByPhone: (phone: string) =>
    fetchAPI<ZohoCostResult>(`/api/zoho/cost/${encodeURIComponent(phone)}`),

  zohoAttributionList: (params?: {
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    offerFilter?: "all" | "with_offer" | "without_offer";
    sortBy?: "created_at" | "offer_amount" | "deal_amount" | "payment_amount" | "roas";
    sortDirection?: "asc" | "desc";
  }) => {
    const searchParams = new URLSearchParams({
      ...(params?.startDate && { startDate: params.startDate }),
      ...(params?.endDate && { endDate: params.endDate }),
      ...(params?.page && { page: String(params.page) }),
      ...(params?.limit && { limit: String(params.limit) }),
      ...(params?.offerFilter && { offerFilter: params.offerFilter }),
      ...(params?.sortBy && { sortBy: params.sortBy }),
      ...(params?.sortDirection && { sortDirection: params.sortDirection }),
    });
    return fetchAPI<ZohoAttributionListResponse>(`/api/zoho/attributions?${searchParams}`);
  },
};

// Types
export interface DashboardStats {
  totalSpend: number;
  totalLeads: number;
  lastSpendSync: string | null;
  lastLeadsSync: string | null;
}

export interface DashboardV2Params {
  startDate?: string;
  endDate?: string;
  accountId?: string;
  objective?: string;
  country?: string;
  service?: string;
  campaign?: string;
  language?: string;
}

export interface DashboardStatsV2 {
  spend: number;
  leads: number;
  cpl: number;
  deals: number;
  revenue: number;
  roas: number;
  leadToDealRate: number;
  costPerDeal: number;
  avgOfferAmount: number;
  avgDealAmount: number;
  lastSpendSync: string | null;
  lastLeadsSync: string | null;
}

export interface CohortData {
  cohortMonth: string;
  leadCount: number;
  monthsData: {
    month: number;
    revenue: number;
    cumulativeRevenue: number;
  }[];
}

export interface CohortSummary {
  cohorts: CohortData[];
  maxMonths: number;
}

export interface LeadTrendData {
  date: string;
  leads: number;
}

export interface SpendVsRevenueData {
  month: string;
  spend: number;
  leads: number;
  revenue: number;
}

export interface RevenueByDealDateData {
  month: string;
  revenue: number;
  dealCount: number;
}

export interface CampaignPerformance {
  campaignId: string;
  campaignName: string;
  spend: number;
  leads: number;
  deals: number;
  leadToDealRate: number;
  revenue: number;
  roas: number;
}

export interface ServicePerformance {
  service: string;
  leads: number;
  deals: number;
  leadToDealRate: number;
  revenue: number;
  roas: number;
  spend: number;
}

export interface CreativePerformance {
  adName: string;
  leads: number;
  deals: number;
  revenue: number;
}

export interface FunnelStageData {
  stage: string;
  count: number;
  cost: number;
}

export interface FunnelSnapshot {
  stages: FunnelStageData[];
  conversionRates: {
    leadToContact: number;
    contactToOffer: number;
    offerToDeal: number;
    dealToRealization: number;
  };
  totalSpend: number;
  totalLeads: number;
}

export interface Campaign {
  id: string;
  name: string;
  adAccountId: string;
  adAccountName: string;
  type: string;
  spendUsd: number;
  leads: number;
}

export interface Ad {
  id: string;
  adId: string;
  name: string;
  status: string;
  spendUsd: number;
  leads: number;
  countries: string[];
}

export interface AdSet {
  id: string;
  adSetId: string;
  name: string;
  status: string;
  optimizationGoal: string;
  spendUsd: number;
  leads: number;
  countries: string[];
  ads: Ad[];
}

export interface CampaignHierarchy {
  id: string;
  campaignId: string;
  name: string;
  adAccountId: string;
  adAccountName: string;
  type: string;
  status: string;
  countries: string[];
  spendUsd: number;
  leads: number;
  formLeads: number;
  insightsLeads: number;
  adSets: AdSet[];
}

export interface LeadFieldData {
  name: string;
  mappedName: string | null;
  values: string[];
}

export interface Lead {
  id: string;
  leadId: string;
  createdAt: string;
  adAccountName: string;
  campaignId: string;
  campaignName: string;
  adSetName: string;
  adName: string;
  formName: string;
  source: string;
  fieldData?: LeadFieldData[];
}

export interface LeadDetails extends Lead {
  fieldData: LeadFieldData[];
}

export interface LeadsResponse {
  data: Lead[];
  total: number;
  page: number;
  limit: number;
}

export interface LeadProfile {
  leadUuid: string;
  metaLeadId: string;
  adAccountId: string | null;
  campaignId: string | null;
  source: string;
  formName: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  status: string;
  dealAmount: number | null;
  offerAmount: number | null;
  paymentAmount: number | null;
  comments: string;
  dateOfBirth: string | null;
  createdTime: string;
  insertedAt: string | null;
  updatedAt: string;
}

export interface LeadProfilesResponse {
  data: LeadProfile[];
  total: number;
  page: number;
  limit: number;
}

export interface LeadProfilesFilterOptions {
  countries: string[];
  sources: string[];
  statuses: string[];
}

export interface Subscription {
  id: string;
  accountName: string;
  accountId: string;
  status: "subscribed" | "not_subscribed" | "error";
  fields: string;
  lastAttempt: string | null;
  lastSuccess: string | null;
  lastError: string | null;
}

export interface Mapping {
  id: string;
  name: string;
  rules: MappingRule[];
  createdAt: string;
  updatedAt: string;
}

export interface MappingRule {
  sourceField: string;
  sourceValue: string;
  targetEntity: string;
  targetId: string;
}

export interface CreateMappingDto {
  name: string;
  rules: MappingRule[];
}

export interface UpdateMappingDto {
  name?: string;
  rules?: MappingRule[];
}

export interface AdAccount {
  id: string;
  accountId: string;
  accountName: string;
}

export interface FieldMapping {
  id: string;
  raw_field_name: string;
  mapped_field: string;
  language: string | null;
  auto_detected: boolean;
  created_at: string;
}

export interface UnmappedField {
  fieldName: string;
  count: number;
  sampleValues: string[];
}

export interface CreateFieldMappingDto {
  rawFieldName: string;
  mappedField: string;
  language?: string;
  autoDetected?: boolean;
}

export interface UpdateFieldMappingDto {
  rawFieldName?: string;
  mappedField?: string;
  language?: string;
  autoDetected?: boolean;
}

// Zoho Attribution Types
export interface ZohoLookupResult {
  found: boolean;
  lead?: {
    id: string;
    leadId: string;
    date: string;
    campaign: string;
    campaignId: string;
    adSet: string;
    ad: string;
    form: string;
  };
  costs?: {
    attributedSpend: number;
    currency: string;
    costPerLead: number;
  };
  funnel?: {
    currentStage: string;
    stages: {
      lead?: string;
      contact?: string;
      offer?: string;
      deal?: string;
      payment?: string;
    };
    offerAmount?: number;
    dealAmount?: number;
    paymentAmount?: number;
  };
  roas?: number;
}

export interface ZohoFunnelStats {
  total: number;
  byStage: Record<string, number>;
  conversionRates: Record<string, number>;
  avgSpend: number;
  avgRoas: number;
  totalRevenue: number;
  totalSpend: number;
}

export interface ZohoAttribution {
  found: boolean;
  attribution?: {
    id: string;
    lead_id: string;
    phone_normalized: string;
    campaign_id: string;
    attributed_spend_usd: number;
    funnel_stage: string;
    offer_amount: number | null;
    deal_amount: number | null;
    payment_amount: number | null;
    roas: number | null;
    lead_date: string;
    contact_date: string | null;
    offer_date: string | null;
    deal_date: string | null;
    payment_date: string | null;
    leads?: {
      lead_id: string;
      form_name: string;
      ad_name: string;
      ad_set_name: string;
      created_at: string;
      campaigns: { name: string } | null;
    };
  };
}

export interface ZohoCostResult {
  found: boolean;
  phone?: string;
  campaign?: string;
  ad?: string;
  leadDate?: string;
  attributedSpend?: number;
  currency?: string;
  funnelStage?: string;
  offerAmount?: number;
  dealAmount?: number;
  paymentAmount?: number;
  roas?: number;
  message?: string;
}

export interface ZohoAttributionItem {
  id: string;
  phone: string;
  leadId: string;
  leadDate: string;
  campaignName: string;
  campaignId: string;
  adName: string | null;
  adSetName: string | null;
  formName: string | null;
  funnelStage: string;
  attributedSpend: number;
  offerAmount: number | null;
  dealAmount: number | null;
  paymentAmount: number | null;
  roas: number | null;
  contactDate: string | null;
  offerDate: string | null;
  dealDate: string | null;
  paymentDate: string | null;
  createdAt: string;
}

export interface ZohoAttributionListResponse {
  data: ZohoAttributionItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
