import { useTranslation } from 'react-i18next';
import { CheckCircle2, XCircle, Clock, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';
import type { ApprovalStatus } from '../../types/task';

interface ApprovalSectionProps {
  status: ApprovalStatus;
  onChange: (status: ApprovalStatus) => void;
}

const APPROVAL_CONFIG: Record<
  ApprovalStatus,
  { labelKey: string; badgeClass: string; icon: typeof CheckCircle2 }
> = {
  none: { labelKey: '', badgeClass: '', icon: ShieldCheck },
  pending: {
    labelKey: 'approval.pending',
    badgeClass: 'bg-warning/10 text-warning',
    icon: Clock,
  },
  approved: {
    labelKey: 'approval.approved',
    badgeClass: 'bg-success/10 text-success',
    icon: CheckCircle2,
  },
  rejected: {
    labelKey: 'approval.rejected',
    badgeClass: 'bg-danger/10 text-danger',
    icon: XCircle,
  },
};

export function ApprovalBadge({ status }: { status: ApprovalStatus }) {
  const { t } = useTranslation();
  if (status === 'none') return null;

  const config = APPROVAL_CONFIG[status];
  const Icon = config.icon;

  return (
    <Badge className={config.badgeClass}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {t(config.labelKey)}
    </Badge>
  );
}

export function ApprovalActions({ status, onChange }: ApprovalSectionProps) {
  const { t } = useTranslation();
  const { canApprove } = useAuth();

  // Hanya admin/manager yang bisa approve/reject
  if (!canApprove) {
    // Member hanya bisa submit untuk approval
    if (status === 'none') {
      return (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => onChange('pending')}
        >
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          {t('approval.submit')}
        </Button>
      );
    }
    // Tampilkan status read-only untuk member
    return <ApprovalBadge status={status} />;
  }

  // Admin/Manager actions
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ApprovalBadge status={status} />

      {status === 'pending' && (
        <>
          <Button
            type="button"
            size="sm"
            onClick={() => onChange('approved')}
            className="bg-success text-white hover:bg-success/90 focus-visible:ring-success/50"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {t('approval.approve')}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="danger"
            onClick={() => onChange('rejected')}
          >
            <XCircle className="h-4 w-4" aria-hidden="true" />
            {t('approval.reject')}
          </Button>
        </>
      )}

      {(status === 'approved' || status === 'rejected') && (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => onChange('none')}
        >
          {t('approval.reset')}
        </Button>
      )}
    </div>
  );
}