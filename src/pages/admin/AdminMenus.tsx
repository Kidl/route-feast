import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Filter, MoreHorizontal, Edit2, Archive, ChefHat } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MenuData {
  id: string;
  title: string;
  restaurant_id: string;
  is_active: boolean;
  language: string;
  is_seasonal: boolean;
  created_at: string;
  restaurants: {
    name: string;
  };
  dish_count?: number;
}

export function AdminMenus() {
  const [menus, setMenus] = useState<MenuData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const { toast } = useToast();

  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("menus")
        .select(`
          *,
          restaurants!inner(name),
          dishes(id)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Count dishes per menu
      const menusWithCounts = (data || []).map(menu => ({
        ...menu,
        dish_count: menu.dishes ? menu.dishes.length : 0
      }));
      
      setMenus(menusWithCounts);
    } catch (error) {
      console.error("Error loading menus:", error);
      toast({
        title: "Feil",
        description: "Kunne ikke laste menyer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredMenus = menus.filter((menu) => {
    const matchesSearch = menu.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      menu.restaurants.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && menu.is_active) ||
      (statusFilter === "inactive" && !menu.is_active);
    
    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = async (menuId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("menus")
        .update({ is_active: !isActive })
        .eq("id", menuId);

      if (error) throw error;

      toast({
        title: "Suksess",
        description: `Menyen er ${!isActive ? "aktivert" : "deaktivert"}.`,
      });
      
      loadMenus();
    } catch (error) {
      console.error("Error updating menu:", error);
      toast({
        title: "Feil",
        description: "Kunne ikke oppdatere menyen.",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Menyer & Retter</h1>
            <p className="text-muted-foreground">Administrer restaurantmenyer og retter</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Ny meny
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Filtre</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Søk menyer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Status: {statusFilter === "all" ? "Alle" : statusFilter === "active" ? "Aktiv" : "Inaktiv"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                    Alle
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                    Aktive
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>
                    Inaktive
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* Menus Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-auto max-h-[600px]">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead className="w-[40px]"></TableHead>
                    <TableHead>Meny</TableHead>
                    <TableHead>Restaurant</TableHead>
                    <TableHead>Retter</TableHead>
                    <TableHead>Språk</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(7)].map((_, j) => (
                          <TableCell key={j}>
                            <div className="h-4 bg-muted rounded animate-pulse"></div>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : filteredMenus.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Ingen menyer funnet
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMenus.map((menu) => (
                      <TableRow key={menu.id} className="h-12">
                        <TableCell>
                          <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                            <ChefHat className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{menu.title}</div>
                            {menu.is_seasonal && (
                              <Badge variant="outline" className="text-xs mt-1">Sesongmeny</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{menu.restaurants.name}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{menu.dish_count || 0}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {menu.language === 'no' ? 'Norsk' : 'Engelsk'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={menu.is_active ? "default" : "secondary"}>
                            {menu.is_active ? "Aktiv" : "Inaktiv"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit2 className="mr-2 h-4 w-4" />
                                Rediger
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleToggleStatus(menu.id, menu.is_active)}
                              >
                                <Archive className="mr-2 h-4 w-4" />
                                {menu.is_active ? "Deaktiver" : "Aktiver"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}