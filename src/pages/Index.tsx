import { useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { RouteCard } from "@/components/RouteCard";
import { RouteFilters, FilterState } from "@/components/RouteFilters";
import { Button } from "@/components/ui/button";
import { useRoutes } from "@/hooks/useRoutes";
import { MapPin, Clock, Users, Star, ArrowRight, Loader2 } from "lucide-react";

const Index = () => {
  const { routes, loading, error } = useRoutes();
  const [filters, setFilters] = useState<FilterState>({
    priceRange: 'all',
    experience: 'all',
    duration: 'all',
    searchTerm: ''
  });

  // Filter routes based on current filters
  const filteredRoutes = routes.filter(route => {
    const price = Math.round(route.price_nok / 100);
    
    // Price range filter
    if (filters.priceRange !== 'all') {
      if (filters.priceRange === 'budget' && price >= 1200) return false;
      if (filters.priceRange === 'mid' && (price < 1200 || price >= 1800)) return false;
      if (filters.priceRange === 'premium' && price < 1800) return false;
    }
    
    // Experience filter
    if (filters.experience !== 'all') {
      if (filters.experience === 'michelin' && !route.name.toLowerCase().includes('michelin')) return false;
      if (filters.experience === 'fusion' && !route.name.toLowerCase().includes('fusion')) return false;
      if (filters.experience === 'traditional' && !route.name.toLowerCase().includes('mediterranean')) return false;
    }
    
    // Duration filter
    if (filters.duration !== 'all') {
      if (filters.duration === 'short' && route.duration_hours >= 3) return false;
      if (filters.duration === 'medium' && (route.duration_hours < 3 || route.duration_hours >= 4)) return false;
      if (filters.duration === 'long' && route.duration_hours < 4) return false;
    }
    
    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      return (
        route.name.toLowerCase().includes(searchLower) ||
        route.description.toLowerCase().includes(searchLower) ||
        route.location.toLowerCase().includes(searchLower) ||
        route.restaurants.some(r => 
          r.name?.toLowerCase().includes(searchLower) ||
          r.cuisine?.toLowerCase().includes(searchLower)
        )
      );
    }
    
    return true;
  });
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      
      {/* Featured Routes Section */}
      <section id="routes" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <RouteFilters onFilterChange={setFilters} />
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-heading text-foreground mb-6">
              Utvalgte kulinariske ruter
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Nøye kuraterte spiseopplevelser som viser frem det beste av norsk mat. 
              Hver rute forteller en unik kulinarisk historie gjennom flere restauranter og kjøkken.
            </p>
            
            {filters.searchTerm && (
              <p className="text-muted-foreground mt-2">
                Viser resultater for "{filters.searchTerm}" • {filteredRoutes.length} ruter funnet
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {loading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Laster ruter...</span>
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-12 text-red-600">
                {error}
              </div>
            ) : filteredRoutes.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground text-lg mb-4">Ingen ruter matcher dine nåværende filtre</p>
                <Button variant="outline" onClick={() => setFilters({
                  priceRange: 'all',
                  experience: 'all', 
                  duration: 'all',
                  searchTerm: ''
                })}>
                  Fjern alle filtre
                </Button>
              </div>
            ) : (
              filteredRoutes.map((route) => (
                <RouteCard 
                  key={route.id} 
                  id={route.id}
                  name={route.name}
                  description={route.description}
                  image={route.image_url || ''}
                  price={Math.round(route.price_nok / 100)} // Convert from øre to NOK
                  duration={`${route.duration_hours} timer`}
                  maxCapacity={route.max_capacity}
                  currentBookings={Math.floor(route.max_capacity * 0.6)} // Simulate bookings
                  rating={4.8}
                  restaurants={route.restaurants || []}
                  location={route.location}
                  highlights={route.highlights || []}
                />
              ))
            )}
          </div>
          
          <div className="text-center">
            <Button variant="outline" size="lg" className="group">
              Se alle ruter
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-smooth" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-heading text-foreground mb-6">
              Hvorfor velge GastroRoute?
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Vi gjør kulinarisk utforskning enkelt, og kobler deg til Norges fineste spiseopplevelser.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-hero rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-spring shadow-card">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold font-heading text-foreground mb-2">Kuraterte ruter</h3>
              <p className="text-muted-foreground">Håndplukkede restaurantkombinasjoner for den perfekte kulinariske reisen.</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-spring shadow-card">
                <Clock className="w-8 h-8 text-secondary-foreground" />
              </div>
              <h3 className="text-xl font-semibold font-heading text-foreground mb-2">Enkel booking</h3>
              <p className="text-muted-foreground">Enkel booking med ett klikk og øyeblikkelig bekreftelse med QR-koder.</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-spring shadow-card">
                <Users className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold font-heading text-foreground mb-2">Gruppevennlig</h3>
              <p className="text-muted-foreground">Perfekt for par, venner eller større grupper med fleksibel kapasitet.</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-spring shadow-card">
                <Star className="w-8 h-8 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold font-heading text-foreground mb-2">Premium kvalitet</h3>
              <p className="text-muted-foreground">Kun de fineste restaurantene og høyeste kvalitet på spiseopplevelser.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold font-heading text-white mb-6">
              Klar for ditt kulinariske eventyr?
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Bli med tusenvis av matelskere som har oppdaget Norges best bevarte kulinariske hemmeligheter gjennom våre ekspertlagde ruter.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg" className="min-w-[200px]">
                Book din første rute
              </Button>
              <Button variant="outline" size="lg" className="min-w-[200px] bg-white/10 border-white/30 text-white hover:bg-white/20">
                Lær mer
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-foreground text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-accent rounded-md flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-secondary-foreground" />
                </div>
                <span className="text-xl font-bold font-heading">GastroRoute</span>
              </div>
              <p className="text-white/70 leading-relaxed">
                Oppdag Norges fineste kulinariske opplevelser gjennom våre nøye kuraterte restaurantruter.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Ruter</h4>
              <ul className="space-y-2 text-white/70">
                <li><a href="#" className="hover:text-white transition-smooth">Nordisk arv</a></li>
                <li><a href="#" className="hover:text-white transition-smooth">Sjømat-rute</a></li>
                <li><a href="#" className="hover:text-white transition-smooth">Moderne fusion</a></li>
                <li><a href="#" className="hover:text-white transition-smooth">Alle ruter</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Selskap</h4>
              <ul className="space-y-2 text-white/70">
                <li><a href="#" className="hover:text-white transition-smooth">Om oss</a></li>
                <li><a href="#" className="hover:text-white transition-smooth">Kontakt</a></li>
                <li><a href="#" className="hover:text-white transition-smooth">Partnere</a></li>
                <li><a href="#" className="hover:text-white transition-smooth">Presse</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-white/70">
                <li><a href="#" className="hover:text-white transition-smooth">Hjelpesenter</a></li>
                <li><a href="#" className="hover:text-white transition-smooth">Bookingvilkår</a></li>
                <li><a href="#" className="hover:text-white transition-smooth">Personvern</a></li>
                <li><a href="#" className="hover:text-white transition-smooth">Vilkår</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/70">
            <p>&copy; 2025 GastroRoute. Alle rettigheter reservert. Laget med ❤️ for matelskere.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;