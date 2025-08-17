import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Menu, X, Settings } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-hero rounded-md flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold font-heading text-primary">GastroRoute</span>
              <Badge variant="secondary" className="ml-2 text-xs">Beta</Badge>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#routes" className="text-foreground hover:text-primary transition-smooth font-medium">
              Ruter
            </a>
            <a href="#about" className="text-foreground hover:text-primary transition-smooth font-medium">
              Om oss
            </a>
            <a href="#contact" className="text-foreground hover:text-primary transition-smooth font-medium">
              Kontakt
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm">
              Logg inn
            </Button>
            <Button variant="default" size="sm">
              Book nå
            </Button>
            <Link to="/login">
              <Button variant="ghost" size="sm" className="gap-2">
                <Settings className="h-4 w-4" />
                Admin
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-white/95 backdrop-blur-sm">
            <nav className="flex flex-col gap-4 p-4">
              <a href="#routes" className="text-foreground hover:text-primary transition-smooth font-medium">
                Ruter
              </a>
              <a href="#about" className="text-foreground hover:text-primary transition-smooth font-medium">
                Om oss
              </a>
              <a href="#contact" className="text-foreground hover:text-primary transition-smooth font-medium">
                Kontakt
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button variant="ghost" size="sm" className="justify-start">
                  Logg inn
                </Button>
                <Button variant="default" size="sm">
                  Book nå
                </Button>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="justify-start gap-2">
                    <Settings className="h-4 w-4" />
                    Admin
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};