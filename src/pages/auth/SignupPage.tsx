import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useSession } from '@/app/providers/session-context';
import { Button, Checkbox, Field, Input, Select, useToast } from '@/components/ui';
import { COURSES } from '@/domain/constants';
import { validateDisplayName, validateEmail, validatePassword } from '@/domain/validation';
import { paths } from '@/lib/routes';
import { ServiceError, toUserMessage } from '@/types/service';
import type { Course } from '@/types/domain';
import { AuthShell, safeNext } from './AuthShell';

/**
 * Registration screen. Validates every field like the real form will, but in the prototype it only
 * creates a local demo profile with the display name and course. Email and password are discarded.
 */
export default function SignupPage() {
  const { createDemoProfile } = useSession();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'), paths.dashboard);
  const [form, setForm] = useState({ displayName: '', email: '', password: '', course: '' as Course | '', agree: false });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [pending, setPending] = useState(false);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    const nextErrors = {
      displayName: validateDisplayName(form.displayName),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      agree: form.agree ? undefined : 'Please accept the rules to continue.',
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;
    setPending(true);
    try {
      await createDemoProfile({ displayName: form.displayName, course: form.course || undefined });
      setForm((f) => ({ ...f, email: '', password: '' }));
      toast.success(`Welcome, ${form.displayName.trim()}!`, 'Prototype: a demo profile was created in this browser. Your email and password were not stored.');
      navigate(next, { replace: true });
    } catch (error) {
      if (error instanceof ServiceError && error.fieldErrors?.displayName) setErrors({ displayName: error.fieldErrors.displayName });
      else toast.error('Account not created', toUserMessage(error));
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthShell
      title="Join the squad"
      description="Create an account to sell or donate books and take part in discussions."
      footer={
        <>
          Already have an account?{' '}
          <Link to={paths.login} className="text-gold hover:text-champagne hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form noValidate onSubmit={submit} className="space-y-5">
        <Field label="Display name" required hint="Shown publicly instead of your real name." error={errors.displayName}>
          {(p) => <Input {...p} value={form.displayName} onChange={(e) => set('displayName', e.target.value)} autoComplete="nickname" />}
        </Field>
        <Field label="Email" required hint="Never shown publicly." error={errors.email}>
          {(p) => <Input {...p} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" />}
        </Field>
        <Field label="Password" required hint="At least 8 characters, with a letter and a number." error={errors.password}>
          {(p) => <Input {...p} type="password" value={form.password} onChange={(e) => set('password', e.target.value)} autoComplete="new-password" />}
        </Field>
        <Field label="Course (optional)">
          {(p) => (
            <Select {...p} value={form.course} onChange={(e) => set('course', e.target.value as Course | '')}>
              <option value="">Prefer not to say</option>
              {COURSES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          )}
        </Field>
        <div>
          <Checkbox
            label={
              <>
                I accept the{' '}
                <Link to={paths.rules} className="text-gold underline" target="_blank">
                  marketplace rules
                </Link>{' '}
                and{' '}
                <Link to={paths.guidelines} className="text-gold underline" target="_blank">
                  community guidelines
                </Link>
              </>
            }
            checked={form.agree}
            onChange={(e) => set('agree', e.target.checked)}
          />
          {errors.agree && (
            <p className="mt-2 text-sm text-danger" role="alert">
              {errors.agree}
            </p>
          )}
        </div>
        <Button type="submit" size="lg" className="w-full" loading={pending}>
          Create demo profile
        </Button>
      </form>
    </AuthShell>
  );
}
