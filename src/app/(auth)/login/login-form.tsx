'use client';

import { useActionState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { loginAction, type AuthResult } from '../actions';

export function LoginForm() {
  const [state, formAction, pending] = useActionState<AuthResult, FormData>(
    loginAction,
    {},
  );

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
        placeholder="Enter your password"
        autoComplete="current-password"
        required
      />
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Logging in...' : 'Log in'}
      </Button>
    </form>
  );
}
