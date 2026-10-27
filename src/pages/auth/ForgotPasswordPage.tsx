import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { Button, Field, Icon, Input } from '@/components/ui';
import { validateEmail } from '@/domain/validation';
import { paths } from '@/lib/routes';
import { AuthShell } from './AuthShell';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const [done, setDone] = useState(false);
  function submit(e: FormEvent) {
    e.preventDefault();
    const err = validateEmail(email);
    setError(err);
    if (!err) {
      setDone(true);
      setEmail('');
    }
  }
  return (
    <AuthShell title="Reset your password" description="Enter your email and we’ll send you a link to choose a new password.">
      {done ? (
        <div role="status" className="space-y-3">
          <p className="inline-flex items-center gap-2 text-success">
            <Icon name="success" size="sm" />
            Check your inbox
          </p>
          <p className="text-sm text-mist">If an account uses that email, a reset link is on its way. (Prototype: no email was sent.)</p>
          <Link to={paths.login} className="inline-block text-sm text-gold hover:underline">
            Back to log in
          </Link>
        </div>
      ) : (
        <form noValidate onSubmit={submit} className="space-y-5">
          <Field label="Email" error={error}>
            {(p) => <Input {...p} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />}
          </Field>
          <Button type="submit" className="w-full">
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
