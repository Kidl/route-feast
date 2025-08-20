import { supabase } from "@/integrations/supabase/client";
import { addMinutes, format } from "date-fns";

export interface RouteAvailabilitySlot {
  id: string;
  route_id: string;
  available_date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  max_capacity: number;
  price_override_nok?: number;
}

export interface RestaurantAvailability {
  restaurant_id: string;
  restaurant_name: string;
  is_available: boolean;
  operating_hours?: {
    open_time: string;
    close_time: string;
    is_closed: boolean;
  };
  estimated_arrival: Date;
  estimated_departure: Date;
}

export class RouteAvailabilityService {
  /**
   * Get available slots for a route (Airbnb-style availability)
   */
  static async getRouteAvailability(routeId: string, startDate: string, endDate: string) {
    try {
      const { data, error } = await supabase
        .from('route_availability')
        .select('*')
        .eq('route_id', routeId)
        .eq('is_available', true)
        .gte('available_date', startDate)
        .lte('available_date', endDate)
        .order('available_date')
        .order('start_time');

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching route availability:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Check restaurant availability for route timing
   */
  static async checkRestaurantAvailability(
    routeId: string, 
    startDateTime: Date,
    numberOfPeople: number
  ): Promise<{ success: boolean; data?: RestaurantAvailability[]; error?: string }> {
    try {
      // Get route stops with restaurants and timing information
      const { data: routeStops, error: stopsError } = await supabase
        .from('route_stops')
        .select(`
          *,
          restaurants (
            id,
            name,
            restaurant_operating_hours (
              day_of_week,
              open_time,
              close_time,
              is_closed
            )
          ),
          dishes (
            prep_time_min_override,
            menus (
              default_prep_time_min
            )
          )
        `)
        .eq('route_id', routeId)
        .order('order_index');

      if (stopsError) throw stopsError;

      const dayOfWeek = startDateTime.getDay();
      let currentTime = new Date(startDateTime);
      const availability: RestaurantAvailability[] = [];

      for (const stop of routeStops || []) {
        const restaurant = stop.restaurants;
        const operatingHours = restaurant.restaurant_operating_hours?.find(
          (hours: any) => hours.day_of_week === dayOfWeek
        );

        // Calculate preparation time
        const prepTime = stop.dishes?.prep_time_min_override || 
                        stop.dishes?.menus?.default_prep_time_min || 
                        stop.time_override_min || 30;

        const estimatedDeparture = addMinutes(currentTime, prepTime);

        // Check if restaurant is open and available
        let isAvailable = true;
        if (operatingHours) {
          const openTime = new Date(`1970-01-01T${operatingHours.open_time}`);
          const closeTime = new Date(`1970-01-01T${operatingHours.close_time}`);
          const arrivalTime = new Date(`1970-01-01T${format(currentTime, 'HH:mm:ss')}`);
          const departureTime = new Date(`1970-01-01T${format(estimatedDeparture, 'HH:mm:ss')}`);

          isAvailable = !operatingHours.is_closed && 
                       arrivalTime >= openTime && 
                       departureTime <= closeTime;
        }

        availability.push({
          restaurant_id: restaurant.id,
          restaurant_name: restaurant.name,
          is_available: isAvailable,
          operating_hours: operatingHours,
          estimated_arrival: new Date(currentTime),
          estimated_departure: estimatedDeparture
        });

        // Add walking time to next restaurant
        currentTime = addMinutes(estimatedDeparture, stop.walking_time_to_next_min || 10);
      }

      return { success: true, data: availability };
    } catch (error) {
      console.error('Error checking restaurant availability:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Create or update route availability slots
   */
  static async setRouteAvailability(availabilityData: Omit<RouteAvailabilitySlot, 'id'>) {
    try {
      const { data, error } = await supabase
        .from('route_availability')
        .upsert(availabilityData, {
          onConflict: 'route_id,available_date,start_time'
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error setting route availability:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Bulk enable/disable availability for date range
   */
  static async bulkUpdateAvailability(
    routeId: string,
    startDate: string,
    endDate: string,
    isAvailable: boolean,
    timeSlots?: { start_time: string; end_time: string }[],
    daysOfWeek?: number[] // 0 = Sunday, 1 = Monday, etc.
  ) {
    try {
      const slots = timeSlots || [{ start_time: '12:00', end_time: '15:00' }];
      const allowedDays = daysOfWeek || [1, 2, 3, 4, 5]; // Monday to Friday by default
      const updates = [];

      // Generate date range
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const dayOfWeek = date.getDay();
        
        // Skip if this day is not in the allowed days
        if (!allowedDays.includes(dayOfWeek)) {
          continue;
        }
        
        const dateStr = format(date, 'yyyy-MM-dd');
        
        for (const slot of slots) {
          updates.push({
            route_id: routeId,
            available_date: dateStr,
            start_time: slot.start_time,
            end_time: slot.end_time,
            is_available: isAvailable,
            max_capacity: 20 // Default capacity
          });
        }
      }

      const { error } = await supabase
        .from('route_availability')
        .upsert(updates, {
          onConflict: 'route_id,available_date,start_time'
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error bulk updating availability:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Setup initial availability patterns for all routes
   */
  static async setupInitialAvailability() {
    const today = new Date();
    const twoWeeksFromNow = addMinutes(today, 14 * 24 * 60);
    const oneMonthFromNow = addMinutes(today, 30 * 24 * 60);
    const oneYearFromNow = addMinutes(today, 365 * 24 * 60);

    // Friday-only routes (Michelin experiences)
    const fridayOnlyRoutes = [
      '38ce93f5-af8b-4081-a290-63a0b48775ca', // Michelin Experience Stavanger
      'd90c9e92-df95-4e3a-9115-9085b8c6e726'  // Michelin Star Journey
    ];

    // All year routes (50% of total)
    const allYearRoutes = [
      'a1485cfb-779e-4d7a-8578-4244ba367a6b', // Asian Fusion Journey
      '9a671eb9-622b-4dfa-8956-a9ebb0c7449f', // Mediterranean Classics
      '60aa6f33-4d28-4f7a-a27b-feaaef69d9d4', // Plant-Based Paradise
      '64a79fb0-7e8f-415a-9081-d3b20dbf5744', // Nordic Essence
      '5f410063-67b0-4aab-a205-9a0b427adb43', // Asian Fusion Adventure
      '6f76eb27-cd53-40cb-8f80-a81de7ed5282', // Ramen & Sushi Experience
      '1b953ca0-5307-4415-9872-033a9e647ad4', // Vietnamese Street Food Tour
      '243f2170-d8f3-401e-9894-ab69a4ebef90', // Italian Amore
      '97bbd5d6-df98-4967-a43a-1a83fdee712c', // Mediterranean Tapas Journey
      '4cd4ee50-05b5-4f0d-b550-173cc5645639', // Gourmet Burger Experience
      '045e959b-b10a-441b-a661-7c10ad4c21bd', // Pizza & Kebab Classic
      '12e060b2-09c3-41e1-9154-b04ef2fc2b0d', // Global Spice Route
      'eaa9a5d7-005f-4f86-ac39-5948b5bf2c4d', // Breakfast to Dinner Marathon
      '2eb8e68a-2d78-4875-9501-add90ec6f2f8', // Dumpling & Dim Sum Delight
      'f4da0c83-00da-4d70-9b31-8561765fde01', // Seafood Spectacular
      '2df519a5-3234-4dd8-8b5c-e3f61ab5e562'  // Student Special
    ];

    try {
      // 1. Friday-only routes (16:00-23:00)
      for (const routeId of fridayOnlyRoutes) {
        await this.bulkUpdateAvailability(
          routeId,
          format(today, 'yyyy-MM-dd'),
          format(oneYearFromNow, 'yyyy-MM-dd'),
          true,
          [{ start_time: '16:00', end_time: '23:00' }],
          [5] // Only Fridays
        );
      }

      // 2. All-year routes (Monday to Friday, lunch and dinner)
      for (const routeId of allYearRoutes) {
        await this.bulkUpdateAvailability(
          routeId,
          format(today, 'yyyy-MM-dd'),
          format(oneYearFromNow, 'yyyy-MM-dd'),
          true,
          [
            { start_time: '12:00', end_time: '15:00' },
            { start_time: '18:00', end_time: '22:00' }
          ],
          [1, 2, 3, 4, 5] // Monday to Friday
        );
      }

      // 3. Short-term routes (remaining routes, 2 weeks to 1 month)
      const { data: allRoutes } = await supabase
        .from('routes')
        .select('id')
        .eq('is_active', true);

      const shortTermRoutes = (allRoutes || [])
        .map(r => r.id)
        .filter(id => !fridayOnlyRoutes.includes(id) && !allYearRoutes.includes(id));

      for (const routeId of shortTermRoutes) {
        const endDate = Math.random() > 0.5 ? twoWeeksFromNow : oneMonthFromNow;
        
        await this.bulkUpdateAvailability(
          routeId,
          format(today, 'yyyy-MM-dd'),
          format(endDate, 'yyyy-MM-dd'),
          true,
          [
            { start_time: '12:00', end_time: '15:00' },
            { start_time: '18:00', end_time: '22:00' }
          ],
          [1, 2, 3, 4, 5] // Monday to Friday
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Error setting up initial availability:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}