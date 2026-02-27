const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
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

  return res.json();
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
};

// Types
export interface DashboardStats {
  totalSpend: number;
  totalLeads: number;
  lastSpendSync: string | null;
  lastLeadsSync: string | null;
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
