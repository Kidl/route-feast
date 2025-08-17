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
        const { data, error } = await supabase
          .from('routes')
          .select('*')
          .eq('is_active', true)
          .order('price_nok', { ascending: true });

        if (error) throw error;
        
        // Transform the data to ensure restaurants is properly typed
        const transformedData = (data || []).map(route => ({
          ...route,
          restaurants: Array.isArray(route.restaurants) ? (route.restaurants as unknown) as Restaurant[] : [],
          highlights: Array.isArray(route.highlights) ? route.highlights : [],
          image_url: route.image_url || ''
        }));
        
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