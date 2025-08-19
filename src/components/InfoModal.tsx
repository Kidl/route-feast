import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Globe } from "lucide-react";

interface RestaurantInfo {
  id: string;
  name: string;
  address: string;
  cuisine_type?: string;
  description?: string;
  phone?: string;
  website?: string;
  lat?: number;
  lng?: number;
}

interface DishInfo {
  id: string;
  name: string;
  description?: string;
  price?: number;
  dish_type: string;
  photo_url?: string;
}

interface InfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "restaurant" | "dish";
  data: RestaurantInfo | DishInfo | null;
}

export function InfoModal({ open, onOpenChange, type, data }: InfoModalProps) {
  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {type === "restaurant" ? "Restaurant informasjon" : "Rett informasjon"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">{data.name}</h3>
          
          {type === "restaurant" && "address" in data && (
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <span className="text-sm">{data.address}</span>
              </div>
              
              {data.cuisine_type && (
                <Badge variant="secondary">{data.cuisine_type}</Badge>
              )}
              
              {data.description && (
                <p className="text-sm text-muted-foreground">{data.description}</p>
              )}
              
              {data.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{data.phone}</span>
                </div>
              )}
              
              {data.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={data.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Besøk nettside
                  </a>
                </div>
              )}
            </div>
          )}
          
          {type === "dish" && "dish_type" in data && (
            <div className="space-y-3">
              {data.photo_url && (
                <img
                  src={data.photo_url}
                  alt={data.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              
              <div className="flex items-center gap-2">
                <Badge variant="outline">{data.dish_type}</Badge>
                {data.price && (
                  <span className="text-lg font-semibold">{data.price} NOK</span>
                )}
              </div>
              
              {data.description && (
                <p className="text-sm text-muted-foreground">{data.description}</p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}