import StaffCrm from '@/components/StaffCrm';
import { requirePermission } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Enquiries / CRM.
 *
 * The surrounding (dashboard) layout already requires a session; this adds the
 * permission check, so a signed-in role without crm.view cannot reach the
 * board by typing the URL. The API behind it checks the same permission
 * independently — the page guard is not what protects the data.
 */
export default async function CrmPage() {
  await requirePermission('crm.view');
  return <StaffCrm />;
}
