import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  dish_type: string;
  photo_url: string;
  allergens: string[];
  tags: string[];
  available_for_route: boolean;
}

interface DishCardProps {
  dish: Dish;
}

export const DishCard = ({ dish }: DishCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getDishTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'starter':
        return '🥗';
      case 'main':
        return '🍽️';
      case 'dessert':
        return '🍰';
      case 'drink':
        return '🥤';
      default:
        return '🍴';
    }
  };

  const getAllergenLabel = (allergen: string) => {
    const labels: Record<string, string> = {
      gluten: 'Gluten',
      lactose: 'Laktose',
      nuts: 'Nøtter',
      egg: 'Egg',
      shellfish: 'Skalldyr',
      fish: 'Fisk',
      soy: 'Soya',
      sesame: 'Sesam',
      celery: 'Selleri',
      mustard: 'Sennep',
      sulphites: 'Sulfitter',
      lupin: 'Lupin',
      molluscs: 'Bløtdyr'
    };
    return labels[allergen] || allergen;
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardContent className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-start gap-4">
              {/* Dish Image or Icon */}
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
                {dish.photo_url ? (
                  <img
                    src={dish.photo_url}
                    alt={dish.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-xl">{getDishTypeIcon(dish.dish_type)}</span>
                )}
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground leading-tight mb-1">
                      {dish.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {dish.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-semibold text-primary">
                      {dish.price} {dish.currency}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Quick Tags Preview */}
                {!isExpanded && (dish.tags.length > 0 || dish.allergens.length > 0) && (
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {dish.tags.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {dish.allergens.length > 0 && (
                      <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                        {dish.allergens.length} allergener
                      </Badge>
                    )}
                    {dish.tags.length > 2 && (
                      <span className="text-xs text-muted-foreground">
                        +{dish.tags.length - 2} flere
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="px-4 pb-4 pt-0 border-t border-border/50">
            <div className="space-y-4">
              {/* Full Description */}
              {dish.description && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Beskrivelse</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {dish.description}
                  </p>
                </div>
              )}

              {/* Allergens */}
              {dish.allergens.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Allergener</h4>
                  <div className="flex flex-wrap gap-2">
                    {dish.allergens.map(allergen => (
                      <Badge 
                        key={allergen} 
                        variant="destructive" 
                        className="text-xs"
                        aria-label={`Inneholder ${getAllergenLabel(allergen)}`}
                      >
                        {getAllergenLabel(allergen)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {dish.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {dish.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Route Availability - Only show if available for route */}
              {dish.available_for_route && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Denne retten er tilgjengelig i våre kulinariske ruter
                  </p>
                </div>
              )}

              {/* Full size image if available */}
              {dish.photo_url && (
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={dish.photo_url}
                    alt={`Bilde av ${dish.name}`}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};