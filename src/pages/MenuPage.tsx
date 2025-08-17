import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Share2, 
  QrCode,
  ChefHat,
  MapPin,
  X
} from "lucide-react";
import { Header } from "@/components/Header";
import { MenuSearch } from "@/components/menu/MenuSearch";
import { MenuFilters } from "@/components/menu/MenuFilters";
import { DishCard } from "@/components/menu/DishCard";
import { MenuShareDialog } from "@/components/menu/MenuShareDialog";

interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
}

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

const DISH_TYPES = [
  { value: 'all', label: 'Alle retter' },
  { value: 'starter', label: 'Forretter' },
  { value: 'main', label: 'Hovedretter' },
  { value: 'dessert', label: 'Desserter' },
  { value: 'drink', label: 'Drikke' },
  { value: 'other', label: 'Annet' }
];

const ALLERGEN_LIST = [
  'gluten', 'lactose', 'nuts', 'egg', 'shellfish', 
  'fish', 'soy', 'sesame', 'celery', 'mustard', 
  'sulphites', 'lupin', 'molluscs'
];

export const MenuPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>(
    searchParams.get('allergens')?.split(',').filter(Boolean) || []
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.get('tags')?.split(',').filter(Boolean) || []
  );
  const [activeType, setActiveType] = useState(searchParams.get('type') || 'all');

  // Get all unique tags from dishes
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    dishes.forEach(dish => dish.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [dishes]);

  useEffect(() => {
    const fetchMenuData = async () => {
      if (!slug) return;

      try {
        setLoading(true);

        // Fetch restaurant info
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select('id, name, description, address, city')
          .eq('id', slug)
          .eq('status', 'active')
          .single();

        if (restaurantError) throw restaurantError;

        // Fetch dishes from active menus
        const { data: dishesData, error: dishesError } = await supabase
          .from('dishes')
          .select(`
            id,
            name,
            description,
            price,
            currency,
            dish_type,
            photo_url,
            available_for_route,
            menus!inner(restaurant_id, is_active),
            dish_tags(tag),
            dish_allergens(allergen_code)
          `)
          .eq('menus.restaurant_id', slug)
          .eq('menus.is_active', true)
          .order('dish_type')
          .order('name');

        if (dishesError) throw dishesError;

        // Transform dishes data
        const transformedDishes = dishesData?.map(dish => ({
          ...dish,
          tags: dish.dish_tags?.map((tag: any) => tag.tag) || [],
          allergens: dish.dish_allergens?.map((allergen: any) => allergen.allergen_code) || []
        })) || [];

        setRestaurant(restaurantData);
        setDishes(transformedDishes);
      } catch (err) {
        console.error('Error fetching menu data:', err);
        setError('Kunne ikke laste meny');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, [slug]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedAllergens.length) params.set('allergens', selectedAllergens.join(','));
    if (selectedTags.length) params.set('tags', selectedTags.join(','));
    if (activeType !== 'all') params.set('type', activeType);
    
    setSearchParams(params, { replace: true });
  }, [searchTerm, selectedAllergens, selectedTags, activeType, setSearchParams]);

  // Filter dishes based on current filters
  const filteredDishes = useMemo(() => {
    return dishes.filter(dish => {
      // Text search
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          dish.name.toLowerCase().includes(searchLower) ||
          dish.description.toLowerCase().includes(searchLower) ||
          dish.tags.some(tag => tag.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Dish type filter
      if (activeType !== 'all' && dish.dish_type !== activeType) {
        return false;
      }

      // Allergen filter (hide dishes containing selected allergens)
      if (selectedAllergens.length > 0) {
        const hasSelectedAllergen = selectedAllergens.some(allergen => 
          dish.allergens.includes(allergen)
        );
        if (hasSelectedAllergen) return false;
      }

      // Tag filter (show dishes with selected tags)
      if (selectedTags.length > 0) {
        const hasSelectedTag = selectedTags.some(tag => 
          dish.tags.includes(tag)
        );
        if (!hasSelectedTag) return false;
      }

      return true;
    });
  }, [dishes, searchTerm, activeType, selectedAllergens, selectedTags]);

  // Group dishes by type for display
  const dishesByType = useMemo(() => {
    const grouped = filteredDishes.reduce((acc, dish) => {
      if (!acc[dish.dish_type]) {
        acc[dish.dish_type] = [];
      }
      acc[dish.dish_type].push(dish);
      return acc;
    }, {} as Record<string, Dish[]>);
    return grouped;
  }, [filteredDishes]);

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedAllergens([]);
    setSelectedTags([]);
    setActiveType('all');
  };

  const hasActiveFilters = searchTerm || selectedAllergens.length > 0 || selectedTags.length > 0 || activeType !== 'all';

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-24">
          <div className="space-y-6">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-12 w-full" />
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-24">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {error || 'Meny ikke funnet'}
            </h1>
            <Button onClick={() => navigate('/')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tilbake til forsiden
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Restaurant Header */}
      <section className="pt-24 pb-6 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="mb-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/restaurants/${restaurant.id}`)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tilbake til restaurant
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-heading text-foreground mb-2">
                {restaurant.name}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{restaurant.address}, {restaurant.city}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShareDialogOpen(true)}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Del
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShareDialogOpen(true)}
              >
                <QrCode className="w-4 h-4 mr-2" />
                QR
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Filters */}
      <section className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="space-y-4">
            {/* Search */}
            <MenuSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />
            
            {/* Filters */}
            <MenuFilters
              selectedAllergens={selectedAllergens}
              selectedTags={selectedTags}
              availableAllergens={ALLERGEN_LIST}
              availableTags={availableTags}
              onAllergensChange={setSelectedAllergens}
              onTagsChange={setSelectedTags}
            />

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Aktive filtre:</span>
                {activeType !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Type: {DISH_TYPES.find(t => t.value === activeType)?.label}
                    <button onClick={() => setActiveType('all')}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {selectedAllergens.map(allergen => (
                  <Badge key={allergen} variant="destructive" className="gap-1">
                    Ikke: {allergen}
                    <button onClick={() => setSelectedAllergens(prev => prev.filter(a => a !== allergen))}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {selectedTags.map(tag => (
                  <Badge key={tag} variant="outline" className="gap-1">
                    {tag}
                    <button onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  Fjern alle filtre
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Menu Content */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <Tabs value={activeType} onValueChange={setActiveType}>
            <TabsList className="grid w-full grid-cols-6 mb-6">
              {DISH_TYPES.map(type => (
                <TabsTrigger key={type.value} value={type.value} className="text-xs">
                  {type.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeType} className="mt-0">
              {filteredDishes.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <ChefHat className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Ingen retter funnet
                    </h3>
                    <p className="text-muted-foreground">
                      Ingen retter matcher dine filtre. Prøv å justere søket eller fjern noen filtre.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {activeType === 'all' ? (
                    // Show grouped by type when viewing all
                    DISH_TYPES.slice(1).map(type => {
                      const typeDishes = dishesByType[type.value];
                      if (!typeDishes || typeDishes.length === 0) return null;
                      
                      return (
                        <div key={type.value}>
                          <h2 className="text-xl font-semibold font-heading text-foreground mb-4 flex items-center gap-2">
                            {type.label}
                            <Badge variant="outline">{typeDishes.length}</Badge>
                          </h2>
                          <div className="grid gap-3">
                            {typeDishes.map(dish => (
                              <DishCard key={dish.id} dish={dish} />
                            ))}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    // Show flat list when viewing specific type
                    <div className="grid gap-3">
                      {filteredDishes.map(dish => (
                        <DishCard key={dish.id} dish={dish} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <MenuShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        restaurant={restaurant}
      />
    </div>
  );
};