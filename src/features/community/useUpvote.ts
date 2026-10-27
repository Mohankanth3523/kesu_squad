import { useState } from 'react';
import { useSession } from '@/app/providers/session-context';
import { useToast } from '@/components/ui';
import { services } from '@/services';
import { toUserMessage } from '@/types/service';

/** Optimistic upvote toggle. Members only; guests and visitors are asked to log in. */
export function useUpvote(target: 'post' | 'comment', id: string, initial: { score: number; voted: boolean }, authorId: string) {
  const { user } = useSession();
  const toast = useToast();
  const [state, setState] = useState(initial);
  const [pending, setPending] = useState(false);
  // Keep in sync when fresh data arrives from the service.
  const [seen, setSeen] = useState(initial);
  if (seen.score !== initial.score || seen.voted !== initial.voted) {
    setSeen(initial);
    if (!pending) setState(initial);
  }

  const isOwn = user?.id === authorId;
  async function toggle() {
    if (!user || user.isGuest) {
      toast.info('Log in to upvote', 'Upvotes need a Kesh Squad account, so each person counts once.');
      return;
    }
    if (isOwn) return;
    const optimistic = { score: state.score + (state.voted ? -1 : 1), voted: !state.voted };
    const previous = state;
    setState(optimistic);
    setPending(true);
    try {
      const result = await services.community.toggleUpvote(target, id);
      setState({ score: result.score, voted: result.viewerHasUpvoted });
    } catch (error) {
      setState(previous);
      toast.error('Upvote didn’t save', toUserMessage(error));
    } finally {
      setPending(false);
    }
  }
  return { ...state, toggle, pending, isOwn };
}
