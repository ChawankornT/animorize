import { LoginForm } from "./login-form";

export const metadata = {
  title: "Log in — Animorize",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-medium tracking-tight text-primary">Log in to Animorize</h1>
          <p className="text-sm text-secondary">Enter your email and password to continue.</p>
        </div>
        <LoginForm />
        <p className="text-center text-sm text-tertiary">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="text-primary hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
