"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { setupAccount } from "@/lib/api";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

type AuthMode = "login" | "signup";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!hasSupabaseEnv()) {
      setError("Supabase env values are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();

      if (mode === "login") {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) {
          throw signInError;
        }

        const metadata = data.user?.user_metadata ?? {};
        const setupName = typeof metadata.name === "string" ? metadata.name : data.user?.email ?? email;
        const setupSchoolName = typeof metadata.school_name === "string" ? metadata.school_name : undefined;
        const setupPhone = typeof metadata.phone === "string" ? metadata.phone : undefined;

        if (data.session?.access_token) {
          await setupAccount(
            data.session.access_token,
            setupSchoolName
              ? {
                  name: setupName,
                  schoolName: setupSchoolName,
                  phone: setupPhone
                }
              : undefined
          );
        }

        router.push("/dashboard");
        router.refresh();
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            school_name: schoolName,
            phone: phone || undefined
          }
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      if (!data.session?.access_token) {
        setMessage("Account created. Check email verification before signing in.");
        return;
      }

      await setupAccount(data.session.access_token, {
        name,
        schoolName,
        phone: phone || undefined
      });

      router.push("/dashboard");
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 rounded-md border p-1">
        <button
          className={`rounded-sm px-3 py-2 text-sm ${mode === "login" ? "bg-accent text-accent-foreground" : ""}`}
          type="button"
          onClick={() => setMode("login")}
        >
          Login
        </button>
        <button
          className={`rounded-sm px-3 py-2 text-sm ${mode === "signup" ? "bg-accent text-accent-foreground" : ""}`}
          type="button"
          onClick={() => setMode("signup")}
        >
          Create account
        </button>
      </div>

      {mode === "signup" ? (
        <>
          <Field label="Full name" value={name} onChange={setName} required />
          <Field label="School name" value={schoolName} onChange={setSchoolName} required />
          <Field label="Phone" value={phone} onChange={setPhone} />
        </>
      ) : null}

      <Field label="Email" type="email" value={email} onChange={setEmail} required />
      <Field label="Password" type="password" value={password} onChange={setPassword} required />

      {error ? <div className="rounded-md border border-destructive/40 px-3 py-2 text-sm text-destructive">{error}</div> : null}
      {message ? <div className="rounded-md border px-3 py-2 text-sm text-muted-foreground">{message}</div> : null}

      <Button className="w-full" disabled={isLoading}>
        {isLoading ? "Please wait..." : mode === "login" ? "Continue" : "Create account"}
      </Button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  const id = label.toLowerCase().replaceAll(" ", "-");

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="h-10 w-full rounded-md border bg-background px-3 text-sm"
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
