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
    timeSlots?: { start_time: string; end_time: string }[]
  ) {
    try {
      const slots = timeSlots || [{ start_time: '12:00', end_time: '15:00' }];
      const updates = [];

      // Generate date range
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
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
}