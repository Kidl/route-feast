import { supabase } from "@/integrations/supabase/client";

export interface BookingData {
  routeId: string;
  scheduleId: string;
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
  static async createBooking(bookingData: BookingData) {
    try {
      // Create the main booking record
      const bookingInsert = {
        route_id: bookingData.routeId,
        schedule_id: bookingData.scheduleId,
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
        stripe_payment_intent_id: bookingData.paymentData.paymentId
      };

      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert(bookingInsert)
        .select('id, booking_reference')
        .single();

      if (bookingError) throw bookingError;

      // Update route schedule availability
      const { error: scheduleError } = await supabase.rpc(
        'decrease_available_spots',
        {
          schedule_id: bookingData.scheduleId,
          spots_to_decrease: bookingData.participantInfo.numberOfPeople
        }
      );

      if (scheduleError) {
        console.warn('Could not update schedule availability:', scheduleError);
        // Don't throw error as booking is still valid
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