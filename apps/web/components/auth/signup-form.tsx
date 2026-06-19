"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { setupAccount } from "@/lib/api";
import { AuthField } from "@/components/auth/auth-field";
import { PhoneOtpStep } from "@/components/auth/phone-otp-step";
import { Button } from "@/components/ui/button";

export function SignupForm() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function goToDashboard() {
    router.push("/dashboard");
    router.refresh();
  }

  if (!token) {
    return (
      <PhoneOtpStep
        verifyCtaLabel="Verify number"
        onVerified={(accessToken, session) => {
          if (!session.needsOnboarding && session.user) {
            goToDashboard();
            return;
          }
          setToken(accessToken);
        }}
      />
    );
  }

  async function completeSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setIsSaving(true);
    try {
      // Password is set server-side by /auth/setup-account via the Supabase Admin API,
      // alongside creating the school + principal user — one server round-trip, no second
      // browser call to Supabase.
      await setupAccount(token, { name, schoolName, password });
      goToDashboard();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We couldn't finish setting up your account.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={completeSignup}>
      <p className="text-sm text-muted-foreground">
        Your number is verified. Set a password and your institute details.
      </p>
      <AuthField label="Your full name" value={name} onChange={setName} required autoFocus />
      <AuthField label="Institute name" value={schoolName} onChange={setSchoolName} required />
      <AuthField label="Password" type="password" value={password} onChange={setPassword} required />
      <AuthField label="Confirm password" type="password" value={confirm} onChange={setConfirm} required />
      {error ? (
        <div className="rounded-md border border-destructive/40 px-3 py-2 text-sm text-destructive">{error}</div>
      ) : null}
      <Button className="w-full" disabled={isSaving}>
        {isSaving ? "Creating..." : "Create institute"}
      </Button>
    </form>
  );
}
