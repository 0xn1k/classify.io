import Link from "next/link";
import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in with your registered mobile number."
      footer={
        <>
          New institute?{" "}
          <Link className="font-medium text-foreground underline-offset-4 hover:underline" href="/signup">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}
