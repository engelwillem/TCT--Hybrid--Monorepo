import { API_BASE } from "@/lib/auth";

type LoginResponse = {
  status: boolean;
  token?: string;
  message?: string;
  statusCode?: number;
};

type ApiResult = {
  ok: boolean;
  message?: string;
  statusCode?: number;
};

export async function loginRequest(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      status: false,
      message: json?.message || "Login failed.",
      statusCode: response.status,
    };
  }

  return {
    status: Boolean(json?.status === true || json?.status === "success"),
    token: json?.data?.token || json?.token,
    message: json?.message,
    statusCode: response.status,
  };
}

export async function meRequest(token: string) {
  const response = await fetch(`${API_BASE}/profile`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const json = await response.json().catch(() => ({}));
  return {
    ok: response.ok,
    data: json,
    statusCode: response.status,
  };
}

export async function logoutRequest(token: string): Promise<ApiResult> {
  const response = await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const json = await response.json().catch(() => ({}));
  return {
    ok: response.ok && Boolean(json?.status ?? true),
    message: json?.message,
    statusCode: response.status,
  };
}

export type ReminderItem = {
  id: number | string;
  customer_name?: string;
  phone?: string;
  status?: string;
  scheduled_at?: string;
  tanggal?: string;
  jam?: string;
  zona_waktu?: "WIB" | "WITA" | "WIT" | string;
  timezone?: "Asia/Jakarta" | "Asia/Makassar" | "Asia/Jayapura" | string;
  sent_at?: string;
  fonnte_message_id?: string | null;
  message_template?: string;
  toko?: string;
};

export type ReminderQuery = {
  status?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  per_page?: number;
};

export type ReminderListResult = {
  ok: boolean;
  message?: string;
  statusCode?: number;
  items: ReminderItem[];
  page: number;
  perPage: number;
  total: number;
  lastPage: number;
};

export type ReminderCreatePayload = {
  customer_name: string;
  phone: string;
  tanggal: string;
  jam: string;
  zona_waktu: "WIB" | "WITA" | "WIT";
  timezone: "Asia/Jakarta" | "Asia/Makassar" | "Asia/Jayapura";
  toko?: string;
  message_template: string;
};

export type ReminderCreateResult = {
  ok: boolean;
  message?: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
  data?: ReminderItem;
};

export type ReminderDeleteResult = {
  ok: boolean;
  message?: string;
  statusCode?: number;
};

export type ReminderDetailResult = {
  ok: boolean;
  message?: string;
  statusCode?: number;
  data?: ReminderItem;
};

export type DashboardSummary = {
  total: number;
  pending: number;
  terkirim: number;
  gagal: number;
  skip: number;
  today: number;
};

export type DashboardSummaryResult = {
  ok: boolean;
  message?: string;
  statusCode?: number;
  data?: DashboardSummary;
};

export type OwnerResolveResult = {
  ok: boolean;
  message?: string;
  statusCode?: number;
  data?: {
    phone: string;
    has_owner: boolean;
    owner_name: string | null;
    owner_confidence: number | null;
    conflict: boolean;
    reason: string | null;
  };
};

export type ReminderLogItem = {
  id: number;
  row_number?: number | null;
  customer_name?: string | null;
  phone?: string | null;
  status?: string | null;
  timezone?: string | null;
  scheduled_at?: string | null;
  sent_at?: string | null;
  fonnte_message_id?: string | null;
  reason?: string | null;
  created_at?: string | null;
};

export type ReminderLogsResult = {
  ok: boolean;
  message?: string;
  statusCode?: number;
  logs: ReminderLogItem[];
};

export type ExistingCustomerItem = {
  nama: string;
  noWhatsApp: string;
  namaToko?: string;
};

export type ExistingStoreItem = {
  namaToko: string;
};

export type WaTemplateItem = {
  id: number | string;
  name: string;
  content: string;
  is_default?: boolean;
};

export type WaTemplatePayload = {
  name: string;
  content: string;
  is_default?: boolean;
};

export type WaSettings = {
  demo_mode?: boolean;
  demo_max_reminders?: number;
  demo_allowed_numbers?: string[];
  sender_label?: string;
  timezone_default?: string;
};

function toInt(value: unknown, fallback: number): number {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : fallback;
}

function normalizeSummary(raw: unknown): DashboardSummary {
  const source = (raw ?? {}) as Record<string, unknown>;
  return {
    total: toInt(source.total, 0),
    pending: toInt(source.pending, 0),
    terkirim: toInt(source.terkirim, 0),
    gagal: toInt(source.gagal, 0),
    skip: toInt(source.skip, 0),
    today: toInt(source.today, 0),
  };
}

export async function remindersRequest(token: string, query: ReminderQuery): Promise<ReminderListResult> {
  const params = new URLSearchParams();
  if (query.status) params.set("status", query.status);
  if (query.date_from) params.set("date_from", query.date_from);
  if (query.date_to) params.set("date_to", query.date_to);
  if (query.search) params.set("search", query.search);
  params.set("page", String(query.page || 1));
  params.set("per_page", String(query.per_page || 10));

  const response = await fetch(`${API_BASE}/wa/reminders?${params.toString()}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const json = await response.json().catch(() => ({}));
  const payload = json?.data ?? json;
  const items = Array.isArray(payload?.data) ? payload.data : Array.isArray(json?.rows) ? json.rows : [];

  const page = toInt(payload?.current_page ?? json?.current_page ?? query.page, 1);
  const perPage = toInt(payload?.per_page ?? json?.per_page ?? query.per_page, 10);
  const total = toInt(payload?.total ?? json?.total ?? items.length, items.length);
  const lastPage = toInt(payload?.last_page ?? json?.last_page ?? 1, 1);

  return {
    ok: response.ok,
    message: json?.message,
    statusCode: response.status,
    items,
    page,
    perPage,
    total,
    lastPage,
  };
}

export async function createReminderRequest(
  token: string,
  payload: ReminderCreatePayload
): Promise<ReminderCreateResult> {
  const response = await fetch(`${API_BASE}/wa/reminders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await response.json().catch(() => ({}));
  return {
    ok: response.ok && Boolean(json?.status ?? true),
    message: json?.message,
    statusCode: response.status,
    errors: json?.errors,
    data: json?.data,
  };
}

export async function reminderDetailRequest(token: string, id: string): Promise<ReminderDetailResult> {
  const response = await fetch(`${API_BASE}/wa/reminders/${id}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const json = await response.json().catch(() => ({}));
  const data = (json?.data?.data ?? json?.data ?? json) as ReminderItem;
  return {
    ok: response.ok,
    message: json?.message,
    statusCode: response.status,
    data,
  };
}

export async function updateReminderRequest(
  token: string,
  id: string,
  payload: ReminderCreatePayload
): Promise<ReminderCreateResult> {
  const response = await fetch(`${API_BASE}/wa/reminders/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await response.json().catch(() => ({}));
  return {
    ok: response.ok && Boolean(json?.status ?? true),
    message: json?.message,
    statusCode: response.status,
    errors: json?.errors,
    data: json?.data,
  };
}

export async function deleteReminderRequest(token: string, id: string): Promise<ReminderDeleteResult> {
  const response = await fetch(`${API_BASE}/wa/reminders/${id}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await response.json().catch(() => ({}));
  return {
    ok: response.ok && Boolean(json?.status ?? true),
    message: json?.message,
    statusCode: response.status,
  };
}

export async function dashboardSummaryRequest(token: string): Promise<DashboardSummaryResult> {
  const response = await fetch(`${API_BASE}/wa/dashboard`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const json = await response.json().catch(() => ({}));
  const payload = json?.data ?? json;
  return {
    ok: response.ok,
    message: json?.message,
    statusCode: response.status,
    data: normalizeSummary(payload),
  };
}

export async function ownerResolveRequest(
  token: string,
  phone: string,
  customerName?: string
): Promise<OwnerResolveResult> {
  const params = new URLSearchParams();
  params.set("phone", phone);
  if (customerName) params.set("customer_name", customerName);

  const response = await fetch(`${API_BASE}/wa/owners/resolve?${params.toString()}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const json = await response.json().catch(() => ({}));
  return {
    ok: response.ok && Boolean(json?.status ?? true),
    message: json?.message,
    statusCode: response.status,
    data: json?.data,
  };
}

export async function reminderLogsRequest(token: string, id: string): Promise<ReminderLogsResult> {
  const response = await fetch(`${API_BASE}/wa/reminders/${id}/logs`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const json = await response.json().catch(() => ({}));
  const logs = Array.isArray(json?.data?.logs) ? json.data.logs : [];
  return {
    ok: response.ok && Boolean(json?.status ?? true),
    message: json?.message,
    statusCode: response.status,
    logs,
  };
}

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizePhoneDigits(value: string): string {
  return value.replace(/\D+/g, "");
}

function toExistingCustomer(item: ReminderItem): ExistingCustomerItem | null {
  const nama = normalizeText(item.customer_name);
  const noWhatsApp = normalizeText(item.phone);
  const namaToko = normalizeText(item.toko);
  if (!nama || !noWhatsApp) return null;
  return { nama, noWhatsApp, namaToko: namaToko || undefined };
}

function uniqueCustomers(items: ExistingCustomerItem[]): ExistingCustomerItem[] {
  const seen = new Set<string>();
  const result: ExistingCustomerItem[] = [];
  items.forEach((item) => {
    const key = `${item.nama.toLowerCase()}|${normalizePhoneDigits(item.noWhatsApp)}`;
    if (seen.has(key)) return;
    seen.add(key);
    result.push(item);
  });
  return result;
}

async function searchReminderRows(token: string, query: string): Promise<ReminderItem[]> {
  const result = await remindersRequest(token, {
    search: query,
    page: 1,
    per_page: 25,
  });
  if (!result.ok) return [];
  return result.items;
}

export async function searchExistingCustomers(token: string, query: string): Promise<ExistingCustomerItem[]> {
  const keyword = query.trim();
  if (!keyword) return [];

  const rows = await searchReminderRows(token, keyword);
  return uniqueCustomers(
    rows
      .map(toExistingCustomer)
      .filter((item): item is ExistingCustomerItem => Boolean(item))
      .filter((item) => item.nama.toLowerCase().includes(keyword.toLowerCase()))
  );
}

export async function searchExistingCustomersByPhone(token: string, query: string): Promise<ExistingCustomerItem[]> {
  const keyword = normalizePhoneDigits(query);
  if (!keyword) return [];

  const rows = await searchReminderRows(token, query.trim());
  return uniqueCustomers(
    rows
      .map(toExistingCustomer)
      .filter((item): item is ExistingCustomerItem => Boolean(item))
      .filter((item) => normalizePhoneDigits(item.noWhatsApp).includes(keyword))
  );
}

export async function searchExistingStores(token: string, query: string): Promise<ExistingStoreItem[]> {
  const keyword = query.trim().toLowerCase();
  if (!keyword) return [];

  const rows = await searchReminderRows(token, query.trim());
  const seen = new Set<string>();
  const stores: ExistingStoreItem[] = [];

  rows.forEach((row) => {
    const namaToko = normalizeText(row.toko);
    if (!namaToko) return;
    if (!namaToko.toLowerCase().includes(keyword)) return;
    const key = namaToko.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    stores.push({ namaToko });
  });

  return stores;
}

export async function listTemplatesRequest(token: string): Promise<{ ok: boolean; message?: string; statusCode?: number; items: WaTemplateItem[] }> {
  const response = await fetch(`${API_BASE}/wa/templates`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  const json = await response.json().catch(() => ({}));
  const payload = json?.data?.data ?? json?.data ?? [];
  const items = Array.isArray(payload) ? payload : [];
  return { ok: response.ok, message: json?.message, statusCode: response.status, items };
}

export async function createTemplateRequest(token: string, payload: WaTemplatePayload): Promise<ApiResult> {
  const response = await fetch(`${API_BASE}/wa/templates`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const json = await response.json().catch(() => ({}));
  return { ok: response.ok && Boolean(json?.status ?? true), message: json?.message, statusCode: response.status };
}

export async function updateTemplateRequest(token: string, id: string, payload: WaTemplatePayload): Promise<ApiResult> {
  const response = await fetch(`${API_BASE}/wa/templates/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const json = await response.json().catch(() => ({}));
  return { ok: response.ok && Boolean(json?.status ?? true), message: json?.message, statusCode: response.status };
}

export async function deleteTemplateRequest(token: string, id: string): Promise<ApiResult> {
  const response = await fetch(`${API_BASE}/wa/templates/${id}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const json = await response.json().catch(() => ({}));
  return { ok: response.ok && Boolean(json?.status ?? true), message: json?.message, statusCode: response.status };
}

export async function settingsRequest(token: string): Promise<{ ok: boolean; message?: string; statusCode?: number; data?: WaSettings }> {
  const response = await fetch(`${API_BASE}/wa/settings`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  const json = await response.json().catch(() => ({}));
  return {
    ok: response.ok,
    message: json?.message,
    statusCode: response.status,
    data: (json?.data ?? {}) as WaSettings,
  };
}

export async function updateSettingsRequest(token: string, payload: WaSettings): Promise<ApiResult> {
  const response = await fetch(`${API_BASE}/wa/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const json = await response.json().catch(() => ({}));
  return { ok: response.ok && Boolean(json?.status ?? true), message: json?.message, statusCode: response.status };
}
