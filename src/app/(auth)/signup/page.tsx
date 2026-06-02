import { SignupForm } from "./signup-form";

export const metadata = {
  title: "Sign up — Animorize",
};

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-medium tracking-tight text-primary">Create your account</h1>
          <p className="text-sm text-secondary">Sign up to start tracking your watch list.</p>
        </div>
        <SignupForm />
        <p className="text-center text-sm text-tertiary">
          Already have an account?{" "}
          <a href="/login" className="text-primary hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
