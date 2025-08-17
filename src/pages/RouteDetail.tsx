import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MapPin, Clock, Users, Star, Award, ChefHat } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BookingDialog } from "@/components/booking/BookingDialog";
import { Restaurant } from "@/data/mockRoutes";
import { useToast } from "@/hooks/use-toast";

interface DetailedRoute {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price_nok: number;
  duration_hours: number;
  max_capacity: number;
  location: string;
  highlights: string[];
  restaurants: Restaurant[];
}

const RouteDetail = () => {
  const { routeId } = useParams();
  const navigate = useNavigate();
  const [route, setRoute] = useState<DetailedRoute | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRoute = async () => {
      if (!routeId) return;
      
      try {
        const { data, error } = await supabase
          .from('routes')
          .select('*')
          .eq('id', routeId)
          .eq('is_active', true)
          .maybeSingle();

        if (error) throw error;
        
        if (!data) {
          toast({
            title: "Route not found",
            description: "The requested route could not be found.",
            variant: "destructive"
          });
          navigate('/');
          return;
        }

        setRoute({
          ...data,
          restaurants: (data.restaurants as unknown) as Restaurant[] || [],
          highlights: data.highlights || []
        });
      } catch (error) {
        console.error('Error fetching route:', error);
        toast({
          title: "Error",
          description: "Could not load route details.",
          variant: "destructive"
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [routeId, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading route details...</p>
        </div>
      </div>
    );
  }

  if (!route) {
    return null;
  }

  const price = Math.round(route.price_nok / 100);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Routes
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
        <img 
          src={route.image_url} 
          alt={route.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-end">
          <div className="container mx-auto px-4 pb-8 text-white">
            <div className="max-w-4xl">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-white/20 text-white border-white/30">
                  {route.duration_hours} hours
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  <MapPin className="w-3 h-3 mr-1" />
                  {route.location}
                </Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{route.name}</h1>
              <p className="text-xl text-white/90 max-w-2xl leading-relaxed">
                {route.description}
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
            {/* Highlights */}
            {route.highlights.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary" />
                    Experience Highlights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {route.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                        <Award className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Restaurants */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-primary" />
                  Featured Restaurants ({route.restaurants.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {route.restaurants.map((restaurant, index) => (
                  <div key={index} className="border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                          {restaurant.name}
                          {restaurant.michelinMentioned && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                        </h3>
                        <p className="text-muted-foreground">{restaurant.cuisine}</p>
                      </div>
                      {restaurant.michelinMentioned && (
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          Michelin Mentioned
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {restaurant.description}
                    </p>
                    
                    {restaurant.specialties && restaurant.specialties.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Specialties:</h4>
                        <div className="flex flex-wrap gap-1">
                          {restaurant.specialties.map((specialty, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* What to Expect */}
            <Card>
              <CardHeader>
                <CardTitle>What to Expect</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <ul className="space-y-2">
                  <li>🕐 <strong>Duration:</strong> Approximately {route.duration_hours} hours of culinary exploration</li>
                  <li>🚶 <strong>Transportation:</strong> Walking between restaurants with guided routes</li>
                  <li>👥 <strong>Group Size:</strong> Maximum {route.max_capacity} people for intimate dining</li>
                  <li>📱 <strong>Check-in:</strong> Show your QR code at the first restaurant to begin</li>
                  <li>🍽️ <strong>Dining:</strong> Curated menu selections at each restaurant</li>
                  <li>📍 <strong>Location:</strong> All restaurants located in {route.location}</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-2xl">Book This Route</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{price} NOK</div>
                  <p className="text-sm text-muted-foreground">per person</p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Duration
                    </span>
                    <span>{route.duration_hours} hours</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Max Capacity
                    </span>
                    <span>{route.max_capacity} people</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location
                    </span>
                    <span>{route.location}</span>
                  </div>
                </div>

                <Separator />

                <Button 
                  onClick={() => setBookingOpen(true)}
                  size="lg" 
                  className="w-full"
                >
                  Book Now
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Free cancellation up to 24 hours before the experience
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Dialog */}
      <BookingDialog 
        route={{
          id: route.id,
          name: route.name,
          description: route.description,
          image: route.image_url,
          price: price,
          duration: `${route.duration_hours} hours`,
          maxCapacity: route.max_capacity,
          currentBookings: Math.floor(route.max_capacity * 0.6), // Simulate bookings
          rating: 4.8,
          restaurants: route.restaurants,
          location: route.location,
          highlights: route.highlights
        }}
        open={bookingOpen}
        onOpenChange={setBookingOpen}
      />
    </div>
  );
};

export default RouteDetail;