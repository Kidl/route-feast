import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import { RouteBuilder } from "./RouteBuilder";

interface RouteStop {
  id?: string;
  restaurant_id: string;
  dish_ids: string[];
  order_index: number;
  time_override_min?: number;
  restaurant?: any;
  dishes?: any[];
}

const routeSchema = z.object({
  name: z.string().min(1, "Navn er påkrevd"),
  description: z.string().min(1, "Beskrivelse er påkrevd"),
  location: z.string().min(1, "Lokasjon er påkrevd"),
  price_nok: z.number().min(0, "Prisen må være positiv"),
  duration_hours: z.number().min(0.5, "Varighet må være minst 0.5 timer"),
  max_capacity: z.number().min(1, "Kapasitet må være minst 1"),
  image_url: z.string().optional(),
  is_active: z.boolean(),
  highlights: z.array(z.string()).optional(),
});

type RouteFormData = z.infer<typeof routeSchema>;

interface RouteFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  route?: any;
  onSave: () => void;
}

export function RouteFormDrawer({ open, onOpenChange, route, onSave }: RouteFormDrawerProps) {
  const [highlights, setHighlights] = useState<string[]>([]);
  const [newHighlight, setNewHighlight] = useState("");
  const [routeStops, setRouteStops] = useState<RouteStop[]>([]);
  const { toast } = useToast();
  
  const form = useForm<RouteFormData>({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
      price_nok: 0,
      duration_hours: 3,
      max_capacity: 12,
      image_url: "",
      is_active: true,
      highlights: [],
    },
  });

  // Initialize form when drawer opens or route changes
  useEffect(() => {
    if (open) {
      if (route) {
        // Editing existing route - convert price from øre to kroner
        const priceInKroner = route.price_nok ? route.price_nok / 100 : 0;
        
        form.reset({
          name: route.name || "",
          description: route.description || "",
          location: route.location || "",
          price_nok: priceInKroner,
          duration_hours: route.duration_hours || 3,
          max_capacity: route.max_capacity || 12,
          image_url: route.image_url || "",
          is_active: route.is_active ?? true,
          highlights: route.highlights || [],
        });
        setHighlights(route.highlights || []);
        loadRouteStops(route.id);
      } else {
        // Creating new route
        form.reset({
          name: "",
          description: "",
          location: "Stavanger Sentrum",
          price_nok: 0,
          duration_hours: 3,
          max_capacity: 12,
          image_url: "/src/assets/route-urban.jpg",
          is_active: true,
          highlights: [],
        });
        setHighlights([]);
        setRouteStops([]);
      }
    }
  }, [open, route, form]);

  const loadRouteStops = async (routeId: string) => {
    try {
      const { data, error } = await supabase
        .from("route_stops")
        .select(`
          *,
          restaurants(*),
          dishes(*)
        `)
        .eq("route_id", routeId)
        .order("order_index");

      if (error) throw error;
      
      // Group by restaurant and order_index, collect dishes
      const groupedStops = data?.reduce((acc, stop) => {
        const key = `${stop.restaurant_id}-${stop.order_index}`;
        if (!acc[key]) {
          acc[key] = {
            restaurant_id: stop.restaurant_id,
            dish_ids: [],
            order_index: stop.order_index,
            time_override_min: stop.time_override_min,
            restaurant: stop.restaurants,
            dishes: []
          };
        }
        if (stop.dishes) {
          acc[key].dish_ids.push(stop.dishes.id);
          acc[key].dishes.push(stop.dishes);
        }
        return acc;
      }, {} as Record<string, RouteStop>) || {};
      
      setRouteStops(Object.values(groupedStops));
    } catch (error) {
      console.error("Error loading route stops:", error);
    }
  };

  const addHighlight = () => {
    if (newHighlight.trim() && !highlights.includes(newHighlight.trim())) {
      const updated = [...highlights, newHighlight.trim()];
      setHighlights(updated);
      form.setValue("highlights", updated);
      setNewHighlight("");
    }
  };

  const removeHighlight = (highlight: string) => {
    const updated = highlights.filter(h => h !== highlight);
    setHighlights(updated);
    form.setValue("highlights", updated);
  };

  const onSubmit = async (data: RouteFormData) => {
    try {
      // Calculate total duration from route stops
      const totalMinutes = routeStops.reduce((total, stop) => total + (stop.time_override_min || 30), 0);
      const calculatedDuration = totalMinutes / 60; // Convert to hours
      
      const routeData = {
        name: data.name,
        description: data.description,
        location: data.location,
        price_nok: Math.round(data.price_nok * 100), // Convert to øre
        duration_hours: calculatedDuration > 0 ? calculatedDuration : data.duration_hours,
        max_capacity: data.max_capacity,
        image_url: data.image_url,
        is_active: data.is_active,
        highlights: highlights,
        status: 'active'
      };

      let result;
      if (route) {
        result = await supabase
          .from("routes")
          .update(routeData)
          .eq("id", route.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from("routes")
          .insert([routeData])
          .select()
          .single();
      }

      if (result.error) throw result.error;

      const savedRoute = result.data;

      // Save route stops
      if (routeStops.length > 0) {
        // Delete existing stops if updating
        if (route) {
          await supabase
            .from("route_stops")
            .delete()
            .eq("route_id", route.id);
        }

        // Insert new stops - flatten dish_ids to individual entries
        const stopsData = routeStops.flatMap(stop => 
          stop.dish_ids.map(dishId => ({
            route_id: savedRoute.id,
            restaurant_id: stop.restaurant_id,
            dish_id: dishId,
            order_index: stop.order_index,
            time_override_min: stop.time_override_min,
          }))
        );

        const { error: stopsError } = await supabase
          .from("route_stops")
          .insert(stopsData);

        if (stopsError) throw stopsError;
      }

      toast({
        title: "Suksess",
        description: `Ruten er ${route ? "oppdatert" : "opprettet"}.`,
      });
      
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving route:", error);
      toast({
        title: "Feil",
        description: "Kunne ikke lagre ruten.",
        variant: "destructive",
      });
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[95vh] flex flex-col">
        <DrawerHeader className="flex-shrink-0">
          <DrawerTitle>{route ? "Rediger rute" : "Ny rute"}</DrawerTitle>
          <DrawerDescription>
            {route ? "Oppdater ruteinformasjon og rutestopp" : "Opprett en ny kulinarisk rute med restauranter og meny"}
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="flex-1 px-4 pb-4 overflow-y-auto">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Navn *</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="Rute navn"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Lokasjon *</Label>
                <Input
                  id="location"
                  {...form.register("location")}
                  placeholder="Stavanger Sentrum"
                />
                {form.formState.errors.location && (
                  <p className="text-sm text-destructive">{form.formState.errors.location.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beskrivelse *</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Beskriv den kulinariske opplevelsen..."
                rows={3}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price_nok">Pris (NOK) *</Label>
                <Input
                  id="price_nok"
                  type="number"
                  step="0.01"
                  {...form.register("price_nok", { valueAsNumber: true })}
                  placeholder="599"
                />
                {form.formState.errors.price_nok && (
                  <p className="text-sm text-destructive">{form.formState.errors.price_nok.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration_hours">Varighet (timer) *</Label>
                <Input
                  id="duration_hours"
                  type="number"
                  step="0.5"
                  {...form.register("duration_hours", { valueAsNumber: true })}
                  placeholder="3"
                />
                {form.formState.errors.duration_hours && (
                  <p className="text-sm text-destructive">{form.formState.errors.duration_hours.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="max_capacity">Kapasitet *</Label>
                <Input
                  id="max_capacity"
                  type="number"
                  {...form.register("max_capacity", { valueAsNumber: true })}
                  placeholder="12"
                />
                {form.formState.errors.max_capacity && (
                  <p className="text-sm text-destructive">{form.formState.errors.max_capacity.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">Bilde URL</Label>
              <Input
                id="image_url"
                {...form.register("image_url")}
                placeholder="/src/assets/route-urban.jpg"
              />
            </div>

            <Separator className="my-6" />

            {/* ROUTE BUILDER SECTION - MOST IMPORTANT */}
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/30 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-primary rounded-full animate-pulse"></div>
                <h3 className="text-xl font-bold text-primary">🏪 RUTESTOPP - RESTAURANT & MENY</h3>
              </div>
              <p className="text-sm font-medium text-foreground">
                Dette er hovedfunksjonen! Velg restauranter og retter som utgjør ruten din.
                Klikk på "Legg til stopp" for å begynne å bygge ruten.
              </p>
              <div className="min-h-[300px] bg-background rounded-lg border-2 border-dashed border-primary/30 p-6">
                <RouteBuilder 
                  value={routeStops} 
                  onChange={(stops) => {
                    console.log("🔄 RouteBuilder onChange called with:", stops.length, "stops");
                    setRouteStops(stops);
                  }} 
                />
              </div>
              <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                💡 Tips: Hver rute bør ha minst 2-3 stopp for en komplett opplevelse. 
                Du kan justere tiden på hvert stopp for å tilpasse varigheten.
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-2">
              <Label>Høydepunkter</Label>
              <div className="flex gap-2">
                <Input
                  value={newHighlight}
                  onChange={(e) => setNewHighlight(e.target.value)}
                  placeholder="Legg til høydepunkt..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHighlight())}
                />
                <Button type="button" onClick={addHighlight} variant="outline">
                  Legg til
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {highlights.map((highlight, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {highlight}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeHighlight(highlight)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={form.watch("is_active")}
                onCheckedChange={(checked) => form.setValue("is_active", checked)}
              />
              <Label htmlFor="is_active">Aktiv rute</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Avbryt
              </Button>
              <Button type="submit" className="flex-1">
                {route ? "Oppdater" : "Opprett"}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}