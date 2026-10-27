import { Link } from 'react-router';
import { paths } from '@/lib/routes';
import { Container } from './Container';
import { Wordmark } from './Wordmark';

const COLUMNS = [
  {
    title: 'Explore',
    links: [
      { to: paths.videos, label: 'Videos & Shorts' },
      { to: paths.community, label: 'Community' },
      { to: paths.ama, label: 'Ask Me Anything' },
      { to: paths.honourBoard, label: 'Honour Board' },
    ],
  },
  {
    title: 'Books',
    links: [
      { to: paths.books, label: 'Buy second-hand books' },
      { to: paths.sell, label: 'Sell a book' },
      { to: paths.donate, label: 'Donated books' },
      { to: paths.newDonation, label: 'Donate a book' },
    ],
  },
  {
    title: 'Kesh Squad',
    links: [
      { to: paths.about, label: 'About' },
      { to: paths.rules, label: 'Marketplace & donation rules' },
      { to: paths.guidelines, label: 'Community guidelines' },
      { to: paths.terms, label: 'Terms of use' },
      { to: paths.privacy, label: 'Privacy policy' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-ink-raised pb-24 lg:pb-0">
      <Container size="wide" className="grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Wordmark className="text-xl" />
          <p className="mt-4 font-display text-lg text-champagne">Watch. Talk. Connect.</p>
          <p className="mt-2 text-sm text-mist">A community for MBBS and BDS students — and anyone who wants to hang out with the squad.</p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h2 className="text-sm font-semibold text-white">{col.title}</h2>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-mist transition-colors hover:text-champagne">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      <div className="border-t border-line">
        <Container size="wide" className="flex flex-col gap-2 py-6 text-xs text-muted sm:flex-row sm:justify-between">
          <p>Kesh Squad doesn’t process payments. Buyers and sellers arrange payment and delivery between themselves.</p>
          <p>© {new Date().getFullYear()} Kesh Squad</p>
        </Container>
      </div>
    </footer>
  );
}
