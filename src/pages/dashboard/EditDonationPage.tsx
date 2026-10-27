import { useNavigate, useParams } from 'react-router';
import { useSession } from '@/app/providers/session-context';
import { PageHeader } from '@/components/layout/PageHeader';
import { ButtonLink, EmptyState, useToast } from '@/components/ui';
import { Loadable } from '@/components/shared/Loadable';
import { DetailSkeleton } from '@/components/shared/Skeletons';
import { BookForm } from '@/features/books/BookForm';
import { useAsync } from '@/hooks/useAsync';
import { paths } from '@/lib/routes';
import { services } from '@/services';
import { ServiceError, toUserMessage } from '@/types/service';

export default function EditDonationPage() {
  const { listingId = '' } = useParams();
  const { user } = useSession();
  const navigate = useNavigate();
  const toast = useToast();
  const listing = useAsync(() => services.donations.get(listingId), [listingId], { live: false });

  return (
    <div>
      <PageHeader title="Edit donation" description="Update the details. Donations stay free — there’s no price field." compact />
      <Loadable
        query={listing}
        skeleton={<DetailSkeleton />}
        notFound={{ title: 'Donation not found', description: 'It may have been removed.', backTo: paths.dashboardDonations, backLabel: 'My donations' }}
      >
        {(d) =>
          d.owner.id !== user?.id ? (
            <EmptyState icon="lock" title="You can only edit your own donations" action={<ButtonLink to={paths.donation(d.id)} size="sm">View donation</ButtonLink>} />
          ) : d.status === 'donated' ? (
            <EmptyState icon="donate" title="Completed donations can’t be edited" action={<ButtonLink to={paths.dashboardDonations} size="sm">My donations</ButtonLink>} />
          ) : (
            <BookForm
              mode="donation"
              existing={d}
              submitLabel="Save changes"
              onCancel={() => navigate(paths.dashboardDonations)}
              onSubmit={async (input) => {
                try {
                  await services.donations.update(d.id, input);
                  toast.success('Changes saved');
                  navigate(paths.dashboardDonations);
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
