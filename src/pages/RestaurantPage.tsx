import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MapPin, Clock, Phone, Mail, Star, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Restaurant {
  id: string;
  name: string;
  description: string;
  cuisine_type: string;
  address: string;
  city: string;
  tags: string[];
  phone?: string;
  email?: string;
  lat?: number;
  lng?: number;
  opening_hours?: any;
}

const RestaurantPage = () => {
  const { restaurantId } = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!restaurantId) return;
      
      try {
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', restaurantId)
          .eq('status', 'active')
          .maybeSingle();

        if (error) throw error;
        setRestaurant(data);
      } catch (error) {
        console.error('Error fetching restaurant:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [restaurantId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Laster restaurant...</p>
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
          <Link to="/restaurants">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tilbake til restauranter
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden bg-gradient-card">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-12 h-12 text-primary-foreground" />
            </div>
            <p className="text-lg text-muted-foreground">{restaurant.cuisine_type}</p>
          </div>
        </div>
        
        <div className="absolute inset-0 bg-black/40 flex items-end">
          <div className="container mx-auto px-4 pb-8 text-white">
            <div className="max-w-4xl">
              <div className="flex items-center gap-2 mb-3">
                {restaurant.tags.includes('michelin') && (
                  <Badge className="bg-yellow-500 text-white border-yellow-600">
                    <Star className="w-3 h-3 mr-1" />
                    Michelin
                  </Badge>
                )}
                <Badge className="bg-white/20 text-white border-white/30">
                  <MapPin className="w-3 h-3 mr-1" />
                  {restaurant.city}
                </Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{restaurant.name}</h1>
              <p className="text-xl text-white/90 max-w-2xl leading-relaxed">
                {restaurant.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Om restauranten
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {restaurant.description}
                </p>
                
                {restaurant.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-3">Spesialiteter & Utmerkelser:</h4>
                    <div className="flex flex-wrap gap-2">
                      {restaurant.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="capitalize">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Opening Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Åpningstider
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Mandag - Torsdag</span>
                    <span className="text-sm text-muted-foreground">17:00 - 23:00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Fredag - Lørdag</span>
                    <span className="text-sm text-muted-foreground">17:00 - 00:00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Søndag</span>
                    <span className="text-sm text-muted-foreground">Stengt</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Lokasjon
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Kart kommer snart</p>
                    <p className="text-xs">{restaurant.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Kontakt & Reservasjon</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Adresse</p>
                      <p className="text-muted-foreground">{restaurant.address}</p>
                    </div>
                  </div>
                  
                  {restaurant.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Telefon</p>
                        <p className="text-muted-foreground">{restaurant.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {restaurant.email && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">E-post</p>
                        <p className="text-muted-foreground">{restaurant.email}</p>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <Link to={`/restaurant/${restaurant.id}/menu`}>
                    <Button variant="secondary" size="lg" className="w-full">
                      Se digital meny
                    </Button>
                  </Link>
                  
                  <Button size="lg" className="w-full">
                    Reserver bord
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Ring for reservasjon eller bruk vår online booking
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export { RestaurantPage as default };