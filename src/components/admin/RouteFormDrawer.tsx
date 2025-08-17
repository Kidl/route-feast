import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const routeSchema = z.object({
  name: z.string().min(1, "Navn er påkrevd"),
  description: z.string().min(1, "Beskrivelse er påkrevd"),
  price_nok: z.number().min(1, "Pris må være større enn 0"),
  duration_hours: z.number().min(0.5, "Varighet må være minst 0.5 timer"),
  max_capacity: z.number().min(1, "Kapasitet må være minst 1"),
  location: z.string().min(1, "Lokasjon er påkrevd"),
  image_url: z.string().optional(),
  is_active: z.boolean().default(true),
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
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<RouteFormData>({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      name: "",
      description: "",
      price_nok: 0,
      duration_hours: 4,
      max_capacity: 20,
      location: "",
      image_url: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (route) {
      form.reset({
        name: route.name,
        description: route.description,
        price_nok: route.price_nok,
        duration_hours: route.duration_hours,
        max_capacity: route.max_capacity,
        location: route.location,
        image_url: route.image_url || "",
        is_active: route.is_active,
      });
      setHighlights(route.highlights || []);
    } else {
      form.reset({
        name: "",
        description: "",
        price_nok: 0,
        duration_hours: 4,
        max_capacity: 20,
        location: "",
        image_url: "",
        is_active: true,
      });
      setHighlights([]);
    }
  }, [route, form]);

  const addHighlight = () => {
    if (newHighlight.trim() && !highlights.includes(newHighlight.trim())) {
      setHighlights([...highlights, newHighlight.trim()]);
      setNewHighlight("");
    }
  };

  const removeHighlight = (highlight: string) => {
    setHighlights(highlights.filter(h => h !== highlight));
  };

  const onSubmit = async (data: RouteFormData) => {
    try {
      setLoading(true);
      
      const routeData = {
        name: data.name,
        description: data.description,
        price_nok: data.price_nok,
        duration_hours: data.duration_hours,
        max_capacity: data.max_capacity,
        location: data.location,
        image_url: data.image_url || null,
        is_active: data.is_active,
        highlights,
        restaurants: route?.restaurants || [],
      };

      if (route) {
        // Update existing route
        const { error } = await supabase
          .from("routes")
          .update(routeData)
          .eq("id", route.id);

        if (error) throw error;

        toast({
          title: "Suksess",
          description: "Ruten er oppdatert.",
        });
      } else {
        // Create new route
        const { error } = await supabase
          .from("routes")
          .insert(routeData);

        if (error) throw error;

        toast({
          title: "Suksess",
          description: "Ny rute er opprettet.",
        });
      }

      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving route:", error);
      toast({
        title: "Feil",
        description: "Kunne ikke lagre ruten.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-w-2xl mx-auto max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>
            {route ? "Rediger rute" : "Opprett ny rute"}
          </DrawerTitle>
        </DrawerHeader>
        
        <div className="p-6 overflow-auto">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Navn *</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="Rutens navn"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Lokasjon *</Label>
                <Input
                  id="location"
                  {...form.register("location")}
                  placeholder="F.eks. Stavanger Sentrum"
                />
                {form.formState.errors.location && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.location.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beskrivelse *</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Beskriv ruten..."
                rows={3}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price_nok">Pris (NOK) *</Label>
                <Input
                  id="price_nok"
                  type="number"
                  {...form.register("price_nok", { valueAsNumber: true })}
                />
                {form.formState.errors.price_nok && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.price_nok.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration_hours">Varighet (timer) *</Label>
                <Input
                  id="duration_hours"
                  type="number"
                  step="0.5"
                  {...form.register("duration_hours", { valueAsNumber: true })}
                />
                {form.formState.errors.duration_hours && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.duration_hours.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_capacity">Kapasitet *</Label>
                <Input
                  id="max_capacity"
                  type="number"
                  {...form.register("max_capacity", { valueAsNumber: true })}
                />
                {form.formState.errors.max_capacity && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.max_capacity.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">Bilde URL</Label>
              <Input
                id="image_url"
                {...form.register("image_url")}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="space-y-4">
              <Label>Høydepunkter</Label>
              <div className="flex gap-2">
                <Input
                  value={newHighlight}
                  onChange={(e) => setNewHighlight(e.target.value)}
                  placeholder="Legg til høydepunkt"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addHighlight();
                    }
                  }}
                />
                <Button type="button" onClick={addHighlight} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {highlights.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {highlights.map((highlight, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {highlight}
                      <button
                        type="button"
                        onClick={() => removeHighlight(highlight)}
                        className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
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
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Avbryt
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Lagrer..." : route ? "Oppdater" : "Opprett"}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}