import { motion } from 'framer-motion';
import { Icon } from '@/components/ui';
import { cn } from '@/lib/cn';
import { compactNumber } from '@/lib/format';
import { useUpvote } from './useUpvote';

export function UpvoteButton({
  target,
  id,
  score,
  voted,
  authorId,
  layout = 'vertical',
}: {
  target: 'post' | 'comment';
  id: string;
  score: number;
  voted: boolean;
  authorId: string;
  layout?: 'vertical' | 'inline';
}) {
  const v = useUpvote(target, id, { score, voted }, authorId);
  const label = v.isOwn ? `${v.score} upvotes on your ${target}` : v.voted ? `Remove upvote (${v.score} upvotes)` : `Upvote (${v.score} upvotes)`;
  return (
    <button
      type="button"
      onClick={v.toggle}
      aria-pressed={v.voted}
      aria-busy={v.pending || undefined}
      aria-label={label}
      title={v.isOwn ? 'You can’t upvote your own ' + target : undefined}
      disabled={v.isOwn}
      className={cn(
        'relative z-10 inline-flex items-center rounded-full transition-colors disabled:cursor-default',
        layout === 'vertical' ? 'w-12 flex-col gap-0.5 py-1.5' : 'h-8 gap-1 px-2.5',
        v.voted ? 'text-champagne' : 'text-mist enabled:hover:bg-white/5 enabled:hover:text-white',
      )}
    >
      <motion.span key={v.voted ? 'on' : 'off'} initial={{ scale: v.voted ? 0.6 : 1 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }}>
        <Icon name="upvote" className={cn(v.voted && 'fill-gold text-gold')} />
      </motion.span>
      <span className={cn('text-sm font-semibold tabular-nums', layout === 'vertical' ? 'text-white' : '')}>{compactNumber(v.score)}</span>
    </button>
  );
}
