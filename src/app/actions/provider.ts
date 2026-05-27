'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { z } from 'zod/v4';
import { createClient } from '@/lib/supabase/server';
import { createProviderRepository } from '@/repositories';
import { createProvider } from '@/domain/usecases/CreateProvider';
import { updateProvider } from '@/domain/usecases/UpdateProvider';
import { deleteProvider } from '@/domain/usecases/DeleteProvider';

export type ProviderActionState = {
  message?: string;
  errors?: {
    name?: string[];
    slug?: string[];
    color?: string[];
    logoUrl?: string[];
    baseUrl?: string[];
  };
};

export type DeleteActionState = {
  error?: string;
};

const providerFields = {
  name: z.string().min(1, 'Name is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, hyphens only'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color (e.g. #FF5733)'),
  logoUrl: z
    .string()
    .refine((v) => v === '' || isValidUrl(v), 'Must be a valid URL'),
  baseUrl: z
    .string()
    .refine((v) => v === '' || isValidUrl(v), 'Must be a valid URL'),
};

const createProviderSchema = z.object(providerFields);
const updateProviderSchema = z.object({ ...providerFields, id: z.string().min(1) });

function isValidUrl(v: string): boolean {
  try {
    new URL(v);
    return true;
  } catch {
    return false;
  }
}

function parseFieldErrors(error: z.ZodError): ProviderActionState['errors'] {
  const errors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? '_root');
    if (!errors[key]) errors[key] = [];
    errors[key].push(issue.message);
  }
  return errors as ProviderActionState['errors'];
}

export async function createProviderAction(
  _prev: ProviderActionState,
  formData: FormData,
): Promise<ProviderActionState> {
  const parsed = createProviderSchema.safeParse({
    name: formData.get('name') ?? '',
    slug: formData.get('slug') ?? '',
    color: formData.get('color') ?? '',
    logoUrl: formData.get('logoUrl') ?? '',
    baseUrl: formData.get('baseUrl') ?? '',
  });

  if (!parsed.success) {
    return { errors: parseFieldErrors(parsed.error) };
  }

  try {
    const supabase = await createClient();
    const repo = createProviderRepository(supabase);
    await createProvider(repo, {
      name: parsed.data.name,
      slug: parsed.data.slug,
      color: parsed.data.color,
      logoUrl: parsed.data.logoUrl || null,
      baseUrl: parsed.data.baseUrl || null,
    });
    revalidatePath('/admin/providers');
    redirect('/admin/providers');
  } catch (err) {
    if (isRedirectError(err)) throw err;
    const msg = err instanceof Error ? err.message : 'Failed to create provider';
    return { message: msg };
  }
}

export async function updateProviderAction(
  _prev: ProviderActionState,
  formData: FormData,
): Promise<ProviderActionState> {
  const parsed = updateProviderSchema.safeParse({
    id: formData.get('id') ?? '',
    name: formData.get('name') ?? '',
    slug: formData.get('slug') ?? '',
    color: formData.get('color') ?? '',
    logoUrl: formData.get('logoUrl') ?? '',
    baseUrl: formData.get('baseUrl') ?? '',
  });

  if (!parsed.success) {
    return { errors: parseFieldErrors(parsed.error) };
  }

  try {
    const supabase = await createClient();
    const repo = createProviderRepository(supabase);
    await updateProvider(repo, parsed.data.id, {
      name: parsed.data.name,
      slug: parsed.data.slug,
      color: parsed.data.color,
      logoUrl: parsed.data.logoUrl || null,
      baseUrl: parsed.data.baseUrl || null,
    });
    revalidatePath('/admin/providers');
    redirect('/admin/providers');
  } catch (err) {
    if (isRedirectError(err)) throw err;
    const msg = err instanceof Error ? err.message : 'Failed to update provider';
    return { message: msg };
  }
}

// Required second param: Next.js server action bind() pattern — FormData is passed but not needed
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function deleteProviderAction(id: string, _: FormData): Promise<DeleteActionState> {
  try {
    const supabase = await createClient();
    const repo = createProviderRepository(supabase);
    await deleteProvider(repo, id);
    revalidatePath('/admin/providers');
    redirect('/admin/providers');
  } catch (err) {
    if (isRedirectError(err)) throw err;
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('foreign key') || msg.includes('violates')) {
      return { error: 'Cannot delete: provider is assigned to media entries' };
    }
    return { error: 'Failed to delete provider' };
  }
}
