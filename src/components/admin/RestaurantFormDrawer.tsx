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
import { X, Upload, Plus, MapPin, ChefHat, Tag } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const restaurantSchema = z.object({
  name: z.string().min(1, "Navn er påkrevd"),
  description: z.string().optional(),
  address: z.string().min(1, "Adresse er påkrevd"),
  city: z.string().optional(),
  country: z.string().default("Norway"),
  phone: z.string().optional(),
  email: z.string().email("Ugyldig e-postadresse").optional().or(z.literal("")),
  website: z.string().url("Ugyldig URL").optional().or(z.literal("")),
  lat: z.number().optional(),
  lng: z.number().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
  cuisine_type: z.string().optional(),
  tags: z.string().optional(),
});

type RestaurantFormData = z.infer<typeof restaurantSchema>;

interface RestaurantFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurant?: any;
  onSave: () => void;
}

export function RestaurantFormDrawer({ open, onOpenChange, restaurant, onSave }: RestaurantFormDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [availableCuisines] = useState([
    "Asian", "Italian", "Nordic", "French", "American", "Mexican", "Indian", "Mediterranean", 
    "Japanese", "Chinese", "Thai", "Vietnamese", "Korean", "Middle Eastern", "Seafood", "International"
  ]);
  const [availableTags] = useState([
    "fine-dining", "casual", "upscale", "cozy", "modern", "traditional", "family-friendly", "romantic",
    "outdoor-seating", "vegan-friendly", "gluten-free", "organic", "farm-to-table", "wine-bar",
    "cocktails", "breakfast", "brunch", "lunch", "dinner", "late-night", "takeaway", "delivery"
  ]);
  const { toast } = useToast();

  const form = useForm<RestaurantFormData>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      city: "",
      country: "Norway",
      phone: "",
      email: "",
      website: "",
      lat: undefined,
      lng: undefined,
      status: "active",
      cuisine_type: "",
      tags: "",
    },
  });

  useEffect(() => {
    if (restaurant) {
      form.reset({
        name: restaurant.name,
        description: restaurant.description || "",
        address: restaurant.address,
        city: restaurant.city || "",
        country: restaurant.country || "Norway",
        phone: restaurant.phone || "",
        email: restaurant.email || "",
        website: restaurant.website || "",
        lat: restaurant.lat,
        lng: restaurant.lng,
        status: restaurant.status,
        cuisine_type: restaurant.cuisine_type || "",
        tags: restaurant.tags ? restaurant.tags.join(", ") : "",
      });
      setExistingImages(restaurant.restaurant_images || []);
      setTagInput(restaurant.tags ? restaurant.tags.join(", ") : "");
    } else {
      form.reset({
        name: "",
        description: "",
        address: "",
        city: "",
        country: "Norway",
        phone: "",
        email: "",
        website: "",
        lat: undefined,
        lng: undefined,
        status: "active",
        cuisine_type: "",
        tags: "",
      });
      setExistingImages([]);
      setTagInput("");
    }
    setImageFiles([]);
    setImagePreviews([]);
  }, [restaurant, form]);

  const handleImageUpload = async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('restaurant-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('restaurant-images')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    });

    return Promise.all(uploadPromises);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate files
    const invalidFiles = files.filter(file => !file.type.startsWith('image/') || file.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      toast({
        title: "Ugyldige filer",
        description: "Alle filer må være bilder under 5MB.",
        variant: "destructive",
      });
      return;
    }

    setImageFiles(prev => [...prev, ...files]);
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setImageFiles(prev => prev.filter((_, i) => i !== index));
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
    }
  };

  const setCoverImage = async (imageId: string) => {
    try {
      // First, remove cover from all images
      await supabase
        .from('restaurant_images')
        .update({ is_cover: false })
        .eq('restaurant_id', restaurant.id);

      // Then set the selected image as cover
      await supabase
        .from('restaurant_images')
        .update({ is_cover: true })
        .eq('id', imageId);

      toast({
        title: "Suksess",
        description: "Forsidebilde oppdatert.",
      });

      onSave();
    } catch (error) {
      console.error("Error updating cover image:", error);
      toast({
        title: "Feil",
        description: "Kunne ikke oppdatere forsidebilde.",
        variant: "destructive",
      });
    }
  };

  const geocodeAddress = async (address: string) => {
    // Placeholder for geocoding - would integrate with a real service
    toast({
      title: "Geokoding",
      description: "Geokoding-funksjonalitet kommer snart. Vennligst angi koordinater manuelt.",
    });
  };

  const onSubmit = async (data: RestaurantFormData) => {
    try {
      setLoading(true);
      
      // Upload new images if any
      let uploadedImageUrls: string[] = [];
      if (imageFiles.length > 0) {
        setUploadingImages(true);
        uploadedImageUrls = await handleImageUpload(imageFiles);
      }

      // Parse tags from comma-separated string
      const tags = tagInput
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const restaurantData = {
        name: data.name,
        description: data.description || null,
        address: data.address,
        city: data.city || null,
        country: data.country,
        phone: data.phone || null,
        email: data.email || null,
        website: data.website || null,
        lat: data.lat || null,
        lng: data.lng || null,
        status: data.status,
        cuisine_type: data.cuisine_type || null,
        tags: tags.length > 0 ? tags : null,
      };

      let restaurantId: string;

      if (restaurant) {
        // Update existing restaurant
        const { error } = await supabase
          .from("restaurants")
          .update(restaurantData)
          .eq("id", restaurant.id);

        if (error) throw error;
        restaurantId = restaurant.id;

        toast({
          title: "Suksess",
          description: "Restauranten er oppdatert.",
        });
      } else {
        // Create new restaurant
        const { data: newRestaurant, error } = await supabase
          .from("restaurants")
          .insert(restaurantData)
          .select()
          .single();

        if (error) throw error;
        restaurantId = newRestaurant.id;

        toast({
          title: "Suksess",
          description: "Ny restaurant er opprettet.",
        });
      }

      // Add new images to database
      if (uploadedImageUrls.length > 0) {
        const imageData = uploadedImageUrls.map((url, index) => ({
          restaurant_id: restaurantId,
          url,
          is_cover: existingImages.length === 0 && index === 0, // First image as cover if no existing images
        }));

        const { error: imageError } = await supabase
          .from('restaurant_images')
          .insert(imageData);

        if (imageError) throw imageError;
      }

      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving restaurant:", error);
      toast({
        title: "Feil",
        description: "Kunne ikke lagre restauranten.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-w-4xl mx-auto max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>
            {restaurant ? "Rediger restaurant" : "Opprett ny restaurant"}
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
                  placeholder="Restaurantens navn"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  {...form.register("phone")}
                  placeholder="+47 12 34 56 78"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beskrivelse</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Beskriv restauranten..."
                rows={3}
              />
            </div>

            {/* Cuisine Type and Tags */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cuisine_type" className="flex items-center gap-2">
                  <ChefHat className="h-4 w-4" />
                  Kjøkkentype
                </Label>
                <Select
                  value={form.watch("cuisine_type") || ""}
                  onValueChange={(value) => form.setValue("cuisine_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Velg kjøkkentype..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCuisines.map(cuisine => (
                      <SelectItem key={cuisine} value={cuisine}>
                        {cuisine}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags" className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </Label>
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Skriv tags adskilt med komma..."
                />
                <div className="flex flex-wrap gap-1 mt-1">
                  {availableTags.slice(0, 8).map(tag => (
                    <Button
                      key={tag}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => {
                        const currentTags = tagInput.split(",").map(t => t.trim()).filter(t => t);
                        if (!currentTags.includes(tag)) {
                          setTagInput(currentTags.length > 0 ? `${tagInput}, ${tag}` : tag);
                        }
                      }}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Klikk på foreslåtte tags eller skriv egne adskilt med komma
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-post</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder="post@restaurant.no"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Nettside</Label>
                <Input
                  id="website"
                  {...form.register("website")}
                  placeholder="https://restaurant.no"
                />
                {form.formState.errors.website && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.website.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <Label>Adresse *</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Input
                    {...form.register("address")}
                    placeholder="Gateadresse"
                  />
                  {form.formState.errors.address && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.address.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Input
                    {...form.register("city")}
                    placeholder="By"
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => geocodeAddress(form.getValues("address"))}
                className="gap-2"
              >
                <MapPin className="h-4 w-4" />
                Finn koordinater
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lat">Breddegrad</Label>
                <Input
                  id="lat"
                  type="number"
                  step="any"
                  {...form.register("lat", { valueAsNumber: true })}
                  placeholder="59.911491"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lng">Lengdegrad</Label>
                <Input
                  id="lng"
                  type="number"
                  step="any"
                  {...form.register("lng", { valueAsNumber: true })}
                  placeholder="10.757933"
                />
              </div>
            </div>

            {/* Image Gallery */}
            <div className="space-y-4">
              <Label>Bilder</Label>
              
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                  {existingImages.map((image, index) => (
                    <div key={image.id} className="relative">
                      <img 
                        src={image.url} 
                        alt="Restaurant" 
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      {image.is_cover && (
                        <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                          Forside
                        </div>
                      )}
                      <div className="absolute top-1 right-1 flex gap-1">
                        {!image.is_cover && (
                          <Button
                            type="button"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => setCoverImage(image.id)}
                          >
                            ⭐
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => removeImage(index, true)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* New Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={preview} 
                        alt="Preview" 
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={() => removeImage(index, false)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* File Upload */}
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="image-upload"
                />
                <Label
                  htmlFor="image-upload"
                  className="flex items-center gap-2 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  {uploadingImages ? "Laster opp..." : "Legg til bilder"}
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Maksimal filstørrelse: 5MB per bilde. Støttede formater: JPG, PNG, WebP
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="status"
                checked={form.watch("status") === "active"}
                onCheckedChange={(checked) => form.setValue("status", checked ? "active" : "inactive")}
              />
              <Label htmlFor="status">Aktiv restaurant</Label>
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
                {loading ? "Lagrer..." : restaurant ? "Oppdater" : "Opprett"}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
