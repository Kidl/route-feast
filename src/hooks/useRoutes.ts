import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Restaurant } from "@/data/mockRoutes";

interface DatabaseRoute {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  price_nok: number;
  duration_hours: number;
  max_capacity: number;
  location: string;
  highlights: string[] | null;
  restaurants: Restaurant[];
  is_active?: boolean | null;
  created_at?: string;
  updated_at?: string;
}

export const useRoutes = () => {
  const [routes, setRoutes] = useState<DatabaseRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        // First, get routes that have active schedules with available spots
        const { data: routesWithSchedules, error: schedulesError } = await supabase
          .from('route_schedules')
          .select(`
            route_id,
            routes!inner(*)
          `)
          .eq('is_active', true)
          .gt('available_spots', 0)
          .gte('available_date', new Date().toISOString().split('T')[0]); // Only future dates

        if (schedulesError) throw schedulesError;

        // Extract unique routes from the results
        const uniqueRoutes = routesWithSchedules?.reduce((acc, item) => {
          const route = item.routes;
          if (route && route.is_active && !acc.find(r => r.id === route.id)) {
            acc.push(route);
          }
          return acc;
        }, [] as any[]) || [];
        
        // Transform the data to ensure restaurants is properly typed
        const transformedData = uniqueRoutes.map(route => ({
          ...route,
          restaurants: Array.isArray(route.restaurants) ? (route.restaurants as unknown) as Restaurant[] : [],
          highlights: Array.isArray(route.highlights) ? route.highlights : [],
          image_url: route.image_url || '/placeholder.svg'
        }));
        
        // Sort by price
        transformedData.sort((a, b) => a.price_nok - b.price_nok);
        
        setRoutes(transformedData);
      } catch (err) {
        console.error('Error fetching routes:', err);
        setError('Failed to load routes');
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  return { routes, loading, error };
};