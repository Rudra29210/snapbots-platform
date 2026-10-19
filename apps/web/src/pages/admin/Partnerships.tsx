import { RecordsPage } from './RecordsPage';
import { PARTNERSHIP_TYPES } from '@/schemas/forms';

export default function Partnerships() {
  return (
    <RecordsPage
      col="partnerships"
      title="Partnership applications"
      describe={(r) => ({
        heading: String(r.organisation ?? ''),
        lines: [
          ['Contact', `${String(r.contactName ?? '')} <${String(r.email ?? '')}>`],
          ['Type', PARTNERSHIP_TYPES.find((t) => t.value === r.partnershipType)?.label ?? String(r.partnershipType ?? '')],
          ['Website', String(r.website ?? '')],
          ['Proposal', String(r.proposal ?? '')],
        ],
      })}
    />
  );
}
