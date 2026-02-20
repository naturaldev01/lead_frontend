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
    startDate: string;
    endDate: string;
    accountId?: string;
    objective?: string;
  }) => {
    const searchParams = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
      ...(params.accountId && { accountId: params.accountId }),
      ...(params.objective && { objective: params.objective }),
    });
    return fetchAPI<DashboardStats>(`/api/dashboard?${searchParams}`);
  },

  getCampaigns: (params: {
    startDate: string;
    endDate: string;
    accountId?: string;
    search?: string;
  }) => {
    const searchParams = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
      ...(params.accountId && { accountId: params.accountId }),
      ...(params.search && { search: params.search }),
    });
    return fetchAPI<Campaign[]>(`/api/campaigns?${searchParams}`);
  },

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
};

// Types
export interface DashboardStats {
  totalSpend: number;
  totalLeads: number;
  lastSpendSync: string;
  lastLeadsSync: string;
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
}

export interface LeadDetails extends Lead {
  fieldData: Array<{
    name: string;
    values: string[];
  }>;
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
