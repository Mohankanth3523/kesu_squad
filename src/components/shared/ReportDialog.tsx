import { useState } from 'react';
import { useSession } from '@/app/providers/session-context';
import { Button, Field, Modal, Select, Textarea, useToast } from '@/components/ui';
import { useAction } from '@/hooks/useAction';
import { services } from '@/services';
import type { ReportReason, ReportTarget } from '@/types/domain';
import { REPORT_REASON_LABEL } from '@/types/labels';
import { IdentityPrompt } from './IdentityPrompt';

const REASONS_FOR: Record<ReportTarget, ReportReason[]> = {
  post: ['spam', 'harassment', 'inappropriate', 'other'],
  comment: ['spam', 'harassment', 'inappropriate', 'other'],
  listing: ['scam_or_fraud', 'price_rule_violation', 'charging_for_donation', 'spam', 'inappropriate', 'other'],
  user: ['scam_or_fraud', 'harassment', 'spam', 'other'],
  conversation: ['scam_or_fraud', 'harassment', 'spam', 'inappropriate', 'other'],
};

/** Report flow shared by posts, comments, listings and conversations (C1 §6). */
export function ReportDialog({ open, onClose, targetType, targetId, targetLabel }: { open: boolean; onClose: () => void; targetType: ReportTarget; targetId: string; targetLabel: string }) {
  const { user } = useSession();
  const toast = useToast();
  const [reason, setReason] = useState<ReportReason | ''>('');
  const [details, setDetails] = useState('');
  const [error, setError] = useState<string>();
  const submit = useAction(services.reports.submit, {
    errorTitle: 'Report not sent',
    onSuccess: () => {
      toast.success('Report received', 'Thanks — the Kesh Squad team reviews reports. (Prototype: stored in this browser only.)');
      setReason('');
      setDetails('');
      onClose();
    },
  });

  if (open && !user) {
    return <IdentityPrompt open onClose={onClose} title="Log in to report" description={`Reports help keep Kesh Squad safe. Log in or continue as a guest to report this ${targetLabel}.`} />;
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Report this ${targetLabel}`}
      description="Tell us what’s wrong. Your report is private."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={submit.pending}
            onClick={() => {
              if (!reason) return setError('Choose a reason.');
              setError(undefined);
              void submit.run({ targetType, targetId, reason, details });
            }}
          >
            Send report
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <Field label="Reason" required error={error}>
          {(p) => (
            <Select {...p} value={reason} onChange={(e) => setReason(e.target.value as ReportReason)}>
              <option value="">Choose a reason</option>
              {REASONS_FOR[targetType].map((r) => (
                <option key={r} value={r}>
                  {REPORT_REASON_LABEL[r]}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Details (optional)" hint="Anything that helps us understand, like what was said or asked for." error={submit.fieldErrors.details}>
          {(p) => <Textarea {...p} rows={3} maxLength={1000} value={details} onChange={(e) => setDetails(e.target.value)} />}
        </Field>
      </div>
    </Modal>
  );
}
