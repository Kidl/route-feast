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
  id?: string;
  restaurant_id: string;
  dish_ids: string[]; // Changed to array for multiple dishes
  order_index: number;
  time_override_min?: number;
  restaurant?: Restaurant;
  dishes?: Dish[]; // Changed to array
}

interface RouteBuilderProps {
  value: RouteStop[];
  onChange: (stops: RouteStop[]) => void;
}

export function RouteBuilder({ value, onChange }: RouteBuilderProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [editingStopIndex, setEditingStopIndex] = useState<number>(-1);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [restaurantDishes, setRestaurantDishes] = useState<Dish[]>([]);
  const [selectedDishes, setSelectedDishes] = useState<string[]>([]);
  const [showStopDialog, setShowStopDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState<'restaurant' | 'dishes'>('restaurant');
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

  const handleSelectRestaurant = (restaurant: Restaurant) => {
    console.log("🏪 Selected restaurant:", restaurant.name);
    setSelectedRestaurant(restaurant);
    loadRestaurantDishes(restaurant.id);
    setCurrentStep('dishes');
  };

  const handleToggleDish = (dishId: string) => {
    setSelectedDishes(prev => 
      prev.includes(dishId) 
        ? prev.filter(id => id !== dishId)
        : [...prev, dishId]
    );
  };

  const handleSaveStop = () => {
    if (!selectedRestaurant || selectedDishes.length === 0) {
      toast({
        title: "Feil",
        description: "Du må velge restaurant og minst én rett.",
        variant: "destructive",
      });
      return;
    }

    const selectedDishObjects = restaurantDishes.filter(d => selectedDishes.includes(d.id));
    
    if (editingStopIndex >= 0) {
      // Edit existing stop
      const newStops = [...value];
      newStops[editingStopIndex] = {
        ...newStops[editingStopIndex],
        restaurant_id: selectedRestaurant.id,
        dish_ids: selectedDishes,
        restaurant: selectedRestaurant,
        dishes: selectedDishObjects,
      };
      onChange(newStops);
    } else {
      // Add new stop
      const newStop: RouteStop = {
        restaurant_id: selectedRestaurant.id,
        dish_ids: selectedDishes,
        order_index: value.length,
        time_override_min: 30,
        restaurant: selectedRestaurant,
        dishes: selectedDishObjects,
      };
      onChange([...value, newStop]);
    }

    resetDialog();
  };

  const resetDialog = () => {
    setShowStopDialog(false);
    setCurrentStep('restaurant');
    setSelectedRestaurant(null);
    setSelectedDishes([]);
    setRestaurantDishes([]);
    setEditingStopIndex(-1);
  };

  const handleAddStop = () => {
    resetDialog();
    setShowStopDialog(true);
  };

  const handleEditStop = (index: number) => {
    const stop = value[index];
    if (stop.restaurant) {
      setSelectedRestaurant(stop.restaurant);
      setSelectedDishes(stop.dish_ids || []);
      loadRestaurantDishes(stop.restaurant.id);
      setEditingStopIndex(index);
      setCurrentStep('dishes');
      setShowStopDialog(true);
    }
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
      {/* Debug info */}
      <div className="text-xs text-muted-foreground bg-yellow-50 p-2 rounded">
        🔧 Debug: {restaurants.length} restaurants loaded, {value.length} current stops
      </div>
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
          <Card key={index} className="relative border-l-4 border-l-primary/20">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Stopp {index + 1}
                    </Badge>
                    <span className="font-medium text-lg">{stop.restaurant?.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => stop.restaurant && showInfo(stop.restaurant, "restaurant")}
                      className="h-6 w-6 p-0"
                    >
                      <Info className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3 inline mr-1" />
                    {stop.restaurant?.address}
                    {stop.restaurant?.cuisine_type && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {stop.restaurant.cuisine_type}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Valgte retter:</div>
                    <div className="grid gap-2">
                      {stop.dishes?.map((dish) => (
                        <div key={dish.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                          <UtensilsCrossed className="h-3 w-3" />
                          <span className="text-sm">{dish.name}</span>
                          <Badge variant="outline" className="text-xs">{dish.dish_type}</Badge>
                          {dish.price && (
                            <span className="text-xs text-muted-foreground ml-auto">
                              {dish.price} NOK
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditStop(index)}
                      className="text-xs"
                    >
                      Rediger
                    </Button>
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
        onClick={handleAddStop}
        className="w-full border-dashed"
      >
        <Plus className="h-4 w-4 mr-2" />
        Legg til stopp
      </Button>

      {/* Stop Builder Dialog */}
      <Dialog open={showStopDialog} onOpenChange={resetDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingStopIndex >= 0 ? 'Rediger stopp' : 'Legg til nytt stopp'}
            </DialogTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className={`px-2 py-1 rounded text-xs ${currentStep === 'restaurant' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                1. Velg restaurant
              </div>
              <div className={`px-2 py-1 rounded text-xs ${currentStep === 'dishes' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                2. Velg retter
              </div>
            </div>
          </DialogHeader>

          {/* Restaurant Selection Step */}
          {currentStep === 'restaurant' && (
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-96">
                <div className="grid gap-2 p-1">
                  {restaurants.map((restaurant) => (
                    <Card 
                      key={restaurant.id} 
                      className={`cursor-pointer transition-colors ${
                        selectedRestaurant?.id === restaurant.id 
                          ? 'bg-primary/10 border-primary' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleSelectRestaurant(restaurant)}
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
                          {selectedRestaurant?.id === restaurant.id && (
                            <div className="text-primary font-medium">✓</div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Dish Selection Step */}
          {currentStep === 'dishes' && selectedRestaurant && (
            <div className="flex-1 overflow-hidden">
              <div className="mb-4 p-3 bg-muted/30 rounded">
                <div className="font-medium">{selectedRestaurant.name}</div>
                <div className="text-sm text-muted-foreground">{selectedRestaurant.address}</div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep('restaurant')}
                  className="mt-2 text-xs"
                >
                  ← Endre restaurant
                </Button>
              </div>

              <div className="mb-4">
                <div className="text-sm font-medium mb-2">
                  Velg retter ({selectedDishes.length} valgt - minst 1 påkrevd)
                </div>
                {selectedDishes.length === 0 && (
                  <div className="text-xs text-muted-foreground bg-yellow-50 p-2 rounded border border-yellow-200">
                    ⚠️ Du må velge minst én rett for å kunne lagre stoppet
                  </div>
                )}
              </div>

              <ScrollArea className="h-80">
                {loading ? (
                  <div className="text-center py-8">Laster retter...</div>
                ) : (
                  <div className="grid gap-2 p-1">
                    {restaurantDishes.map((dish) => (
                      <Card 
                        key={dish.id} 
                        className={`cursor-pointer transition-colors ${
                          selectedDishes.includes(dish.id)
                            ? 'bg-primary/10 border-primary' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => handleToggleDish(dish.id)}
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
                            {selectedDishes.includes(dish.id) && (
                              <div className="text-primary font-medium">✓</div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          )}

          <Separator />
          
          <div className="flex justify-between gap-2 pt-2">
            <Button variant="outline" onClick={resetDialog}>
              Avbryt
            </Button>
            <div className="flex gap-2">
              {currentStep === 'dishes' && (
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep('restaurant')}
                >
                  Tilbake
                </Button>
              )}
              <Button 
                onClick={handleSaveStop}
                disabled={!selectedRestaurant || selectedDishes.length === 0}
              >
                {editingStopIndex >= 0 ? 'Oppdater stopp' : 'Legg til stopp'}
              </Button>
            </div>
          </div>
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