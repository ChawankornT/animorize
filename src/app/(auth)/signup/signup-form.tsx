"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { signupAction, type AuthResult } from "../actions";

export function SignupForm() {
  const [state, formAction, pending] = useActionState<AuthResult, FormData>(signupAction, {});

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <p className="text-sm text-error" role="alert">
          {state.error}
        </p>
      )}
      <Input
        label="Email"
        name="email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        required
      />
      <Input
        label="Password"
        name="password"
        type="password"
        placeholder="At least 6 characters"
        autoComplete="new-password"
        minLength={6}
        required
      />
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creating account..." : "Sign up"}
      </Button>
    </form>
  );
}
