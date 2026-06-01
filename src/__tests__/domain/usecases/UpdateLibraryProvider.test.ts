import { describe, it, expect } from 'vitest';
import { updateLibraryProvider } from '@/domain/usecases/UpdateLibraryProvider';
import { createMockUserMediaRepository } from '@/__tests__/utils/mockRepositories';

describe('updateLibraryProvider', () => {
  it('delegates to repository.updateProvider with correct args', async () => {
    const repo = createMockUserMediaRepository();
    const input = { providerId: 'prov-1', audio: 'dub' as const, customUrl: 'https://example.com' };

    await updateLibraryProvider(repo, 'um-1', input);

    expect(repo.updateProvider).toHaveBeenCalledWith('um-1', input);
  });

  it('passes null providerId and customUrl', async () => {
    const repo = createMockUserMediaRepository();
    const input = { providerId: null, audio: 'sub' as const, customUrl: null };

    await updateLibraryProvider(repo, 'um-1', input);

    expect(repo.updateProvider).toHaveBeenCalledWith('um-1', input);
  });

  it('returns UserMedia from repository', async () => {
    const repo = createMockUserMediaRepository();
    const input = { providerId: 'prov-1', audio: 'sub' as const, customUrl: null };

    const result = await updateLibraryProvider(repo, 'um-1', input);

    expect(result).toBeDefined();
    expect(result.id).toBe('um-1');
  });
});
