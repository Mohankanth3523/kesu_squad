import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge, Icon } from '@/components/ui';

const SECTIONS = [
  {
    title: 'Be kind',
    items: ['Disagree with ideas, not people.', 'No harassment, hate, bullying or threats.', 'Remember there’s a student on the other side of the screen.'],
  },
  {
    title: 'Keep it real and useful',
    items: ['No spam, advertising or self-promotion.', 'Don’t post misleading medical claims as fact.', 'Use the right category so people can find your post.'],
  },
  {
    title: 'Protect privacy',
    items: ['Use your display name; don’t share personal details in public posts.', 'Never post someone else’s phone number, address or photos without permission.', 'Keep buying, selling and donation details in private chats.'],
  },
  {
    title: 'Reporting and moderation',
    items: ['Use “Report” on any post, comment, listing or conversation that breaks these rules.', 'The Kesh Squad team reviews reports and may remove content or suspend accounts.', 'Reports are private — the person you report won’t see who reported them.'],
  },
];

export default function GuidelinesPage() {
  return (
    <Container size="narrow" className="pb-16">
      <PageHeader title="Community guidelines" description="How we keep Kesh Squad friendly, useful and safe." above={<Badge tone="info" icon="info">Draft — final wording pending review (OQ-35)</Badge>} />
      <div className="space-y-10">
        {SECTIONS.map((s) => (
          <section key={s.title}>
            <h2 className="font-display text-2xl text-white">{s.title}</h2>
            <ul className="mt-3 space-y-2.5 text-mist">
              {s.items.map((i) => (
                <li key={i} className="flex gap-3">
                  <Icon name="check" size="sm" className="mt-1 text-gold" />
                  {i}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Container>
  );
}
