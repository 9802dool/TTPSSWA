/** Dial prefixes for membership application phone (validated server-side). */
export const MEMBERSHIP_PHONE_COUNTRY_CODES: readonly {
  value: string;
  label: string;
}[] = [
  { value: "+1868", label: "Trinidad & Tobago (+1868)" },
  { value: "+1246", label: "Barbados (+1246)" },
  { value: "+1242", label: "Bahamas (+1242)" },
  { value: "+1876", label: "Jamaica (+1876)" },
  { value: "+1787", label: "Puerto Rico (+1787)" },
  { value: "+1809", label: "Dominican Republic (+1809)" },
  { value: "+1829", label: "Dominican Republic (+1829)" },
  { value: "+592", label: "Guyana (+592)" },
  { value: "+597", label: "Suriname (+597)" },
  { value: "+1", label: "United States / Canada (+1)" },
  { value: "+44", label: "United Kingdom (+44)" },
  { value: "+33", label: "France (+33)" },
  { value: "+49", label: "Germany (+49)" },
  { value: "+91", label: "India (+91)" },
  { value: "+86", label: "China (+86)" },
];

export const MEMBERSHIP_DEFAULT_PHONE_COUNTRY_CODE = "+1868";

const allowed = new Set(
  MEMBERSHIP_PHONE_COUNTRY_CODES.map((c) => c.value),
);

export function isAllowedMembershipPhoneCountryCode(code: string): boolean {
  return allowed.has(code.trim());
}
