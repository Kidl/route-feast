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
import { X, Plus, Upload, Image as ImageIcon } from "lucide-react";
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
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
      setImagePreview(route.image_url || null);
      setImageFile(null);
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
      setImagePreview(null);
      setImageFile(null);
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

  const handleImageUpload = async (file: File): Promise<string | null> => {
    try {
      setUploadingImage(true);
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('route-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('route-images')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Feil",
        description: "Kunne ikke laste opp bildet.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Ugyldig filtype",
          description: "Vennligst velg en bildefil.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Fil for stor",
          description: "Bildet må være mindre enn 5MB.",
          variant: "destructive",
        });
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    form.setValue("image_url", "");
  };

  const onSubmit = async (data: RouteFormData) => {
    try {
      setLoading(true);
      
      let imageUrl = data.image_url;
      
      // Upload new image if selected
      if (imageFile) {
        const uploadedUrl = await handleImageUpload(imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }
      
      const routeData = {
        name: data.name,
        description: data.description,
        price_nok: data.price_nok,
        duration_hours: data.duration_hours,
        max_capacity: data.max_capacity,
        location: data.location,
        image_url: imageUrl || null,
        is_active: data.is_active,
        highlights,
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
              <Label>Rutebilde</Label>
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="relative inline-block">
                  <img 
                    src={imagePreview} 
                    alt="Route preview" 
                    className="w-32 h-24 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={removeImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              {/* File Upload */}
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="image-upload"
                />
                <Label
                  htmlFor="image-upload"
                  className="flex items-center gap-2 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  {uploadingImage ? "Laster opp..." : "Velg bilde"}
                </Label>
                
                {/* URL Input as alternative */}
                <Input
                  placeholder="Eller skriv inn bilde-URL"
                  {...form.register("image_url")}
                  className="flex-1"
                />
              </div>
              
              <p className="text-xs text-muted-foreground">
                Maksimal filstørrelse: 5MB. Støttede formater: JPG, PNG, WebP
              </p>
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