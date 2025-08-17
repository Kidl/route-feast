import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { RouteCard } from "@/components/RouteCard";
import { Button } from "@/components/ui/button";
import { useRoutes } from "@/hooks/useRoutes";
import { MapPin, Clock, Users, Star, ArrowRight, Loader2 } from "lucide-react";

const Index = () => {
  const { routes, loading, error } = useRoutes();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      
      {/* Featured Routes Section */}
      <section id="routes" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-heading text-foreground mb-6">
              Featured Culinary Routes
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Carefully curated dining experiences that showcase the best of Norwegian cuisine. 
              Each route tells a unique culinary story through multiple restaurants and cuisines.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {loading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading routes...</span>
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-12 text-red-600">
                {error}
              </div>
            ) : (
              routes.map((route) => (
                <RouteCard 
                  key={route.id} 
                  id={route.id}
                  name={route.name}
                  description={route.description}
                  image={route.image_url || ''}
                  price={Math.round(route.price_nok / 100)} // Convert from øre to NOK
                  duration={`${route.duration_hours} hours`}
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
              View All Routes
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
              Why Choose GastroRoute?
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We make culinary exploration effortless, connecting you with Norway's finest dining experiences.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-hero rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-spring shadow-card">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold font-heading text-foreground mb-2">Curated Routes</h3>
              <p className="text-muted-foreground">Hand-picked restaurant combinations for the perfect culinary journey.</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-spring shadow-card">
                <Clock className="w-8 h-8 text-secondary-foreground" />
              </div>
              <h3 className="text-xl font-semibold font-heading text-foreground mb-2">Easy Booking</h3>
              <p className="text-muted-foreground">Simple one-click booking with instant confirmation and QR codes.</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-spring shadow-card">
                <Users className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold font-heading text-foreground mb-2">Group Friendly</h3>
              <p className="text-muted-foreground">Perfect for couples, friends, or larger groups with flexible capacity.</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-spring shadow-card">
                <Star className="w-8 h-8 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold font-heading text-foreground mb-2">Premium Quality</h3>
              <p className="text-muted-foreground">Only the finest restaurants and highest quality dining experiences.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold font-heading text-white mb-6">
              Ready for Your Culinary Adventure?
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Join thousands of food lovers who have discovered Norway's best-kept culinary secrets through our expertly crafted routes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg" className="min-w-[200px]">
                Book Your First Route
              </Button>
              <Button variant="outline" size="lg" className="min-w-[200px] bg-white/10 border-white/30 text-white hover:bg-white/20">
                Learn More
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
                Discover Norway's finest culinary experiences through our carefully curated restaurant routes.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Routes</h4>
              <ul className="space-y-2 text-white/70">
                <li><a href="#" className="hover:text-white transition-smooth">Nordic Heritage</a></li>
                <li><a href="#" className="hover:text-white transition-smooth">Seafood Trail</a></li>
                <li><a href="#" className="hover:text-white transition-smooth">Modern Fusion</a></li>
                <li><a href="#" className="hover:text-white transition-smooth">All Routes</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-white/70">
                <li><a href="#" className="hover:text-white transition-smooth">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-smooth">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-smooth">Partners</a></li>
                <li><a href="#" className="hover:text-white transition-smooth">Press</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-white/70">
                <li><a href="#" className="hover:text-white transition-smooth">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-smooth">Booking Policy</a></li>
                <li><a href="#" className="hover:text-white transition-smooth">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-smooth">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/70">
            <p>&copy; 2025 GastroRoute. All rights reserved. Made with ❤️ for food lovers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;