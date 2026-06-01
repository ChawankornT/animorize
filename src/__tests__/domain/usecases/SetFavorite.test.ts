import { describe, it, expect } from 'vitest';
import { setFavorite } from '@/domain/usecases/SetFavorite';
import { createMockUserMediaRepository } from '@/__tests__/utils/mockRepositories';

describe('setFavorite', () => {
  it('sets favorite to true', async () => {
    const repo = createMockUserMediaRepository();

    await setFavorite(repo, 'um-1', true);

    expect(repo.updateFavorite).toHaveBeenCalledWith('um-1', true);
  });

  it('sets favorite to false', async () => {
    const repo = createMockUserMediaRepository();

    await setFavorite(repo, 'um-1', false);

    expect(repo.updateFavorite).toHaveBeenCalledWith('um-1', false);
  });

  it('returns updated UserMedia from repository', async () => {
    const repo = createMockUserMediaRepository();

    const result = await setFavorite(repo, 'um-1', true);

    expect(result.isFavorite).toBe(true);
  });
});
