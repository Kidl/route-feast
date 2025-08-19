export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          id: string
          permissions: string[] | null
          role: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          permissions?: string[] | null
          role?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          permissions?: string[] | null
          role?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      booking_events: {
        Row: {
          booking_id: string | null
          created_at: string
          created_by: string | null
          event_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          created_by?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          created_by?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_events_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_participants: {
        Row: {
          allergies: string | null
          booking_id: string | null
          created_at: string
          dietary_preferences: string[] | null
          id: string
          name: string | null
        }
        Insert: {
          allergies?: string | null
          booking_id?: string | null
          created_at?: string
          dietary_preferences?: string[] | null
          id?: string
          name?: string | null
        }
        Update: {
          allergies?: string | null
          booking_id?: string | null
          created_at?: string
          dietary_preferences?: string[] | null
          id?: string
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_participants_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          allergies: string | null
          booking_reference: string
          booking_type: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          confirmation_sent_at: string | null
          created_at: string
          dietary_preferences: string[] | null
          guest_email: string | null
          guest_name: string | null
          guest_phone: string | null
          id: string
          number_of_people: number
          payment_status: string
          route_id: string | null
          schedule_id: string | null
          special_requests: string | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          table_id: string | null
          total_amount_nok: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          allergies?: string | null
          booking_reference?: string
          booking_type?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          confirmation_sent_at?: string | null
          created_at?: string
          dietary_preferences?: string[] | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          number_of_people: number
          payment_status?: string
          route_id?: string | null
          schedule_id?: string | null
          special_requests?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          table_id?: string | null
          total_amount_nok: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          allergies?: string | null
          booking_reference?: string
          booking_type?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          confirmation_sent_at?: string | null
          created_at?: string
          dietary_preferences?: string[] | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          number_of_people?: number
          payment_status?: string
          route_id?: string | null
          schedule_id?: string | null
          special_requests?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          table_id?: string | null
          total_amount_nok?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "route_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "restaurant_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      cancellation_rules: {
        Row: {
          created_at: string
          fee_type: string
          fee_value: number
          hours_before: number
          id: string
          is_active: boolean | null
          message: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          fee_type?: string
          fee_value?: number
          hours_before?: number
          id?: string
          is_active?: boolean | null
          message?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          fee_type?: string
          fee_value?: number
          hours_before?: number
          id?: string
          is_active?: boolean | null
          message?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      dish_allergens: {
        Row: {
          allergen_code: string
          dish_id: string
          id: string
        }
        Insert: {
          allergen_code: string
          dish_id: string
          id?: string
        }
        Update: {
          allergen_code?: string
          dish_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dish_allergens_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "dishes"
            referencedColumns: ["id"]
          },
        ]
      }
      dish_tags: {
        Row: {
          dish_id: string
          id: string
          tag: string
        }
        Insert: {
          dish_id: string
          id?: string
          tag: string
        }
        Update: {
          dish_id?: string
          id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "dish_tags_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "dishes"
            referencedColumns: ["id"]
          },
        ]
      }
      dishes: {
        Row: {
          available_for_route: boolean | null
          created_at: string
          currency: string | null
          description: string | null
          dish_type: string
          id: string
          menu_id: string
          name: string
          photo_url: string | null
          prep_time_min_override: number | null
          price: number | null
          updated_at: string
        }
        Insert: {
          available_for_route?: boolean | null
          created_at?: string
          currency?: string | null
          description?: string | null
          dish_type: string
          id?: string
          menu_id: string
          name: string
          photo_url?: string | null
          prep_time_min_override?: number | null
          price?: number | null
          updated_at?: string
        }
        Update: {
          available_for_route?: boolean | null
          created_at?: string
          currency?: string | null
          description?: string | null
          dish_type?: string
          id?: string
          menu_id?: string
          name?: string
          photo_url?: string | null
          prep_time_min_override?: number | null
          price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dishes_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menus"
            referencedColumns: ["id"]
          },
        ]
      }
      menus: {
        Row: {
          created_at: string
          default_prep_time_min: number | null
          id: string
          is_active: boolean | null
          is_seasonal: boolean | null
          language: string | null
          restaurant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_prep_time_min?: number | null
          id?: string
          is_active?: boolean | null
          is_seasonal?: boolean | null
          language?: string | null
          restaurant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_prep_time_min?: number | null
          id?: string
          is_active?: boolean | null
          is_seasonal?: boolean | null
          language?: string | null
          restaurant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menus_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          body: string
          channel: string
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          subject: string | null
          updated_at: string
          variables: string[] | null
        }
        Insert: {
          body: string
          channel: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          subject?: string | null
          updated_at?: string
          variables?: string[] | null
        }
        Update: {
          body?: string
          channel?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string | null
          updated_at?: string
          variables?: string[] | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          preferred_language: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          preferred_language?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          preferred_language?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      restaurant_bookings: {
        Row: {
          allergies: string | null
          booking_id: string
          created_at: string
          dietary_preferences: string[] | null
          estimated_arrival_time: string
          estimated_departure_time: string
          id: string
          number_of_people: number
          restaurant_id: string
          route_stop_id: string | null
          special_requests: string | null
          status: string
          stop_number: number
          table_id: string | null
          updated_at: string
        }
        Insert: {
          allergies?: string | null
          booking_id: string
          created_at?: string
          dietary_preferences?: string[] | null
          estimated_arrival_time: string
          estimated_departure_time: string
          id?: string
          number_of_people: number
          restaurant_id: string
          route_stop_id?: string | null
          special_requests?: string | null
          status?: string
          stop_number: number
          table_id?: string | null
          updated_at?: string
        }
        Update: {
          allergies?: string | null
          booking_id?: string
          created_at?: string
          dietary_preferences?: string[] | null
          estimated_arrival_time?: string
          estimated_departure_time?: string
          id?: string
          number_of_people?: number
          restaurant_id?: string
          route_stop_id?: string | null
          special_requests?: string | null
          status?: string
          stop_number?: number
          table_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_bookings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_bookings_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_bookings_route_stop_id_fkey"
            columns: ["route_stop_id"]
            isOneToOne: false
            referencedRelation: "route_stops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_bookings_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "restaurant_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          is_cover: boolean | null
          restaurant_id: string
          url: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          is_cover?: boolean | null
          restaurant_id: string
          url: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          is_cover?: boolean | null
          restaurant_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_images_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_operating_hours: {
        Row: {
          close_time: string
          created_at: string
          day_of_week: number
          id: string
          is_closed: boolean | null
          open_time: string
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          close_time: string
          created_at?: string
          day_of_week: number
          id?: string
          is_closed?: boolean | null
          open_time: string
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          close_time?: string
          created_at?: string
          day_of_week?: number
          id?: string
          is_closed?: boolean | null
          open_time?: string
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_operating_hours_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_tables: {
        Row: {
          capacity: number
          created_at: string
          id: string
          location_notes: string | null
          restaurant_id: string
          status: string
          table_number: string
          table_type: string | null
          updated_at: string
        }
        Insert: {
          capacity?: number
          created_at?: string
          id?: string
          location_notes?: string | null
          restaurant_id: string
          status?: string
          table_number: string
          table_type?: string | null
          updated_at?: string
        }
        Update: {
          capacity?: number
          created_at?: string
          id?: string
          location_notes?: string | null
          restaurant_id?: string
          status?: string
          table_number?: string
          table_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      restaurants: {
        Row: {
          address: string
          city: string | null
          country: string | null
          created_at: string
          cuisine_type: string | null
          description: string | null
          email: string | null
          id: string
          lat: number | null
          lng: number | null
          name: string
          opening_hours: Json | null
          phone: string | null
          status: string
          tags: string[] | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address: string
          city?: string | null
          country?: string | null
          created_at?: string
          cuisine_type?: string | null
          description?: string | null
          email?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          opening_hours?: Json | null
          phone?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string
          city?: string | null
          country?: string | null
          created_at?: string
          cuisine_type?: string | null
          description?: string | null
          email?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          opening_hours?: Json | null
          phone?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      route_availability: {
        Row: {
          available_date: string
          created_at: string
          end_time: string
          id: string
          is_available: boolean
          max_capacity: number
          price_override_nok: number | null
          route_id: string
          start_time: string
          updated_at: string
        }
        Insert: {
          available_date: string
          created_at?: string
          end_time: string
          id?: string
          is_available?: boolean
          max_capacity?: number
          price_override_nok?: number | null
          route_id: string
          start_time: string
          updated_at?: string
        }
        Update: {
          available_date?: string
          created_at?: string
          end_time?: string
          id?: string
          is_available?: boolean
          max_capacity?: number
          price_override_nok?: number | null
          route_id?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_availability_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      route_schedules: {
        Row: {
          available_date: string
          available_spots: number
          created_at: string
          id: string
          is_active: boolean | null
          route_id: string | null
          start_time: string
        }
        Insert: {
          available_date: string
          available_spots: number
          created_at?: string
          id?: string
          is_active?: boolean | null
          route_id?: string | null
          start_time: string
        }
        Update: {
          available_date?: string
          available_spots?: number
          created_at?: string
          id?: string
          is_active?: boolean | null
          route_id?: string | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_schedules_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      route_stops: {
        Row: {
          created_at: string
          description: string | null
          dish_id: string
          id: string
          order_index: number
          restaurant_id: string
          route_id: string
          time_override_min: number | null
          title: string | null
          walking_time_to_next_min: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          dish_id: string
          id?: string
          order_index: number
          restaurant_id: string
          route_id: string
          time_override_min?: number | null
          title?: string | null
          walking_time_to_next_min?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          dish_id?: string
          id?: string
          order_index?: number
          restaurant_id?: string
          route_id?: string
          time_override_min?: number | null
          title?: string | null
          walking_time_to_next_min?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "route_stops_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "dishes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_stops_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_stops_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          blackout_dates: string[] | null
          capacity_per_slot: number | null
          created_at: string
          description: string
          duration_hours: number
          highlights: string[] | null
          id: string
          image_url: string | null
          is_active: boolean | null
          language: string | null
          location: string
          max_capacity: number
          name: string
          price_nok: number
          status: string | null
          updated_at: string
        }
        Insert: {
          blackout_dates?: string[] | null
          capacity_per_slot?: number | null
          created_at?: string
          description: string
          duration_hours: number
          highlights?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          language?: string | null
          location: string
          max_capacity?: number
          name: string
          price_nok: number
          status?: string | null
          updated_at?: string
        }
        Update: {
          blackout_dates?: string[] | null
          capacity_per_slot?: number | null
          created_at?: string
          description?: string
          duration_hours?: number
          highlights?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          language?: string | null
          location?: string
          max_capacity?: number
          name?: string
          price_nok?: number
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrease_available_spots: {
        Args: { schedule_id: string; spots_to_decrease: number }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
