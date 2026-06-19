"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/api";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { AuthField } from "@/components/auth/auth-field";
import { Button } from "@/components/ui/button";

function cleanPhone(value: string) {
  return value.replace(/[^\d+]/g, "");
}

export function LoginForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!hasSupabaseEnv()) {
      setError("Sign-in is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        phone: cleanPhone(phone),
        password
      });
      if (signInError) throw signInError;

      const accessToken = data.session?.access_token;
      if (!accessToken) throw new Error("Sign-in did not return a session. Please try again.");

      const session = await getSession(accessToken);
      if (session.needsOnboarding || !session.user) {
        throw new Error("No account found for this number. Please create an account first.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Incorrect mobile number or password.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
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
      <AuthField label="Password" type="password" value={password} onChange={setPassword} required />
      {error ? (
        <div className="rounded-md border border-destructive/40 px-3 py-2 text-sm text-destructive">{error}</div>
      ) : null}
      <Button className="w-full" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
