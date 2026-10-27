import { useId, type ComponentProps, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from './Icon';

/**
 * Form building blocks. A <Field> wires label, hint and error text to its control
 * through ids, so screen readers announce them together.
 */

interface FieldRenderProps {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
}

export interface FieldProps {
  label: string;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  /** Visually hide the label (it stays available to screen readers). */
  hideLabel?: boolean;
  className?: string;
  children: (props: FieldRenderProps) => ReactNode;
}

export function Field({ label, hint, error, required, hideLabel, className, children }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className={cn('text-sm font-medium text-white', hideLabel && 'sr-only')}>
        {label}
        {required && (
          <span className="ml-1 text-gold" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })}
      {error ? (
        <p id={errorId} className="flex items-start gap-1.5 text-sm text-danger" role="alert">
          <Icon name="error" size="sm" className="mt-0.5" />
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const control =
  'w-full rounded-[var(--radius-field)] border border-line bg-ink-raised text-white placeholder:text-muted ' +
  'transition-colors duration-150 hover:border-line-strong ' +
  'focus:border-gold focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-gold/25 ' +
  'aria-invalid:border-danger aria-invalid:focus:ring-danger/25 disabled:cursor-not-allowed disabled:opacity-50';

export interface InputProps extends ComponentProps<'input'> {
  /** Text or symbol shown inside the field before the value, e.g. "₹". */
  prefix?: string;
}

export function Input({ className, prefix, ...rest }: InputProps) {
  if (prefix) {
    return (
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-mist" aria-hidden="true">
          {prefix}
        </span>
        <input className={cn(control, 'h-11 pr-4 pl-9', className)} {...rest} />
      </div>
    );
  }
  return <input className={cn(control, 'h-11 px-4', className)} {...rest} />;
}

export function Textarea({ className, rows = 4, ...rest }: ComponentProps<'textarea'>) {
  return <textarea rows={rows} className={cn(control, 'min-h-24 resize-y px-4 py-3 leading-relaxed', className)} {...rest} />;
}

export function Select({ className, children, ...rest }: ComponentProps<'select'>) {
  return (
    <div className="relative">
      <select className={cn(control, 'h-11 appearance-none pr-10 pl-4', className)} {...rest}>
        {children}
      </select>
      <Icon name="expand" size="sm" className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-mist" />
    </div>
  );
}

export interface CheckboxProps extends Omit<ComponentProps<'input'>, 'type'> {
  label: ReactNode;
  description?: ReactNode;
}

export function Checkbox({ label, description, className, id, ...rest }: CheckboxProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className={cn('flex items-start gap-3', className)}>
      <span className="relative mt-0.5 grid size-5 shrink-0 place-items-center">
        <input
          id={inputId}
          type="checkbox"
          className="peer size-5 cursor-pointer appearance-none rounded-[5px] border border-line-strong bg-ink-raised transition-colors checked:border-gold checked:bg-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne disabled:opacity-50"
          {...rest}
        />
        <Icon name="check" size="xs" className="pointer-events-none absolute text-ink opacity-0 peer-checked:opacity-100" />
      </span>
      <label htmlFor={inputId} className="cursor-pointer text-sm">
        <span className="text-white">{label}</span>
        {description && <span className="mt-0.5 block text-muted">{description}</span>}
      </label>
    </div>
  );
}
