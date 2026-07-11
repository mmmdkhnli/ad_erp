import { requireUser } from "@/server/rbac";
import { PageHeader } from "@/components/shared/page-header";
import { InfoGuide } from "@/components/info/info-guide";

export default async function InfoPage() {
  await requireUser();
  return (
    <div>
      <PageHeader
        title="Bələdçi"
        description="Sistemin tam izahı — anlayışlar, iş axını, modullar və əlaqələr"
      />
      <InfoGuide />
    </div>
  );
}
