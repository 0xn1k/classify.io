"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { getSession, type SessionResult } from "@/lib/api";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { AuthField } from "@/components/auth/auth-field";
import { Button } from "@/components/ui/button";

function cleanPhone(value: string) {
  return value.replace(/[^\d+]/g, "");
}

// Shared phone -> OTP flow. After verification it resolves the app session and hands both
// the access token and the session result to the caller, which decides what happens next.
export function PhoneOtpStep({
  verifyCtaLabel = "Verify and continue",
  onVerified
}: {
  verifyCtaLabel?: string;
  onVerified: (token: string, session: SessionResult) => void | Promise<void>;
}) {
  const [stage, setStage] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function ensureEnv() {
    if (hasSupabaseEnv()) return true;
    setError("Sign-in is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
    return false;
  }

  async function sendCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!ensureEnv()) return;

    setIsLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({ phone: cleanPhone(phone) });
      if (otpError) throw otpError;
      setStage("otp");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We couldn't send the code. Check the number and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function confirmCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!ensureEnv()) return;

    setIsLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        phone: cleanPhone(phone),
        token: otp,
        type: "sms"
      });
      if (verifyError) throw verifyError;

      const accessToken = data.session?.access_token;
      if (!accessToken) throw new Error("Verification did not return a session. Please try again.");

      const session = await getSession(accessToken);
      await onVerified(accessToken, session);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "That code didn't work. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (stage === "phone") {
    return (
      <form className="space-y-4" onSubmit={sendCode}>
        <AuthField
          label="Mobile number"
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={setPhone}
          placeholder="+91 98765 43210"
          required
          autoFocus
        />
        {error ? <ErrorText>{error}</ErrorText> : null}
        <Button className="w-full" disabled={isLoading}>
          {isLoading ? "Sending code..." : "Send code"}
        </Button>
      </form>
    );
  }

  return (
    <form className="space-y-4" onSubmit={confirmCode}>
      <p className="text-sm text-muted-foreground">
        Enter the 6-digit code sent to <span className="font-medium text-foreground">{phone}</span>.
      </p>
      <AuthField
        label="Verification code"
        inputMode="numeric"
        value={otp}
        onChange={setOtp}
        placeholder="123456"
        required
        autoFocus
      />
      {error ? <ErrorText>{error}</ErrorText> : null}
      <Button className="w-full" disabled={isLoading}>
        {isLoading ? "Verifying..." : verifyCtaLabel}
      </Button>
      <button
        type="button"
        className="w-full text-sm text-muted-foreground underline-offset-4 hover:underline"
        onClick={() => {
          setOtp("");
          setError(null);
          setStage("phone");
        }}
      >
        Use a different number
      </button>
    </form>
  );
}

function ErrorText({ children }: { children: ReactNode }) {
  return <div className="rounded-md border border-destructive/40 px-3 py-2 text-sm text-destructive">{children}</div>;
}
