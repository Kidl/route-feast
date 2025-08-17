import { AdminLayout } from "@/components/admin/AdminLayout";

export function AdminSettings() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Innstillinger</h1>
        <p className="text-muted-foreground">Systeminnstillinger (kommer snart)</p>
      </div>
    </AdminLayout>
  );
}