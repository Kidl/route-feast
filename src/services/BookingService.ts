import { supabase } from "@/integrations/supabase/client";
import { RouteAvailabilityService } from "./RouteAvailabilityService";
import { addMinutes, format } from "date-fns";

export interface BookingData {
  routeId: string;
  scheduleId?: string;
  userType: 'guest' | 'registered';
  userData: {
    name?: string;
    email: string;
    phone?: string;
    user_id?: string;
  };
  participantInfo: {
    numberOfPeople: number;
    allergies?: string;
    dietaryPreferences?: string[];
    specialRequests?: string;
  };
  totalAmount: number;
  paymentData: {
    method: string;
    paymentId: string;
    status: string;
  };
}

export class BookingService {
  static async createBooking(bookingData: BookingData, startDateTime: Date) {
    try {
      // Check restaurant availability first
      const availabilityCheck = await RouteAvailabilityService.checkRestaurantAvailability(
        bookingData.routeId,
        startDateTime,
        bookingData.participantInfo.numberOfPeople
      );

      if (!availabilityCheck.success) {
        throw new Error('Failed to check restaurant availability');
      }

      const unavailableRestaurants = availabilityCheck.data?.filter(r => !r.is_available);
      if (unavailableRestaurants && unavailableRestaurants.length > 0) {
        throw new Error(`Some restaurants are not available: ${unavailableRestaurants.map(r => r.restaurant_name).join(', ')}`);
      }

      // Create the main booking record
      const bookingInsert = {
        route_id: bookingData.routeId,
        schedule_id: bookingData.scheduleId || null,
        user_id: bookingData.userData.user_id || null,
        guest_email: bookingData.userType === 'guest' ? bookingData.userData.email : null,
        guest_phone: bookingData.userType === 'guest' ? bookingData.userData.phone : null,
        guest_name: bookingData.userType === 'guest' ? bookingData.userData.name : null,
        number_of_people: bookingData.participantInfo.numberOfPeople,
        total_amount_nok: bookingData.totalAmount * 100, // Convert to øre
        allergies: bookingData.participantInfo.allergies || null,
        dietary_preferences: bookingData.participantInfo.dietaryPreferences || [],
        special_requests: bookingData.participantInfo.specialRequests || null,
        status: 'confirmed',
        payment_status: bookingData.paymentData.status === 'succeeded' ? 'paid' : 'pending',
        stripe_payment_intent_id: bookingData.paymentData.paymentId,
        booking_type: 'route'
      };

      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert(bookingInsert)
        .select('id, booking_reference')
        .single();

      if (bookingError) throw bookingError;

      // Create individual restaurant bookings for each stop
      if (availabilityCheck.data) {
        const restaurantBookings = availabilityCheck.data.map((restaurant, index) => ({
          booking_id: booking.id,
          restaurant_id: restaurant.restaurant_id,
          stop_number: index + 1,
          estimated_arrival_time: restaurant.estimated_arrival.toISOString(),
          estimated_departure_time: restaurant.estimated_departure.toISOString(),
          number_of_people: bookingData.participantInfo.numberOfPeople,
          status: 'pending',
          allergies: bookingData.participantInfo.allergies || null,
          dietary_preferences: bookingData.participantInfo.dietaryPreferences || [],
          special_requests: bookingData.participantInfo.specialRequests || null
        }));

        const { error: restaurantBookingsError } = await supabase
          .from('restaurant_bookings')
          .insert(restaurantBookings);

        if (restaurantBookingsError) {
          console.error('Error creating restaurant bookings:', restaurantBookingsError);
          // Don't fail the main booking, but log the error
        }
      }

      // Update route schedule availability - simple approach for now
      // In production, this should be done with a database transaction
      const { data: currentSchedule, error: fetchError } = await supabase
        .from('route_schedules')
        .select('available_spots')
        .eq('id', bookingData.scheduleId)
        .single();

      if (!fetchError && currentSchedule) {
        const newSpots = Math.max(0, currentSchedule.available_spots - bookingData.participantInfo.numberOfPeople);
        await supabase
          .from('route_schedules')
          .update({ available_spots: newSpots })
          .eq('id', bookingData.scheduleId);
      }

      // Send confirmation email automatically
      try {
        const emailData = {
          bookingId: booking.id,
          bookingReference: booking.booking_reference,
          email: bookingData.userData.email,
          name: bookingData.userData.name || 'Guest',
          routeName: `Route ${bookingData.routeId}`, // You might want to fetch actual route name
          date: new Date().toLocaleDateString(), // You might want to use actual booking date
          time: "TBD", // You might want to use actual time slot
          numberOfPeople: bookingData.participantInfo.numberOfPeople,
          totalAmount: bookingData.totalAmount
        };

        const { data: emailResponse, error: emailError } = await supabase.functions
          .invoke('send-booking-confirmation', {
            body: emailData
          });

        if (emailError) {
          console.error('Error sending confirmation email:', emailError);
          // Don't fail the booking if email fails
        } else {
          console.log('Confirmation email sent successfully');
        }
      } catch (emailError) {
        console.error('Email service error:', emailError);
        // Don't fail the booking if email fails
      }

      return {
        success: true,
        bookingId: booking.id,
        bookingReference: booking.booking_reference,
        data: booking
      };

    } catch (error) {
      console.error('Booking creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  static async getBooking(bookingId: string) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          routes (name, location, duration_hours, image_url),
          route_schedules (available_date, start_time)
        `)
        .eq('id', bookingId)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching booking:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  static async cancelBooking(bookingId: string, reason?: string) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason || 'User cancellation'
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;

      // TODO: Restore available spots to schedule
      // TODO: Process refund if applicable

      return { success: true, data };
    } catch (error) {
      console.error('Error cancelling booking:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}