import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { ButtonLink, Card, Icon, type IconName } from '@/components/ui';
import { paths } from '@/lib/routes';

const PILLARS: Array<{ icon: IconName; title: string; body: string; to: string; cta: string }> = [
  { icon: 'videos', title: 'Watch', body: 'YouTube videos, Shorts and Instagram Reels from Kesh Squad.', to: paths.videos, cta: 'Watch videos' },
  { icon: 'community', title: 'Talk', body: 'Discussions about college life, experiences, videos and anything else — plus Ask Me Anything.', to: paths.community, cta: 'Join the community' },
  { icon: 'books', title: 'Connect', body: 'Buy second-hand MBBS and BDS books at fair prices, or give yours away to someone who needs them.', to: paths.books, cta: 'Browse books' },
];

export default function AboutPage() {
  return (
    <Container className="pb-16">
      <PageHeader title="About Kesh Squad" description="A community, not just a website." />
      <div className="max-w-[68ch] space-y-4 text-lg leading-relaxed text-mist">
        <p>
          Kesh Squad is a community built around content, conversations and connections — primarily for MBBS and BDS students. It isn’t a formal education platform. It’s
          a place to hang out, share opinions, ask questions and help each other.
        </p>
        <p>People come back for the content, stay for the conversations, and use the marketplace when they need it.</p>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {PILLARS.map((p) => (
          <Card key={p.title} tone="gold" className="flex flex-col">
            <Icon name={p.icon} size="lg" className="text-gold" />
            <h2 className="mt-4 font-display text-3xl text-white">{p.title}.</h2>
            <p className="mt-2 flex-1 text-mist">{p.body}</p>
            <ButtonLink to={p.to} variant="secondary" size="sm" className="mt-6 self-start">
              {p.cta}
            </ButtonLink>
          </Card>
        ))}
      </div>
      <Card className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl text-white">Giving knowledge a second life</h2>
          <p className="mt-1 text-mist">Donate textbooks for free. Donors are recognised on the Honour Board.</p>
        </div>
        <ButtonLink to={paths.honourBoard} leadingIcon="honour">
          See the Honour Board
        </ButtonLink>
      </Card>
    </Container>
  );
}
