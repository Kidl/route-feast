import { AdminLayout } from "@/components/admin/AdminLayout";

export function AdminExport() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Eksporter</h1>
        <p className="text-muted-foreground">CSV eksporter (kommer snart)</p>
      </div>
    </AdminLayout>
  );
}