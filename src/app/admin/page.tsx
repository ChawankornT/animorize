import { Card } from '@/components/ui/Card';

const statCards = [
  { label: 'Total providers', value: 0 },
  { label: 'Total franchises', value: 0 },
  { label: 'Total media', value: 0 },
  { label: 'Recent syncs', value: 0 },
];

export default function AdminDashboardPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-medium text-primary tracking-tight">Dashboard</h1>
        <p className="mt-1 text-md text-secondary">Welcome to the Animorize admin panel.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statCards.map(({ label, value }) => (
          <Card key={label} variant="surface" className="space-y-1">
            <p className="text-sm text-secondary">{label}</p>
            <p className="text-2xl font-medium text-primary">{value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
