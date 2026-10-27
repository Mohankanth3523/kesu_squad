import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { Container } from '@/components/layout/Container';
import { Badge, ButtonLink, Card, Icon } from '@/components/ui';
import { Loadable } from '@/components/shared/Loadable';
import { DetailSkeleton } from '@/components/shared/Skeletons';
import { VideoCard } from '@/features/content/VideoCard';
import { VideoThumb } from '@/features/content/VideoThumb';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { relativeTime } from '@/lib/format';
import { paths } from '@/lib/routes';
import { services } from '@/services';
import type { Video } from '@/types/domain';
import { PLATFORM_LABEL } from '@/types/labels';

export default function VideoDetailPage() {
  const { videoId = '' } = useParams();
  const video = useAsync(() => services.content.getVideo(videoId), [videoId]);
  useDocumentTitle(video.status === 'success' ? video.data.title : 'Video');
  return (
    <Container size="wide" className="pb-16">
      <div className="pt-6">
        <ButtonLink to={paths.videos} variant="ghost" size="sm" leadingIcon="back">
          All videos
        </ButtonLink>
      </div>
      <Loadable query={video} skeleton={<DetailSkeleton />} notFound={{ title: 'Video not found', description: 'It may have been removed.', backTo: paths.videos, backLabel: 'All videos' }}>
        {(v) => <VideoView video={v} />}
      </Loadable>
    </Container>
  );
}

function VideoView({ video }: { video: Video }) {
  const [playing, setPlaying] = useState(false);
  const vertical = video.platform !== 'youtube_video';
  const discussion = useAsync(() => (video.discussionPostId ? services.community.getPost(video.discussionPostId) : Promise.resolve(null)), [video.discussionPostId]);
  const more = useAsync(() => services.content.listVideos({ limit: 8 }), []);
  const others = more.status === 'success' ? more.data.filter((v) => v.id !== video.id).slice(0, 4) : [];

  return (
    <div className="grid gap-10 py-6 lg:grid-cols-[1fr_20rem]">
      <div className="min-w-0">
        <div className={vertical ? 'mx-auto max-w-sm' : ''}>
          {playing ? (
            <div className={`grid place-items-center rounded-[var(--radius-surface)] border border-line bg-ink-raised p-8 text-center ${vertical ? 'aspect-[9/16]' : 'aspect-video'}`}>
              <div className="max-w-sm">
                <Icon name="videos" size="xl" className="mx-auto text-gold" />
                <p className="mt-3 text-white">The player loads here.</p>
                <p className="mt-1 text-sm text-mist">Prototype: real {PLATFORM_LABEL[video.platform]} embeds connect once the video source is decided (OQ-11). Embeds will load only when you press play, to keep pages fast.</p>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setPlaying(true)} className="group block w-full text-left" aria-label={`Play ${video.title}`}>
              <VideoThumb hue={video.hue} duration={video.durationSeconds} vertical={vertical} />
            </button>
          )}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Badge tone="gold">{PLATFORM_LABEL[video.platform]}</Badge>
          <span className="text-sm text-muted">{relativeTime(video.publishedAt)}</span>
        </div>
        <h1 className="mt-3 font-display text-[clamp(1.875rem,4vw,2.5rem)] leading-tight text-white">{video.title}</h1>
        {video.description && <p className="mt-3 max-w-[68ch] text-lg leading-relaxed text-mist">{video.description}</p>}

        <Card tone="gold" className="mt-8">
          <h2 className="inline-flex items-center gap-2 font-medium text-white">
            <Icon name="community" size="sm" className="text-gold" />
            Talk about this video
          </h2>
          {discussion.status === 'success' && discussion.data ? (
            <>
              <Link to={paths.post(discussion.data.id)} className="mt-2 block text-lg text-white hover:text-champagne">
                {discussion.data.title}
              </Link>
              <p className="mt-1 text-sm text-muted">
                {discussion.data.commentCount} comments · {discussion.data.score} upvotes
              </p>
              <ButtonLink to={paths.post(discussion.data.id)} size="sm" className="mt-4">
                Join the discussion
              </ButtonLink>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-mist">No discussion yet. Start one and tag it to this video.</p>
              <ButtonLink to={`${paths.newPost}?video=${video.id}`} size="sm" className="mt-4">
                Start a discussion
              </ButtonLink>
            </>
          )}
        </Card>
      </div>
      <aside aria-label="More videos">
        <h2 className="mb-4 font-medium text-white">More to watch</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
          {others.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      </aside>
    </div>
  );
}
