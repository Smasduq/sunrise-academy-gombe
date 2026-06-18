import { ModulePlaceholder } from '@/components/ModulePlaceholder';

export default function ContentPage() {
  return (
    <ModulePlaceholder
      title="Website Content"
      description="Manage public website content — homepage text, gallery photos, news, and contact details."
      features={[
        'Update homepage hero and sections',
        'Upload and manage gallery photos',
        'Publish school news and events',
        'Update contact information',
      ]}
      actionHref="/dashboard/settings"
      actionLabel="School settings"
    />
  );
}
