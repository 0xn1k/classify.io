// Supabase stores phone identities as digits only (E.164 without the leading "+"),
// and the JWT `phone` claim matches that. Normalize everything we store/compare to digits.
export function normalizePhone(input: string): string {
  return input.replace(/\D/g, "");
}
