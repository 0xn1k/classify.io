import { webEnv } from "@/lib/env";

export type SetupAccountPayload = {
  name: string;
  schoolName: string;
  phone?: string;
};

export async function setupAccount(accessToken: string, payload?: SetupAccountPayload) {
  const response = await fetch(`${webEnv.apiUrl}/auth/setup-account`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload ?? {})
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message ?? "Unable to finish account setup");
  }

  return result.data;
}
