import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DatabaseRoute {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price_nok: number;
  duration_hours: number;
  max_capacity: number;
  location: string;
  highlights: string[];
  restaurants: any[];
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
        setRoutes(data || []);
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