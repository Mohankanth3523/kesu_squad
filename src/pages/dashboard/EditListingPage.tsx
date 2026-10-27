import { useNavigate, useParams } from 'react-router';
import { useSession } from '@/app/providers/session-context';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState, ButtonLink, useToast } from '@/components/ui';
import { Loadable } from '@/components/shared/Loadable';
import { DetailSkeleton } from '@/components/shared/Skeletons';
import { BookForm } from '@/features/books/BookForm';
import { useAsync } from '@/hooks/useAsync';
import { paths } from '@/lib/routes';
import { services } from '@/services';
import { ServiceError, toUserMessage } from '@/types/service';

export default function EditListingPage() {
  const { listingId = '' } = useParams();
  const { user } = useSession();
  const navigate = useNavigate();
  const toast = useToast();
  const listing = useAsync(() => services.books.get(listingId), [listingId], { live: false });

  return (
    <div>
      <PageHeader title="Edit listing" description="Update details, photos or price. The fair-price limit still applies." compact />
      <Loadable
        query={listing}
        skeleton={<DetailSkeleton />}
        notFound={{ title: 'Listing not found', description: 'It may have been removed.', backTo: paths.dashboardListings, backLabel: 'My listings' }}
      >
        {(book) =>
          book.owner.id !== user?.id ? (
            <EmptyState icon="lock" title="You can only edit your own listings" action={<ButtonLink to={paths.book(book.id)} size="sm">View listing</ButtonLink>} />
          ) : book.status === 'sold' ? (
            <EmptyState icon="books" title="Sold listings can’t be edited" action={<ButtonLink to={paths.dashboardListings} size="sm">My listings</ButtonLink>} />
          ) : (
            <BookForm
              mode="sale"
              existing={book}
              submitLabel="Save changes"
              onCancel={() => navigate(paths.dashboardListings)}
              onSubmit={async (input) => {
                try {
                  await services.books.update(book.id, input);
                  toast.success('Changes saved');
                  navigate(paths.dashboardListings);
                } catch (error) {
                  if (error instanceof ServiceError && error.fieldErrors) return error.fieldErrors;
                  toast.error('Changes not saved', toUserMessage(error));
                }
              }}
            />
          )
        }
      </Loadable>
    </div>
  );
}
