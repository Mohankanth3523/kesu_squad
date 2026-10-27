import { Link, useNavigate } from 'react-router';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, Icon, useToast } from '@/components/ui';
import { BookForm } from '@/features/books/BookForm';
import { paths } from '@/lib/routes';
import { services } from '@/services';
import { ServiceError, toUserMessage } from '@/types/service';

export default function SellPage() {
  const navigate = useNavigate();
  const toast = useToast();
  return (
    <Container className="pb-16">
      <PageHeader title="Sell a book" description="List a used textbook for another student. We show the highest price allowed for its edition as you type." />
      <div className="grid gap-10 lg:grid-cols-[1fr_18rem]">
        <BookForm
          mode="sale"
          submitLabel="Publish listing"
          onCancel={() => navigate(-1)}
          onSubmit={async (input) => {
            try {
              const created = await services.books.create(input);
              toast.success('Listing published', 'Buyers can find it on the Books page. (Prototype: saved in this browser.)');
              navigate(paths.book(created.id));
            } catch (error) {
              if (error instanceof ServiceError && error.fieldErrors) return error.fieldErrors;
              toast.error('Listing not published', toUserMessage(error));
            }
          }}
        />
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card tone="gold">
            <h2 className="inline-flex items-center gap-2 font-medium text-white">
              <Icon name="rupee" size="sm" className="text-gold" />
              Fair-price limits
            </h2>
            <p className="mt-2 text-sm text-mist">Current editions: up to 75% of the printed price. Older editions are capped lower the older they get.</p>
            <Link to={paths.rules} className="mt-3 inline-block text-sm text-gold hover:text-champagne hover:underline">
              See the full table
            </Link>
          </Card>
          <Card>
            <h2 className="font-medium text-white">Good listings</h2>
            <ul className="mt-2 space-y-1.5 text-sm text-mist">
              <li>Photograph the cover, spine and any damage.</li>
              <li>Mention highlighting and notes honestly.</li>
              <li>Reply to buyers from your inbox. Your phone number stays private.</li>
            </ul>
          </Card>
        </aside>
      </div>
    </Container>
  );
}
