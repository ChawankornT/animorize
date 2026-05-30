import { describe, it, expect, vi } from 'vitest';
import { addToLibrary } from '@/domain/usecases/AddToLibrary';
import { createMockUserMediaRepository, makeUserMedia } from '@/__tests__/utils/mockRepositories';

describe('addToLibrary', () => {
  it('adds media when not already in library', async () => {
    const repo = createMockUserMediaRepository();
    const input = { userId: 'user-1', mediaId: 'media-1' };

    const result = await addToLibrary(repo, input);

    expect(repo.findByUserAndMedia).toHaveBeenCalledWith('user-1', 'media-1');
    expect(repo.add).toHaveBeenCalledWith(input);
    expect(result.mediaId).toBe('media-1');
  });

  it('throws when media is already in library', async () => {
    const repo = createMockUserMediaRepository();
    repo.findByUserAndMedia = vi.fn().mockResolvedValue(makeUserMedia());

    await expect(
      addToLibrary(repo, { userId: 'user-1', mediaId: 'media-1' }),
    ).rejects.toThrow('already in your library');

    expect(repo.add).not.toHaveBeenCalled();
  });

  it('passes through optional fields (providerId, audio, status, customUrl)', async () => {
    const repo = createMockUserMediaRepository();
    const input = {
      userId: 'user-1',
      mediaId: 'media-2',
      providerId: 'prov-1',
      audio: 'dub' as const,
      status: 'watching' as const,
      customUrl: 'https://custom.url',
    };

    await addToLibrary(repo, input);

    expect(repo.add).toHaveBeenCalledWith(input);
  });
});
