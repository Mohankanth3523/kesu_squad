import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useSession } from '@/app/providers/session-context';
import { Button, Field, Input, useToast } from '@/components/ui';
import { validateEmail } from '@/domain/validation';
import { paths } from '@/lib/routes';
import { AuthShell, safeNext } from './AuthShell';

export default function LoginPage() {
  const { signInAsDemo, continueAsGuest } = useSession();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'), paths.home);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState<string | null>(null);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors = { email: validateEmail(email), password: password ? undefined : 'Enter your password.' };
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;
    setPassword('');
    toast.info('Email log in isn’t connected yet', 'Real accounts arrive with the backend (Milestone B). Use a demo account below to explore.');
  }

  async function demo(kind: 'member' | 'admin' | 'guest') {
    setPending(kind);
    try {
      if (kind === 'guest') await continueAsGuest();
      else await signInAsDemo(kind);
      toast.success(kind === 'guest' ? 'Browsing as a guest' : kind === 'admin' ? 'Signed in as the demo admin' : 'Signed in as demo_amigo', 'Prototype demo account.');
      navigate(next, { replace: true });
    } finally {
      setPending(null);
    }
  }

  return (
    <AuthShell
      title="Log in"
      description="Log in to sell or donate books, join discussions and manage your dashboard."
      footer={
        <>
          New here?{' '}
          <Link to={`${paths.signup}${params.get('next') ? `?next=${encodeURIComponent(next)}` : ''}`} className="text-gold hover:text-champagne hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <section aria-labelledby="demo-heading">
        <h2 id="demo-heading" className="text-sm font-medium text-white">
          Explore with a demo account
        </h2>
        <div className="mt-3 grid gap-3">
          <Button leadingIcon="user" loading={pending === 'member'} onClick={() => void demo('member')}>
            Continue as demo_amigo
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" leadingIcon="shield" loading={pending === 'admin'} onClick={() => void demo('admin')}>
              Demo admin
            </Button>
            <Button variant="secondary" loading={pending === 'guest'} onClick={() => void demo('guest')}>
              Guest
            </Button>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted">demo_amigo has sample listings, donations, requests and conversations.</p>
      </section>

      <div className="my-8 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line" />
        Email log in (coming with the backend)
        <span className="h-px flex-1 bg-line" />
      </div>

      <form noValidate onSubmit={onSubmit} className="space-y-5">
        <Field label="Email" error={errors.email}>
          {(p) => <Input {...p} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />}
        </Field>
        <Field label="Password" error={errors.password}>
          {(p) => (
            <div className="relative">
              <Input {...p} type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="pr-16" />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute inset-y-0 right-3 my-auto h-8 rounded px-1.5 text-xs text-mist hover:text-white" aria-pressed={showPassword}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          )}
        </Field>
        <div className="flex items-center justify-between">
          <Link to={paths.forgotPassword} className="text-sm text-gold hover:text-champagne hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" variant="secondary" className="w-full">
          Log in with email
        </Button>
      </form>
    </AuthShell>
  );
}
