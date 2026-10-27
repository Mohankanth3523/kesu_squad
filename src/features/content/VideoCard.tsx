import { Link } from 'react-router';
import { Badge } from '@/components/ui';
import { relativeTime } from '@/lib/format';
import { paths } from '@/lib/routes';
import type { Video } from '@/types/domain';
import { PLATFORM_LABEL } from '@/types/labels';
import { VideoThumb } from './VideoThumb';

export function VideoCard({ video, size = 'md' }: { video: Video; size?: 'md' | 'lg' }) {
  const vertical = video.platform !== 'youtube_video';
  return (
    <Link to={paths.video(video.id)} className="group block focus-visible:outline-offset-4">
      <VideoThumb hue={video.hue} duration={video.durationSeconds} vertical={vertical} />
      <div className="mt-3 flex items-start justify-between gap-3">
        <h3
          className={
            size === 'lg'
              ? 'font-display text-2xl leading-snug text-white group-hover:text-champagne'
              : 'text-[0.9375rem] leading-snug font-medium text-white group-hover:text-champagne'
          }
        >
          {video.title}
        </h3>
        {vertical && <Badge tone="gold">{PLATFORM_LABEL[video.platform]}</Badge>}
      </div>
      <p className="mt-1 text-sm text-muted">{relativeTime(video.publishedAt)}</p>
    </Link>
  );
}
