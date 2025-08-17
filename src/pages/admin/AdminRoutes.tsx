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
import { Plus, Search, Filter, MoreHorizontal, Edit2, Archive, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RouteFormDrawer } from "@/components/admin/RouteFormDrawer";

interface RouteData {
  id: string;
  name: string;
  description: string;
  price_nok: number;
  duration_hours: number;
  max_capacity: number;
  location: string;
  image_url?: string;
  is_active: boolean;
  restaurants: any;
  highlights: string[];
  created_at: string;
}

export function AdminRoutes() {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteData | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("routes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRoutes(data || []);
    } catch (error) {
      console.error("Error loading routes:", error);
      toast({
        title: "Feil",
        description: "Kunne ikke laste ruter.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredRoutes = routes.filter((route) => {
    const matchesSearch = route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && route.is_active) ||
      (statusFilter === "inactive" && !route.is_active);
    
    return matchesSearch && matchesStatus;
  });

  const handleArchiveRoute = async (routeId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("routes")
        .update({ is_active: !isActive })
        .eq("id", routeId);

      if (error) throw error;

      toast({
        title: "Suksess",
        description: `Ruten er ${!isActive ? "aktivert" : "arkivert"}.`,
      });
      
      loadRoutes();
    } catch (error) {
      console.error("Error updating route:", error);
      toast({
        title: "Feil",
        description: "Kunne ikke oppdatere ruten.",
        variant: "destructive",
      });
    }
  };

  const handleEditRoute = (route: RouteData) => {
    setEditingRoute(route);
    setDrawerOpen(true);
  };

  const handleCreateNew = () => {
    setEditingRoute(null);
    setDrawerOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("no-NO", {
      style: "currency",
      currency: "NOK",
    }).format(amount);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Ruter</h1>
            <p className="text-muted-foreground">Administrer kulinariske ruter</p>
          </div>
          <Button onClick={handleCreateNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Ny rute
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
                  placeholder="Søk ruter..."
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

        {/* Routes Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-auto max-h-[600px]">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead className="w-[40px]"></TableHead>
                    <TableHead>Rute</TableHead>
                    <TableHead>Pris</TableHead>
                    <TableHead>Restauranter</TableHead>
                    <TableHead>Kapasitet</TableHead>
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
                  ) : filteredRoutes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Ingen ruter funnet
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRoutes.map((route) => (
                      <TableRow key={route.id} className="h-12">
                        <TableCell>
                          {route.image_url ? (
                            <img 
                              src={route.image_url} 
                              alt={route.name}
                              className="w-8 h-8 rounded object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                              <Image className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{route.name}</div>
                            <div className="text-xs text-muted-foreground">{route.location}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(route.price_nok)}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{route.restaurants?.length || 0}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{route.max_capacity}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={route.is_active ? "default" : "secondary"}>
                            {route.is_active ? "Aktiv" : "Inaktiv"}
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
                              <DropdownMenuItem onClick={() => handleEditRoute(route)}>
                                <Edit2 className="mr-2 h-4 w-4" />
                                Rediger
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleArchiveRoute(route.id, route.is_active)}
                              >
                                <Archive className="mr-2 h-4 w-4" />
                                {route.is_active ? "Arkiver" : "Aktiver"}
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

        <RouteFormDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          route={editingRoute}
          onSave={loadRoutes}
        />
      </div>
    </AdminLayout>
  );
}