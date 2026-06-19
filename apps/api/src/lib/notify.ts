import { env } from "./env.js";
import type { UserRole } from "./rbac.js";

// Provider-agnostic message seam (TRD §13.2 sendMessage). No real WhatsApp/SMS provider is
// wired yet, so this logs and returns. A provider integration drops in here later without
// changing any caller.
export async function sendMessage(
  phone: string,
  message: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  if (!env.whatsappProvider) {
    console.info(`[notify] (no provider configured) -> ${phone}: ${message}`, metadata ?? {});
    return;
  }

  // TODO: call the configured provider using env.whatsappProvider / whatsappApiKey / whatsappSenderId.
  console.info(`[notify] (${env.whatsappProvider}) -> ${phone}: ${message}`, metadata ?? {});
}

// Sent when an admin creates a staff login. Deliberately never includes the password — the
// admin shares the temporary password out-of-band until real delivery is enabled.
export async function notifyStaffCreated(user: {
  name: string;
  phone: string;
  roles: UserRole[];
}): Promise<void> {
  const message = `Hi ${user.name}, your SchoolOS account is ready. Sign in with your mobile number ${user.phone}.`;
  await sendMessage(user.phone, message, { kind: "staff_created", roles: user.roles });
}
