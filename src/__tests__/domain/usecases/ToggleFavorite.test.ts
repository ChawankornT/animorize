import { describe, it, expect } from 'vitest';
import { toggleFavorite } from '@/domain/usecases/ToggleFavorite';
import { createMockUserMediaRepository } from '@/__tests__/utils/mockRepositories';

describe('toggleFavorite', () => {
  it('flips false → true', async () => {
    const repo = createMockUserMediaRepository();

    await toggleFavorite(repo, 'um-1', false);

    expect(repo.updateFavorite).toHaveBeenCalledWith('um-1', true);
  });

  it('flips true → false', async () => {
    const repo = createMockUserMediaRepository();

    await toggleFavorite(repo, 'um-1', true);

    expect(repo.updateFavorite).toHaveBeenCalledWith('um-1', false);
  });

  it('returns updated UserMedia from repository', async () => {
    const repo = createMockUserMediaRepository();

    const result = await toggleFavorite(repo, 'um-1', false);

    expect(result.isFavorite).toBe(true);
  });
});
