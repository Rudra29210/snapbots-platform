# Database

Cloud Firestore, default-deny (see `firestore.rules`). All timestamps for authoritative events are
server-side (`request.time` enforced by rules).

## Collections

### `enquiries`
General, product, service, robotics-project and learning enquiries.

| Field | Type | Notes |
|---|---|---|
| `name` | string 2–80 | |
| `email` | string | Lowercased, validated |
| `phone` | string ≤ 30 | Optional, may be empty |
| `company` | string ≤ 120 | Optional |
| `category` | enum | `general`, `robotics_project`, `product`, `service`, `learning` |
| `subject` | string 3–120 | |
| `message` | string 10–3000 | |
| `consent` | `true` | Required to store |
| `schemaVersion` | `1` | |
| `status` | enum | Created as `new`. Admin may set `new`, `in_review`, `responded`, `closed` |
| `userId` | string or null | Set only to the creator's uid |
| `source` | `"website"` | |
| `createdAt`, `updatedAt` | timestamp | Server-set |
| `updatedBy` | string | Set on admin updates to the admin's uid |
| `internalNote` | string ≤ 2000 | Staff note. **Currently visible to the record owner**, because owners can read their whole document. See the warning below. |

**Important:** because the owner can read the whole document, `internalNote` is currently visible to the
customer who submitted the enquiry. Before using internal notes for anything sensitive, move notes to a
separate admin-only subcollection (`enquiries/{id}/internal/{noteId}` with admin-only rules). This is a known
gap and is listed in SECURITY.md.

### `partnerships`
Organisation, contact, partnership type, optional website (https only), proposal (20–2000). Same status,
ownership, timestamp and `updatedBy` rules as `enquiries`.

### `supportTickets`
Name, email, topic enum, optional order reference (≤ 60), subject, description (20–3000). No consent field.
Same status and ownership rules.

### `users/{uid}`
Display profile only: `displayName`, `company`, `email` (must equal the authenticated token email),
`createdAt`. Owner may update `displayName` and `company` only. Roles are **not** stored here.

### `auditEvents/{id}`
Written only by Cloud Functions. Fields: `type` (`record.status_changed` or `role.admin_granted`),
`collection`, `recordId`, `fromStatus`, `toStatus`, `actorUid`, `noteChanged` (boolean), `targetUid` (for role
grants), `at`. Note text is never copied in.

## Indexes (`firestore.indexes.json`)

| Collection | Fields | Used by |
|---|---|---|
| enquiries, partnerships, supportTickets | `userId ASC, createdAt DESC` | Customer dashboard |
| enquiries, partnerships, supportTickets | `status ASC, createdAt DESC` | Admin filtered lists |

## Pagination and bounds

Admin lists fetch 25 records per query. Customer lists fetch 25. There are no unbounded collection reads, and
no real-time listeners are used. Pagination beyond the first page ("load more") is **not yet implemented**;
records older than the most recent 25 for a given filter are not reachable from the UI yet.

## Retention (proposed, not automated)

Enquiries, partnerships and tickets: retain while active, then review for deletion after a period the business
must set (proposed: 24 months after `closed`). A scheduled deletion job is **not implemented**.
Audit events: retain at least 12 months for accountability. Account deletion is a manual request by email.

## Seeding

No seed script is included. Development data should be created through the forms against the emulator, so
no fabricated customers or testimonials are ever introduced.
