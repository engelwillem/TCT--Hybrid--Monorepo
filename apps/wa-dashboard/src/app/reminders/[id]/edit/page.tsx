"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Topbar } from "@/components/topbar";
import { clearAuthCookie, getAuthCookie } from "@/lib/auth";
import { meRequest, ownerResolveRequest, reminderDetailRequest, updateReminderRequest } from "@/lib/api";
import { isAuthFailure } from "@/lib/session";
import { MessageTemplateEditor } from "@/components/message-template-editor";
import { hasInvalidPlaceholder, isValidWaPhone, normalizePhoneForCompare } from "@/lib/wa-form";

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

function fromDDMMYYYYToISO(input?: string): string {
  if (!input) return "";
  const parts = input.split("/");
  if (parts.length !== 3) return "";
  const [day, month, year] = parts;
  if (!day || !month || !year) return "";
  return `${year.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function parseScheduledAt(scheduledAt?: string): { date: string; time: string } {
  if (!scheduledAt) return { date: "", time: "" };
  const raw = scheduledAt.replace("T", " ").replace("Z", "").trim();
  const [datePart, timePart] = raw.split(" ");
  if (!datePart || !timePart) return { date: "", time: "" };
  const date = datePart.includes("-") ? datePart : "";
  const time = timePart.slice(0, 8);
  return { date, time };
}

export default function EditReminderPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const reminderId = String(params?.id || "");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [jam, setJam] = useState("");
  const [zonaWaktu, setZonaWaktu] = useState<"WIB" | "WITA" | "WIT">("WIB");
  const [toko, setToko] = useState("");
  const [messageTemplate, setMessageTemplate] = useState("");
  const [ownerLockHint, setOwnerLockHint] = useState("");
  const [ownerLockType, setOwnerLockType] = useState<"neutral" | "safe" | "warn">("neutral");
  const [role, setRole] = useState("unknown");

  const timezone = useMemo(() => {
    return ZONE_OPTIONS.find((z) => z.zona === zonaWaktu)?.timezone || "Asia/Jakarta";
  }, [zonaWaktu]);

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
        setOwnerLockHint("Tidak bisa cek histori owner lock saat ini.");
        setOwnerLockType("neutral");
        return;
      }

      if (!result.data?.has_owner) {
        setOwnerLockHint("No owner history found for this number yet.");
        setOwnerLockType("neutral");
        return;
      }

      if (result.data.conflict) {
        setOwnerLockHint(result.data.reason || "Potensi conflict_phone_owner terdeteksi.");
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
    const loadDetail = async () => {
      const token = getAuthCookie();
      if (!token) {
        router.replace(`/login?next=/reminders/${reminderId}/edit`);
        return;
      }

      const detail = await reminderDetailRequest(token, reminderId);
      const me = await meRequest(token);
      if (me.ok) {
        const userRole = String((me.data as { user?: { role?: string } })?.user?.role || "unknown").toLowerCase();
        setRole(userRole);
      }
      if (!detail.ok || !detail.data) {
        if (isAuthFailure(detail.statusCode, detail.message)) {
          clearAuthCookie();
          router.replace(`/login?next=/reminders/${reminderId}/edit`);
          return;
        }
        setError(detail.message || "Failed to load reminder details.");
        setLoading(false);
        return;
      }

      const item = detail.data;
      const parsedScheduled = parseScheduledAt(item.scheduled_at);

      setCustomerName(item.customer_name || "");
      setPhone(item.phone || "");
      setToko(item.toko || "");
      setMessageTemplate(item.message_template || "");

      const inferredDate = fromDDMMYYYYToISO(item.tanggal) || parsedScheduled.date;
      const inferredTime = normalizeJam(item.jam || parsedScheduled.time);
      setTanggal(inferredDate);
      setJam(inferredTime);

      const incomingZona = item.zona_waktu;
      if (incomingZona === "WIB" || incomingZona === "WITA" || incomingZona === "WIT") {
        setZonaWaktu(incomingZona);
      } else {
        setZonaWaktu("WIB");
      }

      setLoading(false);
    };

    if (reminderId) {
      loadDetail();
    }
  }, [reminderId, router]);

  const validate = (): FieldErrors => {
    const nextErrors: FieldErrors = {};

    if (!customerName.trim()) nextErrors.customer_name = "Customer name is required.";
    if (!phone.trim()) nextErrors.phone = "WhatsApp number is required.";
    if (phone.trim() && !isValidWaPhone(phone)) {
      nextErrors.phone = "Invalid WhatsApp number. Use digits only (example: 6285xxxx), minimum 10 digits.";
    }
    if (!tanggal) nextErrors.tanggal = "Date is required.";
    if (!jam) nextErrors.jam = "Time is required.";
    if (!zonaWaktu) nextErrors.zona_waktu = "Time zone is required.";
    if (!messageTemplate.trim()) nextErrors.message_template = "Message template is required.";
    if (messageTemplate.trim() && hasInvalidPlaceholder(messageTemplate)) {
      nextErrors.message_template =
        "Unknown placeholder. Use only Customer Name or Store Name from the available buttons.";
    }

    return nextErrors;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (role === "viewer") return;

    setError("");
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const token = getAuthCookie();
    if (!token) {
      router.replace(`/login?next=/reminders/${reminderId}/edit`);
      return;
    }

    setSubmitting(true);

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

    const result = await updateReminderRequest(token, reminderId, payload);

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
        router.replace(`/login?next=/reminders/${reminderId}/edit`);
        return;
      }

      setError(result.message || "Failed to update reminder.");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    router.push(`/reminders?refresh=${Date.now()}`);
  };

  return (
    <>
      <Topbar />
      <main>
        <div className="card form-layout-responsive">
          <h1>Edit Reminder</h1>
          <p>Update schedule for the same reminder with a safe reschedule flow.</p>
          {role === "viewer" ? <p className="error">Viewer role can only view data. Editing is disabled.</p> : null}

          {loading ? <p>Loading reminder data...</p> : null}
          {error ? <p className="error">{error}</p> : null}

          {!loading ? (
            <form onSubmit={onSubmit} className="stack" style={{ marginTop: 12 }}>
              <input
                className="input"
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
              {fieldErrors.customer_name ? <div className="error">{fieldErrors.customer_name}</div> : null}

              <input className="input" placeholder="No WhatsApp" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D+/g, ""))} />
              {fieldErrors.phone ? <div className="error">{fieldErrors.phone}</div> : null}
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

              <input className="input" placeholder="Store Name (optional)" value={toko} onChange={(e) => setToko(e.target.value)} />

              <MessageTemplateEditor
                value={messageTemplate}
                onChange={setMessageTemplate}
                customerName={customerName}
                storeName={toko}
                error={fieldErrors.message_template}
              />

              <button className="button" type="submit" disabled={submitting || role === "viewer"} style={{ maxWidth: 220 }}>
                {submitting ? "Saving..." : "Save Changes"}
              </button>
            </form>
          ) : null}
        </div>
      </main>
    </>
  );
}
