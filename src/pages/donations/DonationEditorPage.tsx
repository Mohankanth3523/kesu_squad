import { Link, useNavigate } from 'react-router';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, Icon, useToast } from '@/components/ui';
import { BookForm } from '@/features/books/BookForm';
import { paths } from '@/lib/routes';
import { services } from '@/services';
import { ServiceError, toUserMessage } from '@/types/service';

export default function DonationEditorPage() {
  const navigate = useNavigate();
  const toast = useToast();
  return (
    <Container className="pb-16">
      <PageHeader title="Donate a book" description="Give a textbook a second life. Donations are always free — there’s no price to set." />
      <div className="grid gap-10 lg:grid-cols-[1fr_18rem]">
        <BookForm
          mode="donation"
          submitLabel="Publish donation"
          onCancel={() => navigate(-1)}
          onSubmit={async (input) => {
            try {
              const created = await services.donations.create(input);
              toast.success('Donation published', 'Students can now request it. (Prototype: saved in this browser.)');
              navigate(paths.donation(created.id));
            } catch (error) {
              if (error instanceof ServiceError && error.fieldErrors) return error.fieldErrors;
              toast.error('Donation not published', toUserMessage(error));
            }
          }}
        />
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card tone="gold">
            <h2 className="inline-flex items-center gap-2 font-medium text-white">
              <Icon name="honour" size="sm" className="text-gold" />
              The Honour Board
            </h2>
            <p className="mt-2 text-sm text-mist">Every completed book donation earns one point. Cancelled or unfinished donations don’t count.</p>
            <Link to={paths.honourBoard} className="mt-3 inline-block text-sm text-gold hover:text-champagne hover:underline">
              See the rankings
            </Link>
          </Card>
          <Card>
            <h2 className="font-medium text-white">How it works</h2>
            <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-sm text-mist">
              <li>Students send you requests.</li>
              <li>You choose one and agree the courier charge.</li>
              <li>Mark it sent; they confirm it arrived.</li>
            </ol>
          </Card>
        </aside>
      </div>
    </Container>
  );
}
