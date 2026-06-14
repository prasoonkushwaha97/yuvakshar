export default function FounderDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Dashboard Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-6 bg-card border border-border rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground">Total Users</h3>
            <p className="text-3xl font-bold mt-2">--</p>
          </div>
          <div className="p-6 bg-card border border-border rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground">Founders</h3>
            <p className="text-3xl font-bold mt-2">--</p>
          </div>
          <div className="p-6 bg-card border border-border rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground">Admins</h3>
            <p className="text-3xl font-bold mt-2">--</p>
          </div>
          <div className="p-6 bg-card border border-border rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground">Editors</h3>
            <p className="text-3xl font-bold mt-2">--</p>
          </div>
          <div className="p-6 bg-card border border-border rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground">Moderators</h3>
            <p className="text-3xl font-bold mt-2">--</p>
          </div>
          <div className="p-6 bg-card border border-border rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground">Reviewers</h3>
            <p className="text-3xl font-bold mt-2">--</p>
          </div>
        </div>
      </div>
    </div>
  );
}
