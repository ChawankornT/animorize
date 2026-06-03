"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import type { Provider } from "@/domain/entities/Provider";
import { assignProviderAction, type AssignProviderState } from "@/app/actions/mediaProvider";

interface Props {
  providers: Provider[];
  mediaId: string;
}

export function AssignProviderForm({ providers, mediaId }: Props) {
  const [state, action, pending] = useActionState<AssignProviderState, FormData>(
    assignProviderAction,
    {},
  );

  return (
    <form action={action} className="space-y-3 pt-3 border-t-[0.5px] border-default">
      <p className="text-sm font-medium text-primary">Add provider</p>

      <input type="hidden" name="mediaId" value={mediaId} />

      {state.message && (
        <p className={`text-sm ${state.success ? "text-success" : "text-error"}`}>
          {state.message}
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Select label="Provider" name="providerId" required error={state.errors?.providerId?.[0]}>
          <option value="">Select provider…</option>
          {providers.map(p => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>

        <Select label="Audio" name="audio" defaultValue="sub" error={state.errors?.audio?.[0]}>
          <option value="sub">Sub</option>
          <option value="dub">Dub</option>
        </Select>

        <Input
          label="Base URL"
          type="url"
          name="baseUrl"
          placeholder="https://…"
          hint="Optional"
          error={state.errors?.baseUrl?.[0]}
        />
      </div>

      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Assigning…" : "Assign provider"}
      </Button>
    </form>
  );
}
