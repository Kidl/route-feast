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
import { Plus, Search, Filter, MoreHorizontal, Edit2, Archive, MapPin, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RestaurantFormDrawer } from "@/components/admin/RestaurantFormDrawer";

interface RestaurantData {
  id: string;
  name: string;
  description?: string;
  address: string;
  city?: string;
  lat?: number;
  lng?: number;
  phone?: string;
  email?: string;
  website?: string;
  status: string;
  cuisine_type?: string;
  tags?: string[];
  created_at: string;
  restaurant_images: { id: string; url: string; is_cover: boolean }[];
}

export function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState<RestaurantData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [cuisineFilter, setCuisineFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<RestaurantData | null>(null);
  const [availableCuisines, setAvailableCuisines] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("restaurants")
        .select(`
          *,
          restaurant_images(id, url, is_cover)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRestaurants(data || []);
      
      // Extract unique cuisine types and tags for filtering
      const cuisines = [...new Set(data?.map(r => r.cuisine_type).filter(Boolean) || [])];
      const allTags = [...new Set(data?.flatMap(r => r.tags || []) || [])];
      setAvailableCuisines(cuisines);
      setAvailableTags(allTags);
    } catch (error) {
      console.error("Error loading restaurants:", error);
      toast({
        title: "Feil",
        description: "Kunne ikke laste restauranter.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.cuisine_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || restaurant.status === statusFilter;
    const matchesCuisine = cuisineFilter === "all" || restaurant.cuisine_type === cuisineFilter;
    const matchesTag = tagFilter === "all" || restaurant.tags?.includes(tagFilter);
    
    return matchesSearch && matchesStatus && matchesCuisine && matchesTag;
  });

  const handleToggleStatus = async (restaurantId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      const { error } = await supabase
        .from("restaurants")
        .update({ status: newStatus })
        .eq("id", restaurantId);

      if (error) throw error;

      toast({
        title: "Suksess",
        description: `Restauranten er ${newStatus === "active" ? "aktivert" : "deaktivert"}.`,
      });
      
      loadRestaurants();
    } catch (error) {
      console.error("Error updating restaurant:", error);
      toast({
        title: "Feil",
        description: "Kunne ikke oppdatere restauranten.",
        variant: "destructive",
      });
    }
  };

  const handleEditRestaurant = (restaurant: RestaurantData) => {
    setEditingRestaurant(restaurant);
    setDrawerOpen(true);
  };

  const handleCreateNew = () => {
    setEditingRestaurant(null);
    setDrawerOpen(true);
  };

  const getCoverImage = (images: { url: string; is_cover: boolean }[]) => {
    const cover = images.find(img => img.is_cover);
    return cover?.url || images[0]?.url;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Restauranter</h1>
            <p className="text-muted-foreground">Administrer restauranter og deres informasjon</p>
          </div>
          <Button onClick={handleCreateNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Ny restaurant
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Filtre</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Søk restauranter..."
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Kjøkken: {cuisineFilter === "all" ? "Alle" : cuisineFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setCuisineFilter("all")}>
                    Alle kjøkken
                  </DropdownMenuItem>
                  {availableCuisines.map(cuisine => (
                    <DropdownMenuItem key={cuisine} onClick={() => setCuisineFilter(cuisine)}>
                      {cuisine}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Tag: {tagFilter === "all" ? "Alle" : tagFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setTagFilter("all")}>
                    Alle tags
                  </DropdownMenuItem>
                  {availableTags.map(tag => (
                    <DropdownMenuItem key={tag} onClick={() => setTagFilter(tag)}>
                      {tag}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* Restaurants Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-auto max-h-[600px]">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead className="w-[60px]"></TableHead>
                    <TableHead>Restaurant</TableHead>
                    <TableHead>Kjøkken & Tags</TableHead>
                    <TableHead>Adresse</TableHead>
                    <TableHead>Koordinater</TableHead>
                    <TableHead>Bilder</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(8)].map((_, j) => (
                          <TableCell key={j}>
                            <div className="h-4 bg-muted rounded animate-pulse"></div>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : filteredRestaurants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Ingen restauranter funnet
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRestaurants.map((restaurant) => (
                      <TableRow key={restaurant.id} className="h-12">
                        <TableCell>
                          {getCoverImage(restaurant.restaurant_images) ? (
                            <img 
                              src={getCoverImage(restaurant.restaurant_images)} 
                              alt={restaurant.name}
                              className="w-10 h-8 rounded object-cover"
                            />
                          ) : (
                            <div className="w-10 h-8 rounded bg-muted flex items-center justify-center">
                              <Camera className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{restaurant.name}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {restaurant.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {restaurant.cuisine_type && (
                              <Badge variant="outline" className="text-xs">
                                {restaurant.cuisine_type}
                              </Badge>
                            )}
                            {restaurant.tags && restaurant.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {restaurant.tags.slice(0, 2).map(tag => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {restaurant.tags.length > 2 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{restaurant.tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{restaurant.address}</div>
                            {restaurant.city && (
                              <div className="text-muted-foreground">{restaurant.city}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {restaurant.lat && restaurant.lng ? (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs">
                                {restaurant.lat.toFixed(4)}, {restaurant.lng.toFixed(4)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Ikke angitt</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{restaurant.restaurant_images?.length || 0}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={restaurant.status === "active" ? "default" : "secondary"}>
                            {restaurant.status === "active" ? "Aktiv" : "Inaktiv"}
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
                              <DropdownMenuItem onClick={() => handleEditRestaurant(restaurant)}>
                                <Edit2 className="mr-2 h-4 w-4" />
                                Rediger
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleToggleStatus(restaurant.id, restaurant.status)}
                              >
                                <Archive className="mr-2 h-4 w-4" />
                                {restaurant.status === "active" ? "Deaktiver" : "Aktiver"}
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

        <RestaurantFormDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          restaurant={editingRestaurant}
          onSave={loadRestaurants}
        />
      </div>
    </AdminLayout>
  );
}