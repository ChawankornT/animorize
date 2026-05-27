export interface Provider {
  id: string;
  name: string;
  slug: string;
  color: string;
  logoUrl: string | null;
  baseUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProviderInput {
  name: string;
  slug: string;
  color: string;
  logoUrl?: string | null;
  baseUrl?: string | null;
}

export interface UpdateProviderInput {
  name?: string;
  slug?: string;
  color?: string;
  logoUrl?: string | null;
  baseUrl?: string | null;
}

export function validateProvider(data: {
  name?: string;
  slug?: string;
  color?: string;
}): void {
  if (data.name !== undefined && data.name.trim() === '') {
    throw new Error('Provider name cannot be empty');
  }
  if (data.slug !== undefined && !/^[a-z0-9-]+$/.test(data.slug)) {
    throw new Error('Provider slug must contain only lowercase letters, numbers, and hyphens');
  }
  if (data.color !== undefined && !/^#[0-9a-fA-F]{6}$/.test(data.color)) {
    throw new Error('Provider color must be a valid hex color (e.g. #FF5733)');
  }
}
