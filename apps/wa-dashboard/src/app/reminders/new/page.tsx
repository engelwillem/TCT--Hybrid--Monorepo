"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/topbar";
import {
  createReminderRequest,
  ExistingCustomerItem,
  ExistingStoreItem,
  meRequest,
  ownerResolveRequest,
  remindersRequest,
  searchExistingCustomers,
  searchExistingCustomersByPhone,
  searchExistingStores,
  settingsRequest,
  WaSettings,
} from "@/lib/api";
import { clearAuthCookie, getAuthCookie } from "@/lib/auth";
import { isAuthFailure } from "@/lib/session";
import { MessageTemplateEditor } from "@/components/message-template-editor";
import { AutocompleteInput } from "@/components/autocomplete-input";
import { hasInvalidPlaceholder, isValidWaPhone, normalizePhoneForCompare } from "@/lib/wa-form";
import { trackMetric } from "@/lib/metrics";

type FieldErrors = Record<string, string>;

type ZoneOption = {
  zona: "WIB" | "WITA" | "WIT";
  timezone: "Asia/Jakarta" | "Asia/Makassar" | "Asia/Jayapura";
};

const ZONE_OPTIONS: ZoneOption[] = [
  { zona: "WIB", timezone: "Asia/Jakarta" },
  { zona: "WITA", timezone: "Asia/Makassar" },
  { zona: "WIT", timezone: "Asia/Jayapura" },
];

function formatTanggalToDDMMYYYY(input: string): string {
  const parts = input.split("-");
  if (parts.length !== 3) return "";
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

function normalizeJam(input: string): string {
  if (!input) return "";
  return input.length === 5 ? `${input}:00` : input;
}

export default function NewReminderPage() {
  const router = useRouter();
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [jam, setJam] = useState("");
  const [zonaWaktu, setZonaWaktu] = useState<"WIB" | "WITA" | "WIT">("WIB");
  const [toko, setToko] = useState("");
  const [messageTemplate, setMessageTemplate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [ownerLockHint, setOwnerLockHint] = useState("");
  const [ownerLockType, setOwnerLockType] = useState<"neutral" | "safe" | "warn">("neutral");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [storeTouched, setStoreTouched] = useState(false);
  const [role, setRole] = useState("unknown");
  const [waSettings, setWaSettings] = useState<WaSettings | null>(null);

  const timezone = useMemo(() => {
    return ZONE_OPTIONS.find((z) => z.zona === zonaWaktu)?.timezone || "Asia/Jakarta";
  }, [zonaWaktu]);

  useEffect(() => {
    const bootstrap = async () => {
      const token = getAuthCookie();
      if (!token) return;
      const [me, settings] = await Promise.all([meRequest(token), settingsRequest(token)]);
      if (me.ok) {
        const userRole = String((me.data as { user?: { role?: string } })?.user?.role || "unknown").toLowerCase();
        setRole(userRole);
      }
      if (settings.ok) {
        setWaSettings(settings.data || {});
      }
    };
    void bootstrap();
  }, []);

  useEffect(() => {
    const token = getAuthCookie();
    const normalizedPhone = normalizePhoneForCompare(phone);
    const normalizedName = customerName.trim();

    if (!token || normalizedPhone.length < 10) {
      setOwnerLockHint("");
      setOwnerLockType("neutral");
      return;
    }

    const timer = setTimeout(async () => {
      const result = await ownerResolveRequest(token, normalizedPhone, normalizedName || undefined);

      if (!result.ok) {
        setOwnerLockHint("Unable to check owner lock history right now.");
        setOwnerLockType("neutral");
        return;
      }

      if (!result.data?.has_owner) {
        setOwnerLockHint("No owner history found for this number yet.");
        setOwnerLockType("neutral");
        return;
      }

      if (result.data.conflict) {
        setOwnerLockHint(result.data.reason || "Potential phone-owner conflict detected.");
        setOwnerLockType("warn");
        return;
      }

      const ownerName = result.data.owner_name || "-";
      setOwnerLockHint(`Histori owner nomor: "${ownerName}".`);
      setOwnerLockType("safe");
    }, 400);

    return () => clearTimeout(timer);
  }, [customerName, phone]);

  useEffect(() => {
    const checkExactNameMatch = async () => {
      const keyword = customerName.trim();
      if (keyword.length < 2) return;
      const token = getAuthCookie();
      if (!token) return;

      const results = await searchExistingCustomers(token, keyword);
      const exact = results.find((item) => item.nama.trim().toLowerCase() === keyword.toLowerCase());
      if (!exact) return;

      if (!phoneTouched && !phone.trim()) {
        setPhone(exact.noWhatsApp);
      }
      if (!storeTouched && !toko.trim() && exact.namaToko) {
        setToko(exact.namaToko);
      }
    };

    const timer = setTimeout(() => {
      void checkExactNameMatch();
    }, 300);

    return () => clearTimeout(timer);
  }, [customerName, phone, phoneTouched, storeTouched, toko]);

  const validate = (): FieldErrors => {
    const nextErrors: FieldErrors = {};

    if (!customerName.trim()) nextErrors.customer_name = "Customer name is required.";
    if (!phone.trim()) nextErrors.phone = "WhatsApp number is required.";
    if (phone.trim() && !isValidWaPhone(phone)) {
      trackMetric("invalid_phone_input");
      nextErrors.phone = "Invalid WhatsApp number. Use digits only (example: 6285xxxx), minimum 10 digits.";
    }
    if (!tanggal) nextErrors.tanggal = "Date is required.";
    if (!jam) nextErrors.jam = "Time is required.";
    if (!zonaWaktu) nextErrors.zona_waktu = "Time zone is required.";
    if (!messageTemplate.trim()) nextErrors.message_template = "Message template is required.";
    if (messageTemplate.trim() && hasInvalidPlaceholder(messageTemplate)) {
      trackMetric("invalid_placeholder_input");
      nextErrors.message_template =
        "Unknown placeholder. Use only Customer Name or Store Name from the available buttons.";
    }

    return nextErrors;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setError("");
    setSuccess("");
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const token = getAuthCookie();
    if (!token) {
      router.replace("/login?next=/reminders/new");
      return;
    }

    setSubmitting(true);

    if (waSettings?.demo_mode) {
      const demoLimit = Number(waSettings.demo_max_reminders || 10);
      const list = await remindersRequest(token, { page: 1, per_page: 1 });
      if (list.ok && list.total >= demoLimit) {
        setError(`Demo mode limits a maximum of ${demoLimit} reminders. Delete old data or request a package upgrade.`);
        setSubmitting(false);
        return;
      }

      const allowlist = Array.isArray(waSettings.demo_allowed_numbers) ? waSettings.demo_allowed_numbers : [];
      if (allowlist.length > 0) {
        const normalizedPhone = normalizePhoneForCompare(phone);
        const allowed = allowlist.some((entry) => normalizePhoneForCompare(entry) === normalizedPhone);
        if (!allowed) {
          setError("Demo mode only allows sending to registered internal numbers.");
          setSubmitting(false);
          return;
        }
      }
    }

    const payload = {
      customer_name: customerName.trim(),
      phone: normalizePhoneForCompare(phone.trim()),
      tanggal: formatTanggalToDDMMYYYY(tanggal),
      jam: normalizeJam(jam),
      zona_waktu: zonaWaktu,
      timezone,
      toko: toko.trim(),
      message_template: messageTemplate,
    };

    const result = await createReminderRequest(token, payload);

    if (!result.ok) {
      if (result.errors) {
        const backendErrors: FieldErrors = {};
        for (const [key, msgs] of Object.entries(result.errors)) {
          backendErrors[key] = Array.isArray(msgs) && msgs.length > 0 ? msgs[0] : "Invalid input.";
        }
        setFieldErrors(backendErrors);
      }

      if (isAuthFailure(result.statusCode, result.message)) {
        clearAuthCookie();
        router.replace("/login?next=/reminders/new");
        return;
      }

      setError(result.message || "Failed to create reminder.");
      trackMetric("create_reminder_failed");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setSuccess("Reminder created successfully.");
    trackMetric("create_reminder_success");
    router.push(`/reminders?refresh=${Date.now()}`);
  };

  return (
    <>
      <Topbar />
      <main>
        <div className="card form-layout-responsive">
          <h1>Create New Reminder</h1>
          <p>Fill reminder data according to the backend API contract.</p>
          {role === "viewer" ? <p className="error">Viewer role can only view data. Creating reminders is disabled.</p> : null}
          {waSettings?.demo_mode ? <p style={{ fontSize: 12, color: "#92400e" }}>Demo mode is active: limit and allowlist guards are enforced.</p> : null}

          <form onSubmit={onSubmit} className="stack" style={{ marginTop: 12 }}>
            <AutocompleteInput<ExistingCustomerItem>
              value={customerName}
              onChange={setCustomerName}
              placeholder="Customer Name"
              minChars={2}
              searchFn={async (query) => {
                const token = getAuthCookie();
                if (!token) return [];
                return searchExistingCustomers(token, query);
              }}
              getOptionLabel={(item) => item.nama}
              renderOption={(item) => (
                <div>
                  <div style={{ fontWeight: 600 }}>{item.nama}</div>
                  <div style={{ fontSize: 12, color: "#334155" }}>
                    {item.noWhatsApp}
                    {item.namaToko ? ` • ${item.namaToko}` : ""}
                  </div>
                </div>
              )}
              onSelect={(item) => {
                setCustomerName(item.nama);
                setPhone(item.noWhatsApp);
                setPhoneTouched(false);
                if (item.namaToko) {
                  setToko(item.namaToko);
                }
                setStoreTouched(false);
              }}
              error={fieldErrors.customer_name}
            />

            <AutocompleteInput<ExistingCustomerItem>
              value={phone}
              onChange={(value) => setPhone(value.replace(/\D+/g, ""))}
              onManualEdit={() => setPhoneTouched(true)}
              placeholder="WhatsApp Number (example: 6285xxxx)"
              minChars={3}
              searchFn={async (query) => {
                const token = getAuthCookie();
                if (!token) return [];
                return searchExistingCustomersByPhone(token, query);
              }}
              getOptionLabel={(item) => item.noWhatsApp}
              renderOption={(item) => (
                <div>
                  <div style={{ fontWeight: 600 }}>{item.noWhatsApp}</div>
                  <div style={{ fontSize: 12, color: "#334155" }}>
                    {item.nama}
                    {item.namaToko ? ` • ${item.namaToko}` : ""}
                  </div>
                </div>
              )}
              onSelect={(item) => {
                setPhone(item.noWhatsApp.replace(/\D+/g, ""));
                setCustomerName(item.nama);
                if (item.namaToko) {
                  setToko(item.namaToko);
                }
                setPhoneTouched(false);
                setStoreTouched(false);
              }}
              error={fieldErrors.phone}
            />
            {ownerLockHint ? (
              <div
                style={{
                  fontSize: 12,
                  color: ownerLockType === "warn" ? "#b91c1c" : ownerLockType === "safe" ? "#166534" : "#334155",
                }}
              >
                {ownerLockHint}
              </div>
            ) : null}

            <div className="grid-3">
              <div>
                <input className="input" type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
                {fieldErrors.tanggal ? <div className="error">{fieldErrors.tanggal}</div> : null}
              </div>

              <div>
                <input className="input" type="time" step={1} value={jam} onChange={(e) => setJam(e.target.value)} />
                {fieldErrors.jam ? <div className="error">{fieldErrors.jam}</div> : null}
              </div>

              <div>
                <select className="input" value={zonaWaktu} onChange={(e) => setZonaWaktu(e.target.value as "WIB" | "WITA" | "WIT") }>
                  {ZONE_OPTIONS.map((option) => (
                    <option key={option.zona} value={option.zona}>
                      {option.zona} ({option.timezone})
                    </option>
                  ))}
                </select>
                {fieldErrors.zona_waktu ? <div className="error">{fieldErrors.zona_waktu}</div> : null}
              </div>
            </div>

            <AutocompleteInput<ExistingStoreItem>
              value={toko}
              onChange={setToko}
              onManualEdit={() => setStoreTouched(true)}
              placeholder="Store Name (optional)"
              minChars={2}
              searchFn={async (query) => {
                const token = getAuthCookie();
                if (!token) return [];
                return searchExistingStores(token, query);
              }}
              getOptionLabel={(item) => item.namaToko}
              renderOption={(item) => <div>{item.namaToko}</div>}
              onSelect={(item) => {
                setToko(item.namaToko);
                setStoreTouched(false);
              }}
            />

            <MessageTemplateEditor
              value={messageTemplate}
              onChange={setMessageTemplate}
              customerName={customerName}
              storeName={toko}
              error={fieldErrors.message_template}
            />

            {error ? <div className="error">{error}</div> : null}
            {success ? <div style={{ color: "#166534", fontSize: 13 }}>{success}</div> : null}

            <button className="button" type="submit" disabled={submitting || role === "viewer"} style={{ maxWidth: 220 }}>
              {submitting ? "Saving..." : "Save Reminder"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
