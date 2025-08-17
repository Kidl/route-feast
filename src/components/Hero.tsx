import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-gastroroute.jpg";
import { MapPin, Calendar, Users } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-overlay" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-heading">
            Oppdag 
            <span className="block text-secondary">Kulinariske Ruter</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto font-body leading-relaxed">
            Opplev nøye kuraterte restaurantreiser gjennom Norges fineste spisesteder. 
            Book din gastronomiske opplevelse i dag.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button variant="hero" size="lg" className="min-w-[200px]">
              <Calendar className="w-5 h-5" />
              Book din rute
            </Button>
            <Button variant="outline" size="lg" className="min-w-[200px] bg-white/10 border-white/30 text-white hover:bg-white/20">
              <MapPin className="w-5 h-5" />
              Utforsk ruter
            </Button>
          </div>
          
          {/* Quick Stats */}
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center text-white/80">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-secondary" />
              <span className="text-lg">50+ Restauranter</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-secondary" />
              <span className="text-lg">12 Unike ruter</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-secondary" />
              <span className="text-lg">Daglige avganger</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};