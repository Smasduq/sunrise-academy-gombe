import { ModulePlaceholder } from '@/components/ModulePlaceholder';

export default function AttendancePage() {
  return (
    <ModulePlaceholder
      title="Attendance"
      description="Mark daily attendance, view reports, and track monthly statistics for Nursery and Primary classes."
      features={[
        'Daily class attendance register',
        'Monthly attendance statistics',
        'Student attendance history',
        'Export attendance reports',
      ]}
      actionHref="/dashboard/students"
      actionLabel="View students"
    />
  );
}
