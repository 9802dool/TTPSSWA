/** Display: country code + local number (legacy records may omit country code). */
export function formatMemberPhoneDisplay(m: {
  phone: string;
  phoneCountryCode?: string;
}): string {
  const local = m.phone.trim();
  const cc = m.phoneCountryCode?.trim();
  if (cc) {
    return `${cc} ${local}`.trim();
  }
  return local;
}

/** `tel:` href for member application phone (E.164-style when country code present). */
export function memberPhoneTelHref(m: {
  phone: string;
  phoneCountryCode?: string;
}): string {
  const localDigits = m.phone.replace(/\D/g, "");
  const ccDigits = m.phoneCountryCode?.replace(/\D/g, "") ?? "";
  if (ccDigits && localDigits) {
    return `tel:+${ccDigits}${localDigits}`;
  }
  return `tel:${m.phone.replace(/\s/g, "")}`;
}

/** E.164 string e.g. +18681234567 for APIs (WhatsApp, SMS). */
export function memberPhoneE164(m: {
  phone: string;
  phoneCountryCode: string;
}): string {
  const localDigits = m.phone.replace(/\D/g, "");
  const ccDigits = m.phoneCountryCode.replace(/\D/g, "");
  return `+${ccDigits}${localDigits}`;
}
