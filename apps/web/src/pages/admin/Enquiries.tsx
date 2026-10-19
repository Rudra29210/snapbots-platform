import { RecordsPage } from './RecordsPage';
import { ENQUIRY_CATEGORIES } from '@/schemas/forms';

const categoryLabel = (v: unknown) => ENQUIRY_CATEGORIES.find((c) => c.value === v)?.label ?? String(v ?? '');

export default function Enquiries() {
  return (
    <RecordsPage
      col="enquiries"
      title="Enquiries"
      describe={(r) => ({
        heading: `${String(r.subject ?? '')}`,
        lines: [
          ['From', `${String(r.name ?? '')} <${String(r.email ?? '')}>`],
          ['Company', String(r.company ?? '')],
          ['Phone', String(r.phone ?? '')],
          ['Category', categoryLabel(r.category)],
          ['Message', String(r.message ?? '')],
          ['Customer account', r.userId ? 'Signed in' : 'Guest'],
        ],
      })}
    />
  );
}
