import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { useSession } from '@/app/providers/session-context';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Card, Checkbox, ConfirmDialog, Field, Input, Select, useToast } from '@/components/ui';
import { COURSES } from '@/domain/constants';
import { validateDisplayName } from '@/domain/validation';
import { useAction } from '@/hooks/useAction';
import { paths } from '@/lib/routes';
import { services } from '@/services';
import type { Course } from '@/types/domain';

export default function SettingsPage() {
  const { user, signOut } = useSession();
  const toast = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.displayName ?? '');
  const [course, setCourse] = useState<Course | ''>(user?.course ?? '');
  const [show, setShow] = useState(user?.showOnHonourBoard ?? true);
  const [nameError, setNameError] = useState<string>();
  const [confirmReset, setConfirmReset] = useState(false);
  const save = useAction(services.auth.updateProfile, { errorTitle: 'Settings not saved', onSuccess: () => toast.success('Settings saved') });

  function submit(e: FormEvent) {
    e.preventDefault();
    const err = validateDisplayName(name);
    setNameError(err);
    if (!err) void save.run({ displayName: name, course: course || null, showOnHonourBoard: show });
  }

  return (
    <div className="max-w-2xl">
      <PageHeader compact title="Settings" description="Your public name, privacy and prototype data." />
      <form onSubmit={submit} noValidate className="space-y-6">
        <Card className="space-y-5">
          <h2 className="font-medium text-white">Public profile</h2>
          <Field label="Display name" required hint="Shown on posts, listings and the Honour Board. Use 3–30 letters, numbers, spaces, dots, dashes or underscores." error={nameError ?? save.fieldErrors.displayName}>
            {(p) => <Input {...p} value={name} onChange={(e) => setName(e.target.value)} autoComplete="nickname" />}
          </Field>
          <Field label="Course (optional)">
            {(p) => (
              <Select {...p} value={course} onChange={(e) => setCourse(e.target.value as Course | '')} className="max-w-48">
                <option value="">Prefer not to say</option>
                {COURSES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            )}
          </Field>
        </Card>
        <Card className="space-y-4">
          <h2 className="font-medium text-white">Privacy</h2>
          <Checkbox
            label="Show me on the Honour Board"
            description="Only your display name and donation count are shown. Turning this off hides you from the rankings."
            checked={show}
            onChange={(e) => setShow(e.target.checked)}
          />
          <p className="text-sm text-muted">Your phone number is never shown publicly. Kesh Squad doesn’t ask for it.</p>
        </Card>
        <div className="flex justify-end">
          <Button type="submit" loading={save.pending}>
            Save settings
          </Button>
        </div>
      </form>

      <Card className="mt-10 space-y-3 border-gold/25">
        <h2 className="font-medium text-white">Prototype data</h2>
        <p className="text-sm text-mist">
          Everything you create in this prototype — posts, listings, requests and messages — is stored only in this browser. Reset to bring back the original sample data.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="danger" size="sm" onClick={() => setConfirmReset(true)}>
            Reset prototype data
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leadingIcon="logout"
            onClick={async () => {
              await signOut();
              toast.info('Logged out');
              navigate(paths.home);
            }}
          >
            Log out
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset prototype data?"
        description="Your demo posts, listings, requests and messages in this browser will be deleted and the sample data restored. Demo profiles you created will be removed."
        confirmLabel="Reset data"
        tone="danger"
        onConfirm={() => {
          services.prototype.reset();
          setConfirmReset(false);
          toast.success('Prototype data reset');
          navigate(paths.home);
        }}
      />
    </div>
  );
}
