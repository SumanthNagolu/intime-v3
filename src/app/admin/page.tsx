/**
 * Admin Dashboard Page
 *
 * Overview of system health and key metrics.
 */

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Event Processing"
          value="View Events"
          description="Manage and monitor event bus"
          href="/admin/events"
        />
        <StatCard
          title="Handler Health"
          value="View Handlers"
          description="Monitor event handler status"
          href="/admin/handlers"
        />
        <StatCard
          title="Project Timeline"
          value="View Timeline"
          description="Track project progress"
          href="/admin/timeline"
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <ul className="space-y-2 text-gray-600">
          <li>• View and replay failed events</li>
          <li>• Monitor handler health and enable/disable handlers</li>
          <li>• Review event processing metrics</li>
          <li>• Manage dead letter queue</li>
        </ul>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  href,
}: {
  title: string;
  value: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
    >
      <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
      <p className="text-2xl font-bold text-blue-600 mb-2">{value}</p>
      <p className="text-sm text-gray-600">{description}</p>
    </a>
  );
}
