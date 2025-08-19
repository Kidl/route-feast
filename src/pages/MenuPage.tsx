import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Leaf, Star, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  dish_type: string;
  photo_url?: string;
  prep_time_min_override?: number;
  available_for_route: boolean;
}

interface Menu {
  id: string;
  title: string;
  language: string;
  is_active: boolean;
  default_prep_time_min: number;
}

interface Restaurant {
  id: string;
  name: string;
  cuisine_type: string;
}

const MenuPage = () => {
  const { restaurantId } = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenuData = async () => {
      if (!restaurantId) return;
      
      try {
        // Fetch restaurant data
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select('id, name, cuisine_type')
          .eq('id', restaurantId)
          .eq('status', 'active')
          .maybeSingle();

        if (restaurantError) throw restaurantError;
        setRestaurant(restaurantData);

        // Fetch menus for this restaurant
        const { data: menusData, error: menusError } = await supabase
          .from('menus')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .eq('is_active', true)
          .order('title');

        if (menusError) throw menusError;
        setMenus(menusData || []);

        // If we have menus, select the first one and fetch its dishes
        if (menusData && menusData.length > 0) {
          const firstMenu = menusData[0];
          setSelectedMenuId(firstMenu.id);

          const { data: dishesData, error: dishesError } = await supabase
            .from('dishes')
            .select('*')
            .eq('menu_id', firstMenu.id)
            .order('dish_type', { ascending: true });

          if (dishesError) throw dishesError;
          setDishes(dishesData || []);
        }
      } catch (error) {
        console.error('Error fetching menu data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, [restaurantId]);

  const fetchDishesForMenu = async (menuId: string) => {
    try {
      const { data: dishesData, error: dishesError } = await supabase
        .from('dishes')
        .select('*')
        .eq('menu_id', menuId)
        .order('dish_type', { ascending: true });

      if (dishesError) throw dishesError;
      setDishes(dishesData || []);
      setSelectedMenuId(menuId);
    } catch (error) {
      console.error('Error fetching dishes:', error);
    }
  };

  // Group dishes by type
  const groupedDishes = dishes.reduce((acc, dish) => {
    if (!acc[dish.dish_type]) {
      acc[dish.dish_type] = [];
    }
    acc[dish.dish_type].push(dish);
    return acc;
  }, {} as Record<string, Dish[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Laster meny...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Restaurant ikke funnet</h1>
          <Link to="/restaurants">
            <Button variant="outline">Tilbake til restauranter</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to={`/restaurant/${restaurantId}`}>
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Tilbake til restaurant
              </Button>
            </Link>
            
            {menus.length > 1 && (
              <div className="flex gap-2">
                {menus.map((menu) => (
                  <Button
                    key={menu.id}
                    variant={selectedMenuId === menu.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => fetchDishesForMenu(menu.id)}
                  >
                    {menu.title}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-hero text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Meny - {restaurant.name}
          </h1>
          <p className="text-xl text-white/90 mb-6">
            {restaurant.cuisine_type} kjøkken
          </p>
          {menus.length > 0 && selectedMenuId && (
            <Badge className="bg-white/20 text-white border-white/30">
              {menus.find(m => m.id === selectedMenuId)?.title}
            </Badge>
          )}
        </div>
      </section>

      {/* Menu Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {dishes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">
                Ingen retter tilgjengelig for øyeblikket
              </p>
              <p className="text-sm text-muted-foreground">
                Ta kontakt med restauranten for oppdatert meny
              </p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-8">
              {Object.entries(groupedDishes).map(([dishType, dishGroup]) => (
                <Card key={dishType}>
                  <CardHeader>
                    <CardTitle className="text-2xl capitalize">{dishType}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {dishGroup.map((dish) => (
                        <div key={dish.id} className="border-b pb-6 last:border-b-0">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-medium">{dish.name}</h3>
                                {dish.available_for_route && (
                                  <Badge variant="outline" className="text-xs">
                                    <Star className="w-3 h-3 mr-1" />
                                    Rute-favoritt
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="text-muted-foreground mb-3 leading-relaxed">
                                {dish.description}
                              </p>
                              
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                {dish.prep_time_min_override && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{dish.prep_time_min_override} min</span>
                                  </div>
                                )}
                                
                                <div className="flex items-center gap-1">
                                  <Leaf className="w-3 h-3 text-green-500" />
                                  <span>Uten allergener</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <p className="text-xl font-semibold text-primary">
                                {dish.price} {dish.currency}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Allergen Notice */}
              <Card className="bg-muted/50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium mb-2">Allergener og diett</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Har du allergier eller spesielle kostbehov? Vårt kjøkken kan tilpasse de fleste retter. 
                        Ta kontakt med servitøren for detaljert informasjon om ingredienser og tilberedning.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export { MenuPage as default };