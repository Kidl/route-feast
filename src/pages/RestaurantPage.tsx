import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MapPin, 
  Phone, 
  Globe, 
  Clock, 
  Star, 
  ChefHat,
  ArrowLeft,
  ExternalLink,
  Eye,
  ArrowRight
} from "lucide-react";
import { Header } from "@/components/Header";
import { RestaurantGallery } from "@/components/restaurant/RestaurantGallery";
import { RestaurantMap } from "@/components/restaurant/RestaurantMap";
import { MenuPreview } from "@/components/restaurant/MenuPreview";

interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  phone: string;
  email: string;
  website: string;
  opening_hours: any;
  status: string;
  images: {
    url: string;
    alt_text: string;
    is_cover: boolean;
  }[];
}

export const RestaurantPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        
        // For now, fetch by ID (in production this would be by slug)
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select(`
            *,
            restaurant_images!inner(url, alt_text, is_cover)
          `)
          .eq('id', slug)
          .eq('status', 'active')
          .single();

        if (restaurantError) throw restaurantError;

        if (restaurantData) {
          setRestaurant({
            ...restaurantData,
            images: restaurantData.restaurant_images || []
          });
        }
      } catch (err) {
        console.error('Error fetching restaurant:', err);
        setError('Restaurant ikke funnet');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [slug]);

  const handleBookRoute = () => {
    // Navigate to routes that include this restaurant
    navigate(`/routes?restaurant=${restaurant?.id}`);
  };

  const openInMaps = () => {
    if (restaurant?.lat && restaurant?.lng) {
      const url = `https://maps.google.com?q=${restaurant.lat},${restaurant.lng}`;
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-24">
          <div className="space-y-6">
            <Skeleton className="h-12 w-1/3" />
            <Skeleton className="h-64 w-full" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-24">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {error || 'Restaurant ikke funnet'}
            </h1>
            <Button onClick={() => navigate('/')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tilbake til forsiden
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-8">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tilbake til ruter
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Restaurant Header */}
              <div>
                <h1 className="text-4xl md:text-5xl font-bold font-heading text-foreground mb-4">
                  {restaurant.name}
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  {restaurant.description}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {restaurant.city}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Premium kvalitet
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <ChefHat className="w-3 h-3" />
                    Norsk kjøkken
                  </Badge>
                </div>
              </div>

              {/* Gallery */}
              <RestaurantGallery images={restaurant.images} restaurantName={restaurant.name} />

              {/* Menu Preview */}
              <MenuPreview restaurantId={restaurant.id} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Book Route CTA */}
              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold font-heading text-foreground mb-2">
                      Opplev denne restauranten
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Book en kulinarisk rute som inkluderer {restaurant.name}
                    </p>
                    <Button 
                      onClick={handleBookRoute} 
                      className="w-full"
                      size="lg"
                    >
                      Se tilgjengelige ruter
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Map */}
              <RestaurantMap 
                restaurant={{
                  name: restaurant.name,
                  address: restaurant.address,
                  lat: restaurant.lat,
                  lng: restaurant.lng
                }}
                onOpenInMaps={openInMaps}
              />

              {/* Contact Information */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold font-heading text-foreground mb-4">
                    Kontaktinformasjon
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-foreground font-medium">Adresse</p>
                        <p className="text-sm text-muted-foreground">
                          {restaurant.address}
                          {restaurant.city && `, ${restaurant.city}`}
                        </p>
                      </div>
                    </div>

                    {restaurant.phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-foreground font-medium">Telefon</p>
                          <a 
                            href={`tel:${restaurant.phone}`}
                            className="text-sm text-primary hover:underline"
                          >
                            {restaurant.phone}
                          </a>
                        </div>
                      </div>
                    )}

                    {restaurant.website && (
                      <div className="flex items-start gap-3">
                        <Globe className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-foreground font-medium">Nettside</p>
                          <a 
                            href={restaurant.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline flex items-center gap-1"
                          >
                            Besøk nettside
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    )}

                    {restaurant.opening_hours && Object.keys(restaurant.opening_hours).length > 0 && (
                      <div className="flex items-start gap-3">
                        <Clock className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-foreground font-medium">Åpningstider</p>
                          <p className="text-sm text-muted-foreground">
                            Se åpningstider på deres nettside
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Digital Menu Link */}
              <Card>
                <CardContent className="p-6">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate(`/restaurants/${restaurant.id}/menu`)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Se full digitalmeny
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};