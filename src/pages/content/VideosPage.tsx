import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState, Segmented } from '@/components/ui';
import { Loadable } from '@/components/shared/Loadable';
import { GridSkeleton } from '@/components/shared/Skeletons';
import { VideoCard } from '@/features/content/VideoCard';
import { useAsync } from '@/hooks/useAsync';
import { useQueryParams } from '@/hooks/useQueryParams';
import { cn } from '@/lib/cn';
import { services } from '@/services';
import type { VideoPlatform } from '@/types/domain';

type Tab = 'all' | VideoPlatform;
const TABS: Array<{ value: Tab; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'youtube_video', label: 'Videos' },
  { value: 'youtube_short', label: 'Shorts' },
  { value: 'instagram_reel', label: 'Reels' },
];

/** Videos, Shorts and Reels (C2 §2). */
export default function VideosPage() {
  const { get, set } = useQueryParams();
  const tab = (get('type') || 'all') as Tab;
  const videos = useAsync(() => services.content.listVideos({ platform: tab === 'all' ? undefined : tab }), [tab]);
  const vertical = tab === 'youtube_short' || tab === 'instagram_reel';

  return (
    <Container size="wide" className="pb-16">
      <PageHeader title="Videos and Shorts" description="The latest YouTube videos, Shorts and Instagram Reels from Kesh Squad — and the conversations around them." />
      <Segmented label="Video type" value={tab} onChange={(v) => set({ type: v === 'all' ? '' : v })} options={TABS} className="mb-8" />
      <Loadable
        query={videos}
        skeleton={<GridSkeleton count={6} aspect={vertical ? 'aspect-[9/16]' : 'aspect-video'} cols={vertical ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5' : 'sm:grid-cols-2 lg:grid-cols-3'} />}
        isEmpty={(d) => d.length === 0}
        empty={<EmptyState icon="videos" title="New videos coming soon" description="Fresh videos, Shorts and Reels will appear here." />}
      >
        {(list) => {
          const long = list.filter((v) => v.platform === 'youtube_video');
          const short = list.filter((v) => v.platform !== 'youtube_video');
          return (
            <div className="space-y-12">
              {long.length > 0 && (
                <section aria-label="Videos" className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                  {long.map((v, i) => (
                    <div key={v.id} className={cn(tab === 'all' && i === 0 && 'sm:col-span-2 lg:col-span-2 lg:row-span-2')}>
                      <VideoCard video={v} size={tab === 'all' && i === 0 ? 'lg' : 'md'} />
                    </div>
                  ))}
                </section>
              )}
              {short.length > 0 && (
                <section aria-label="Shorts and Reels">
                  {tab === 'all' && <h2 className="mb-5 font-display text-[1.75rem] text-white">Shorts and Reels</h2>}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
                    {short.map((v) => (
                      <VideoCard key={v.id} video={v} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          );
        }}
      </Loadable>
      <p className="mt-12 text-xs text-muted">Prototype: these are sample videos. Real YouTube and Instagram links connect once the content source is decided (OQ-11).</p>
    </Container>
  );
}
