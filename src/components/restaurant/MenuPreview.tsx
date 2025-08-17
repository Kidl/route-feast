import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChefHat, ArrowRight, Utensils } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  dish_type: string;
  photo_url: string;
  tags: string[];
  allergens: string[];
}

interface MenuPreviewProps {
  restaurantId: string;
}

export const MenuPreview = ({ restaurantId }: MenuPreviewProps) => {
  const navigate = useNavigate();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenuPreview = async () => {
      try {
        setLoading(true);

        // Fetch dishes from active menus for this restaurant
        const { data: dishesData, error } = await supabase
          .from('dishes')
          .select(`
            id,
            name,
            description,
            price,
            currency,
            dish_type,
            photo_url,
            menus!inner(restaurant_id, is_active),
            dish_tags(tag),
            dish_allergens(allergen_code)
          `)
          .eq('menus.restaurant_id', restaurantId)
          .eq('menus.is_active', true)
          .limit(6);

        if (error) throw error;

        // Transform the data to include tags and allergens arrays
        const transformedDishes = dishesData?.map(dish => ({
          ...dish,
          tags: dish.dish_tags?.map((tag: any) => tag.tag) || [],
          allergens: dish.dish_allergens?.map((allergen: any) => allergen.allergen_code) || []
        })) || [];

        setDishes(transformedDishes);
      } catch (err) {
        console.error('Error fetching menu preview:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuPreview();
  }, [restaurantId]);

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

  const getDishTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case 'starter':
        return 'Forrett';
      case 'main':
        return 'Hovedrett';
      case 'dessert':
        return 'Dessert';
      case 'drink':
        return 'Drikke';
      default:
        return 'Annet';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-9 w-24" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="w-16 h-16 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (dishes.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Utensils className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Ingen meny tilgjengelig
            </h3>
            <p className="text-muted-foreground">
              Menyen for denne restauranten er ikke publisert ennå.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold font-heading text-foreground flex items-center gap-2">
            <ChefHat className="w-6 h-6" />
            Utvalgte retter
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/restaurants/${restaurantId}/menu`)}
          >
            Se full meny
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dishes.map((dish) => (
            <div key={dish.id} className="flex gap-4 group">
              {/* Dish Image */}
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                {dish.photo_url ? (
                  <img
                    src={dish.photo_url}
                    alt={dish.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">
                    {getDishTypeIcon(dish.dish_type)}
                  </div>
                )}
              </div>

              {/* Dish Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-medium text-foreground leading-tight">
                    {dish.name}
                  </h4>
                  <span className="text-sm font-semibold text-primary flex-shrink-0">
                    {dish.price} {dish.currency}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {dish.description}
                </p>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {getDishTypeLabel(dish.dish_type)}
                  </Badge>
                  
                  {dish.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  
                  {dish.allergens.length > 0 && (
                    <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                      Allergener
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {dishes.length >= 6 && (
          <div className="mt-6 pt-4 border-t border-border">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate(`/restaurants/${restaurantId}/menu`)}
            >
              Se alle {dishes.length}+ retter på full meny
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};