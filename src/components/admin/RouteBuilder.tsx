import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, X, MapPin, Clock, UtensilsCrossed, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Restaurant {
  id: string;
  name: string;
  address: string;
  cuisine_type?: string;
  lat?: number;
  lng?: number;
}

interface Dish {
  id: string;
  name: string;
  description?: string;
  price?: number;
  dish_type: string;
  photo_url?: string;
}

interface RouteStop {
  restaurant_id: string;
  dish_id: string;
  order_index: number;
  time_override_min?: number;
  restaurant?: Restaurant;
  dish?: Dish;
}

interface RouteBuilderProps {
  value: RouteStop[];
  onChange: (stops: RouteStop[]) => void;
}

export function RouteBuilder({ value, onChange }: RouteBuilderProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [restaurantDishes, setRestaurantDishes] = useState<Dish[]>([]);
  const [showRestaurantDialog, setShowRestaurantDialog] = useState(false);
  const [showDishDialog, setShowDishDialog] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoType, setInfoType] = useState<"restaurant" | "dish">("restaurant");
  const [infoData, setInfoData] = useState<Restaurant | Dish | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    console.log("🔄 Loading restaurants...");
    try {
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("status", "active")
        .order("name");

      if (error) throw error;
      console.log("✅ Loaded restaurants:", data?.length || 0);
      setRestaurants(data || []);
    } catch (error) {
      console.error("❌ Error loading restaurants:", error);
      toast({
        title: "Feil",
        description: "Kunne ikke laste restauranter.",
        variant: "destructive",
      });
    }
  };

  const loadRestaurantDishes = async (restaurantId: string) => {
    console.log("🍽️ Loading dishes for restaurant:", restaurantId);
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("dishes")
        .select(`
          *,
          menus!inner(restaurant_id)
        `)
        .eq("menus.restaurant_id", restaurantId)
        .eq("available_for_route", true)
        .order("name");

      if (error) throw error;
      console.log("✅ Loaded dishes:", data?.length || 0, "for restaurant:", restaurantId);
      console.log("📋 Dishes data:", data);
      setRestaurantDishes(data || []);
    } catch (error) {
      console.error("❌ Error loading dishes:", error);
      toast({
        title: "Feil",
        description: "Kunne ikke laste retter.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddRestaurant = (restaurant: Restaurant) => {
    console.log("🏪 Selected restaurant:", restaurant.name);
    setSelectedRestaurant(restaurant);
    loadRestaurantDishes(restaurant.id);
    setShowRestaurantDialog(false);
    setShowDishDialog(true);
  };

  const handleAddDish = (dish: Dish) => {
    console.log("🍴 Selected dish:", dish.name, "from restaurant:", selectedRestaurant?.name);
    if (!selectedRestaurant) return;

    const newStop: RouteStop = {
      restaurant_id: selectedRestaurant.id,
      dish_id: dish.id,
      order_index: value.length,
      time_override_min: 30, // Default 30 minutes
      restaurant: selectedRestaurant,
      dish: dish,
    };

    console.log("➕ Adding new route stop:", newStop);
    onChange([...value, newStop]);
    setShowDishDialog(false);
    setSelectedRestaurant(null);
    setRestaurantDishes([]);
  };

  const removeStop = (index: number) => {
    const newStops = value.filter((_, i) => i !== index).map((stop, i) => ({
      ...stop,
      order_index: i,
    }));
    onChange(newStops);
  };

  const updateStopTime = (index: number, timeInMinutes: number) => {
    const newStops = [...value];
    newStops[index] = { ...newStops[index], time_override_min: timeInMinutes };
    onChange(newStops);
  };

  const getTotalTime = () => {
    return value.reduce((total, stop) => total + (stop.time_override_min || 30), 0);
  };

  const showInfo = (data: Restaurant | Dish, type: "restaurant" | "dish") => {
    setInfoData(data);
    setInfoType(type);
    setShowInfoModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Route Summary */}
      {value.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Ruteoversikt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <UtensilsCrossed className="h-4 w-4" />
                <span>{value.length} stopp</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{getTotalTime()} minutter</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Route Stops */}
      <div className="space-y-4">
        {value.map((stop, index) => (
          <Card key={index} className="relative">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      Stopp {index + 1}
                    </Badge>
                    <span className="font-medium">{stop.restaurant?.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => stop.restaurant && showInfo(stop.restaurant, "restaurant")}
                      className="h-6 w-6 p-0"
                    >
                      <Info className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm">{stop.dish?.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => stop.dish && showInfo(stop.dish, "dish")}
                      className="h-6 w-6 p-0"
                    >
                      <Info className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Label htmlFor={`time-${index}`} className="text-xs">
                      Tid (min):
                    </Label>
                    <Input
                      id={`time-${index}`}
                      type="number"
                      min="10"
                      max="120"
                      value={stop.time_override_min || 30}
                      onChange={(e) => updateStopTime(index, parseInt(e.target.value) || 30)}
                      className="w-20 h-8 text-xs"
                    />
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeStop(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Stop Button */}
      <Button
        variant="outline"
        onClick={() => setShowRestaurantDialog(true)}
        className="w-full border-dashed"
      >
        <Plus className="h-4 w-4 mr-2" />
        Legg til stopp
      </Button>

      {/* Restaurant Selection Dialog */}
      <Dialog open={showRestaurantDialog} onOpenChange={setShowRestaurantDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Velg restaurant</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-96">
            <div className="grid gap-2">
              {restaurants.map((restaurant) => (
                <Card 
                  key={restaurant.id} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleAddRestaurant(restaurant)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{restaurant.name}</div>
                        <div className="text-sm text-muted-foreground">{restaurant.address}</div>
                        {restaurant.cuisine_type && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {restaurant.cuisine_type}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Dish Selection Dialog */}
      <Dialog open={showDishDialog} onOpenChange={setShowDishDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Velg rett fra {selectedRestaurant?.name}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-96">
            {loading ? (
              <div className="text-center py-8">Laster retter...</div>
            ) : (
              <div className="grid gap-2">
                {restaurantDishes.map((dish) => (
                  <Card 
                    key={dish.id} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleAddDish(dish)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        {dish.photo_url && (
                          <img
                            src={dish.photo_url}
                            alt={dish.name}
                            className="w-12 h-12 rounded object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <div className="font-medium">{dish.name}</div>
                          {dish.description && (
                            <div className="text-sm text-muted-foreground line-clamp-2">
                              {dish.description}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {dish.dish_type}
                            </Badge>
                            {dish.price && (
                              <span className="text-sm font-medium">
                                {dish.price} NOK
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Info Modal */}
      <Dialog open={showInfoModal} onOpenChange={setShowInfoModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {infoType === "restaurant" ? "Restaurant info" : "Rett info"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {infoType === "restaurant" && infoData && "address" in infoData && (
              <div className="space-y-2">
                <h3 className="font-medium">{infoData.name}</h3>
                <p className="text-sm text-muted-foreground">{infoData.address}</p>
                {infoData.cuisine_type && (
                  <Badge variant="secondary">{infoData.cuisine_type}</Badge>
                )}
              </div>
            )}
            
            {infoType === "dish" && infoData && "dish_type" in infoData && (
              <div className="space-y-2">
                <h3 className="font-medium">{infoData.name}</h3>
                {infoData.description && (
                  <p className="text-sm text-muted-foreground">{infoData.description}</p>
                )}
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{infoData.dish_type}</Badge>
                  {infoData.price && (
                    <span className="text-sm font-medium">
                      {infoData.price} NOK
                    </span>
                  )}
                </div>
                {infoData.photo_url && (
                  <img
                    src={infoData.photo_url}
                    alt={infoData.name}
                    className="w-full h-48 rounded object-cover"
                  />
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}