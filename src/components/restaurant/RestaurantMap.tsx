import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, ExternalLink } from "lucide-react";

interface RestaurantMapProps {
  restaurant: {
    name: string;
    address: string;
    lat: number;
    lng: number;
  };
  onOpenInMaps: () => void;
}

export const RestaurantMap = ({ restaurant, onOpenInMaps }: RestaurantMapProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold font-heading text-foreground">
            Plassering
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenInMaps}
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Åpne i Maps
          </Button>
        </div>
        
        {/* Map Placeholder */}
        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted border">
          {restaurant.lat && restaurant.lng ? (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-primary-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">{restaurant.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{restaurant.address}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {restaurant.lat.toFixed(6)}, {restaurant.lng.toFixed(6)}
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Kartdata ikke tilgjengelig</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-foreground font-medium">{restaurant.address}</p>
              <p className="text-muted-foreground">
                Klikk "Åpne i Maps" for detaljert veibeskrivelse
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};