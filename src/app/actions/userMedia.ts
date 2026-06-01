'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createUserMediaRepository } from '@/repositories';
import { setFavorite } from '@/domain/usecases/SetFavorite';
import { removeFromLibrary } from '@/domain/usecases/RemoveFromLibrary';

export type UserMediaActionResult = {
  success: boolean;
  message: string;
};

export async function toggleFavoriteAction(
  userMediaId: string,
  next: boolean,
): Promise<UserMediaActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'Unauthorized' };

  try {
    const repo = createUserMediaRepository(supabase);
    await setFavorite(repo, userMediaId, next);
    revalidatePath('/dashboard');
    return { success: true, message: next ? 'Added to favorites' : 'Removed from favorites' };
  } catch (error) {
    console.error('[toggleFavoriteAction]', error);
    return { success: false, message: 'Failed to update favorite' };
  }
}

export async function removeFromLibraryAction(
  userMediaId: string,
): Promise<UserMediaActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'Unauthorized' };

  try {
    const repo = createUserMediaRepository(supabase);
    await removeFromLibrary(repo, userMediaId);
    revalidatePath('/dashboard');
    return { success: true, message: 'Removed from library' };
  } catch (error) {
    console.error('[removeFromLibraryAction]', error);
    return { success: false, message: 'Failed to remove from library' };
  }
}
