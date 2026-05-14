export function normalizePhoneForCompare(input: string): string {
  const digits = input.replace(/\D+/g, "");
  if (!digits) return "";
  if (digits.startsWith("08")) return `628${digits.slice(2)}`;
  if (digits.startsWith("8")) return `628${digits.slice(1)}`;
  return digits;
}

export function isValidWaPhone(input: string): boolean {
  const normalized = normalizePhoneForCompare(input);
  return /^\d+$/.test(normalized) && normalized.length >= 10 && normalized.length <= 16;
}

export function hasInvalidPlaceholder(template: string): boolean {
  const allowed = new Set(["{nama}", "{toko}"]);
  for (let i = 0; i < template.length; i += 1) {
    const char = template[i];
    if (char === "{") {
      const end = template.indexOf("}", i + 1);
      if (end === -1) return true;
      const token = template.slice(i, end + 1);
      if (!allowed.has(token)) return true;
      i = end;
      continue;
    }
    if (char === "}") return true;
  }
  return false;
}
