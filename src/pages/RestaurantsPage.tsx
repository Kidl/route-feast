import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock, Users, ArrowRight } from "lucide-react";
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
  status: string;
}

const RestaurantsPage = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('status', 'active')
          .order('name');

        if (error) throw error;
        setRestaurants(data || []);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const filteredRestaurants = restaurants.filter(restaurant => 
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.cuisine_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Laster restauranter...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-hero text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-heading mb-6">
            Utforsk Stavangers restauranter
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
            Oppdag byens beste spisesteder, fra Michelin-stjernede restauranter til lokale perler
          </p>
          
          {/* Search */}
          <div className="max-w-xl mx-auto mb-8">
            <input
              type="text"
              placeholder="Søk etter restaurant, kjøkken eller rett..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 text-lg rounded-xl border-0 text-foreground bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
        </div>
      </section>

      {/* Restaurant Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRestaurants.map((restaurant) => (
              <Card key={restaurant.id} className="group hover:shadow-hover transition-shadow cursor-pointer overflow-hidden">
                <div className="aspect-video bg-gradient-card relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                        <MapPin className="w-8 h-8 text-primary-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">{restaurant.cuisine_type}</p>
                    </div>
                  </div>
                  
                  {/* Tags */}
                  <div className="absolute top-3 left-3">
                    {restaurant.tags.includes('michelin') && (
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 mb-1">
                        <Star className="w-3 h-3 mr-1" />
                        Michelin
                      </Badge>
                    )}
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold font-heading group-hover:text-primary transition-colors">
                      {restaurant.name}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="w-4 h-4 fill-current" />
                      <span>4.8</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{restaurant.address}</span>
                  </div>
                  
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {restaurant.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {restaurant.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Åpent nå</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>Bordreservasjon</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Link to={`/restaurant/${restaurant.id}`}>
                      <Button variant="secondary" className="w-full">
                        Se restaurant
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                    <Link to={`/restaurant/${restaurant.id}/menu`}>
                      <Button variant="outline" className="w-full">
                        Se meny
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredRestaurants.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">
                Ingen restauranter matcher ditt søk
              </p>
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                Vis alle restauranter
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export { RestaurantsPage as default };