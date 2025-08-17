import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Users, Star } from "lucide-react";

interface RouteCardProps {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  duration: string;
  maxCapacity: number;
  currentBookings: number;
  rating: number;
  restaurants: string[];
  location: string;
}

export const RouteCard = ({
  name,
  description,
  image,
  price,
  duration,
  maxCapacity,
  currentBookings,
  rating,
  restaurants,
  location,
}: RouteCardProps) => {
  const availableSpots = maxCapacity - currentBookings;
  const isAlmostFull = availableSpots <= 3;

  return (
    <Card className="overflow-hidden shadow-card hover:shadow-hover transition-smooth bg-gradient-card group cursor-pointer">
      <div className="relative overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-64 object-cover transition-smooth group-hover:scale-105"
        />
        <div className="absolute top-4 right-4">
          <Badge variant={isAlmostFull ? "destructive" : "secondary"} className="bg-white/90 text-foreground">
            {availableSpots} spots left
          </Badge>
        </div>
        <div className="absolute bottom-4 left-4">
          <Badge className="bg-primary text-primary-foreground font-semibold">
            {price} NOK
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-semibold font-heading text-foreground group-hover:text-primary transition-smooth">
            {name}
          </h3>
          <div className="flex items-center gap-1 text-secondary">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-medium">{rating}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-muted-foreground text-sm">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>Max {maxCapacity}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <p className="text-muted-foreground leading-relaxed mb-4">
          {description}
        </p>
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Featured Restaurants:</h4>
          <div className="flex flex-wrap gap-1">
            {restaurants.slice(0, 3).map((restaurant, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {restaurant}
              </Badge>
            ))}
            {restaurants.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{restaurants.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button 
          className="w-full" 
          variant={isAlmostFull ? "premium" : "default"}
          size="lg"
        >
          {isAlmostFull ? "Book Now - Limited Spots!" : "Book This Route"}
        </Button>
      </CardFooter>
    </Card>
  );
};