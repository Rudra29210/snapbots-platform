import { RecordsPage } from './RecordsPage';
import { SUPPORT_TOPICS } from '@/schemas/forms';

export default function Support() {
  return (
    <RecordsPage
      col="supportTickets"
      title="Support requests"
      describe={(r) => ({
        heading: String(r.subject ?? ''),
        lines: [
          ['From', `${String(r.name ?? '')} <${String(r.email ?? '')}>`],
          ['Topic', SUPPORT_TOPICS.find((t) => t.value === r.topic)?.label ?? String(r.topic ?? '')],
          ['Order reference', String(r.orderReference ?? '')],
          ['Description', String(r.description ?? '')],
        ],
      })}
    />
  );
}
