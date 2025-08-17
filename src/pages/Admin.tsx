import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { useToast } from "@/hooks/use-toast";

export function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Tilgang nektet",
          description: "Du må logge inn for å få tilgang til admin-panelet.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      // Check if user is admin
      const { data: adminUser } = await supabase
        .from("admin_users")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (!adminUser) {
        toast({
          title: "Tilgang nektet",
          description: "Du har ikke admin-tilgang.",
          variant: "destructive",
        });
        navigate("/");
      }
    };

    checkAdminAccess();
  }, [navigate, toast]);

  return (
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
  );
}