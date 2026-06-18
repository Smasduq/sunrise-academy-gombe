import { ModulePlaceholder } from '@/components/ModulePlaceholder';

export default function ResultsPage() {
  return (
    <ModulePlaceholder
      title="Results & Report Cards"
      description="Upload term results, publish to parents, and generate report cards for Primary 1–3."
      features={[
        'Upload and edit term results',
        'Publish results to student portal',
        'View result history by class',
        'Generate printable report cards',
      ]}
      actionHref="/dashboard/students"
      actionLabel="View students"
    />
  );
}
