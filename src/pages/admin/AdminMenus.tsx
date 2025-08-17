import { AdminLayout } from "@/components/admin/AdminLayout";

export function AdminMenus() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Menyer & Retter</h1>
        <p className="text-muted-foreground">Administrer restaurantmenyer og retter (kommer snart)</p>
      </div>
    </AdminLayout>
  );
}